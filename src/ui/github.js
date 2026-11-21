// Client minimal de l'API GitHub pour le tableau de bord.
// Le jeton personnel (fine-grained, limité à ce dépôt) est stocké UNIQUEMENT dans le navigateur
// de l'utilisateur (localStorage). Il n'est jamais envoyé ailleurs qu'à api.github.com.
const API = 'https://api.github.com';
export const WORKFLOW = 'generate.yml';
const LS = { token: 'rss.token', repo: 'rss.repo' };

const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* stockage indisponible */ } };

/** Dépôt deviné depuis l'adresse GitHub Pages (https://<owner>.github.io/<repo>/). */
export function guessRepo(loc = globalThis.location) {
  const host = loc?.hostname ?? '';
  const m = host.match(/^([a-z0-9-]+)\.github\.io$/i);
  const repo = (loc?.pathname ?? '').split('/').filter(Boolean)[0];
  return m && repo ? `${m[1]}/${repo}` : '';
}

export function loadConfig() {
  return { token: safeGet(LS.token) || '', repo: safeGet(LS.repo) || guessRepo() };
}
export function saveConfig({ token, repo }) {
  if (token !== undefined) safeSet(LS.token, token || null);
  if (repo !== undefined) safeSet(LS.repo, repo || null);
}

export class GitHubError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function createClient({ token, repo }, fetchImpl = globalThis.fetch.bind(globalThis)) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '')) throw new GitHubError(0, 'Dépôt invalide (format attendu : propriétaire/nom)');
  const base = `${API}/repos/${repo}`;

  async function call(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetchImpl(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw new GitHubError(0, 'Pas de connexion à GitHub (réseau ?)');
    }
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = {
        401: 'Jeton refusé (expiré ou mal copié)',
        403: 'Accès refusé : le jeton doit avoir la permission « Actions : lecture et écriture » sur ce dépôt',
        404: 'Dépôt ou workflow introuvable (vérifiez le nom du dépôt et que le jeton y a accès)',
        422: `Requête refusée par GitHub : ${data.message ?? ''}`,
      }[res.status] ?? `Erreur GitHub ${res.status} : ${data.message ?? ''}`;
      throw new GitHubError(res.status, msg);
    }
    return data;
  }

  return {
    repo,
    /** Vérifie le jeton et l'accès au dépôt. */
    async check() {
      const r = await call('');
      return { name: r.full_name, private: r.private, defaultBranch: r.default_branch };
    },
    /** Lance une génération. Retourne l'identifiant de demande (pour retrouver l'exécution). */
    async dispatch(inputs, ref = 'main') {
      const request_id = `rq${Date.now().toString(36)}`;
      await call(`/actions/workflows/${WORKFLOW}/dispatches`, { method: 'POST', body: { ref, inputs: { ...inputs, request_id } } });
      return request_id;
    },
    async runs() {
      const d = await call(`/actions/workflows/${WORKFLOW}/runs?per_page=30`);
      return (d.workflow_runs || []).map(parseRun);
    },
    /** Messages d'erreur d'une exécution échouée (annotations « ::error:: »). */
    async runErrors(runId) {
      const jobs = await call(`/actions/runs/${runId}/jobs`);
      const out = [];
      for (const j of jobs.jobs || []) {
        const ann = await call(`/check-runs/${j.id}/annotations`).catch(() => []);
        for (const a of ann) if (a.annotation_level === 'failure' && !/Process completed with exit code/.test(a.message)) out.push(a.message);
      }
      return [...new Set(out)];
    },
    async episodes() {
      const d = await call('/releases?per_page=50', { auth: Boolean(token) });
      return (d || []).map(parseRelease).filter(Boolean);
    },
    async cancel(runId) {
      await call(`/actions/runs/${runId}/cancel`, { method: 'POST' });
    },
  };
}

/** « 🎬 concours-saut · yard · rq123 » → infos lisibles. */
export function parseRun(r) {
  const parts = (r.display_title || '').replace(/^🎬\s*/, '').split(' · ');
  return {
    id: r.id,
    number: r.run_number,
    template: parts[0] || 'auto',
    zone: parts[1] || 'auto',
    requestId: parts[2]?.startsWith('rq') ? parts[2] : null,
    status: r.status, // queued | in_progress | completed
    conclusion: r.conclusion, // success | failure | cancelled | null
    createdAt: r.created_at,
    startedAt: r.run_started_at || r.created_at,
    updatedAt: r.updated_at,
    url: r.html_url,
  };
}

/** Release publiée par le workflow → épisode de la bibliothèque. */
export function parseRelease(rel) {
  const asset = (name) => rel.assets?.find((a) => a.name === name);
  const mp4 = asset('episode.mp4');
  if (!mp4) return null;
  const body = rel.body || '';
  const pick = (re) => (body.match(re)?.[1] ?? '').trim();
  return {
    id: rel.id,
    tag: rel.tag_name,
    title: rel.name || rel.tag_name,
    date: rel.published_at || rel.created_at,
    mp4: mp4.browser_download_url,
    sizeMB: Math.round((mp4.size / 1e6) * 10) / 10,
    thumbnail: asset('thumbnail.jpg')?.browser_download_url ?? null,
    youtubeTitle: pick(/TITRE :\s*\n([^\n]+)/),
    youtubeDescription: pick(/DESCRIPTION :\s*\n([\s\S]*?)\n---/),
    requestId: pick(/request_id:\s*(\S*)/) || null,
    runUrl: pick(/run:\s*(\S+)/) || null,
    url: rel.html_url,
  };
}
