import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guessRepo, createClient, parseRelease, parseRun, GitHubError } from '../src/ui/github.js';
import { STORIES, ZONES, CAST, ROLES } from '../src/ui/catalog.js';
import { TEMPLATE_IDS } from '../src/story/templates.js';
import { ZONE_IDS } from '../src/engine/sets/marks.js';

test('dépôt deviné depuis l\'adresse GitHub Pages', () => {
  assert.equal(guessRepo({ hostname: 'alice.github.io', pathname: '/RobloxShortsStudio/' }), 'alice/RobloxShortsStudio');
  assert.equal(guessRepo({ hostname: 'localhost', pathname: '/' }), '');
});

test('les menus du workflow correspondent exactement au code (décors, histoires, distributions)', () => {
  const yml = readFileSync('.github/workflows/generate.yml', 'utf8');
  const opts = (name) => {
    const block = yml.split(`      ${name}:`)[1].split(/\n      \w+:/)[0];
    const inline = block.match(/options: \[([^\]]*)\]/);
    if (inline) return inline[1].split(',').map((s) => s.trim());
    return [...block.matchAll(/- "([^"]+)"/g)].map((m) => m[1]);
  };
  assert.deepEqual(opts('zone'), ['auto', ...ZONE_IDS]);
  assert.deepEqual(opts('template'), ['auto', ...TEMPLATE_IDS]);
  assert.deepEqual(STORIES.map((s) => s.id), ['auto', ...TEMPLATE_IDS]);
  assert.deepEqual(ZONES.map((z) => z.id), ['auto', ...ZONE_IDS]);
  // les 6 distributions possibles (permutations des 3 personnages)
  const casts = opts('cast');
  assert.equal(casts.length, 6);
  assert.equal(new Set(casts).size, 6);
  for (const c of casts) assert.deepEqual(c.split(',').sort(), CAST.map((x) => x.id).sort());
  assert.equal(ROLES.length, 3);
});

function fakeFetch(routes) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, init });
    for (const [re, res] of routes) {
      if (re.test(url)) {
        const r = typeof res === 'function' ? res(url, init) : res;
        return { ok: r.status < 400, status: r.status, json: async () => r.body ?? {} };
      }
    }
    return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
  };
  fn.calls = calls;
  return fn;
}

test('lancement : appel workflow_dispatch avec jeton, branche main et identifiant de demande', async () => {
  const f = fakeFetch([[/dispatches$/, { status: 204 }]]);
  const c = createClient({ token: 'github_pat_X', repo: 'a/b' }, f);
  const id = await c.dispatch({ zone: 'yard', template: 'auto', cast: 'nino,zoe,max', quality: 'fast', seed: '' });
  assert.match(id, /^rq/);
  const call = f.calls[0];
  assert.equal(call.url, 'https://api.github.com/repos/a/b/actions/workflows/generate.yml/dispatches');
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.headers.Authorization, 'Bearer github_pat_X');
  const body = JSON.parse(call.init.body);
  assert.equal(body.ref, 'main');
  assert.equal(body.inputs.request_id, id);
  assert.equal(body.inputs.zone, 'yard');
});

test('erreurs GitHub traduites en messages clairs', async () => {
  const c = createClient({ token: 'bad', repo: 'a/b' }, fakeFetch([[/./, { status: 401, body: { message: 'Bad credentials' } }]]));
  await assert.rejects(c.check(), (e) => e instanceof GitHubError && e.status === 401 && /Jeton refusé/.test(e.message));
  const c2 = createClient({ token: 't', repo: 'a/b' }, async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(c2.runs(), /Pas de connexion/);
  assert.throws(() => createClient({ token: 't', repo: 'pas un dépôt' }), /Dépôt invalide/);
});

test('le jeton n\'est envoyé qu\'à api.github.com', async () => {
  const f = fakeFetch([[/releases/, { status: 200, body: [] }], [/runs/, { status: 200, body: { workflow_runs: [] } }]]);
  const c = createClient({ token: 'github_pat_SECRET', repo: 'a/b' }, f);
  await c.episodes();
  await c.runs();
  for (const call of f.calls) assert.ok(call.url.startsWith('https://api.github.com/'), call.url);
});

test('release → épisode de la bibliothèque (titre, description YouTube, liens)', () => {
  const ep = parseRelease({
    id: 1, tag_name: 'ep-x-r3', name: 'Le sac magique 🎒', published_at: '2026-11-21T10:00:00Z', html_url: 'https://github.com/a/b/releases/tag/ep-x-r3',
    body: 'TITRE :\nLe sac magique 🎒\n\nDESCRIPTION :\nLigne 1\nLigne 2\n#shorts\n\n---\nrequest_id: rq42\nrun: https://github.com/a/b/actions/runs/987',
    assets: [{ name: 'episode.mp4', size: 17_800_000, browser_download_url: 'https://x/e.mp4' }, { name: 'thumbnail.jpg', size: 1, browser_download_url: 'https://x/t.jpg' }],
  });
  assert.equal(ep.title, 'Le sac magique 🎒');
  assert.equal(ep.youtubeTitle, 'Le sac magique 🎒');
  assert.equal(ep.youtubeDescription, 'Ligne 1\nLigne 2\n#shorts');
  assert.equal(ep.requestId, 'rq42');
  assert.equal(ep.runUrl, 'https://github.com/a/b/actions/runs/987');
  assert.equal(ep.mp4, 'https://x/e.mp4');
  assert.equal(ep.sizeMB, 17.8);
  assert.equal(parseRelease({ id: 2, assets: [] }), null, 'une release sans MP4 est ignorée');
});

test('exécution → historique (titre de l\'exécution décodé)', () => {
  const r = parseRun({ id: 5, run_number: 9, display_title: '🎬 concours-saut · yard · rq77', status: 'in_progress', conclusion: null, created_at: 'x', html_url: 'u' });
  assert.equal(r.template, 'concours-saut');
  assert.equal(r.zone, 'yard');
  assert.equal(r.requestId, 'rq77');
  assert.equal(parseRun({ id: 6, display_title: '🎬 auto · auto · 12' }).requestId, null);
});
