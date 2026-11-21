import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateStory, storyScript } from '../src/story/generator.js';
import { buildStoryboard, estimateLineDuration, cheatFace } from '../src/story/storyboard.js';
import { TEMPLATES, TEMPLATE_IDS } from '../src/story/templates.js';
import { createRng } from '../src/story/rng.js';
import { CLIPS } from '../src/engine/animation.js';
import { ZONE_IDS, resolveMark } from '../src/engine/sets/marks.js';
import { evaluateTrack } from '../src/engine/timeline.js';

const ZONE_MODES = ['auto', ...ZONE_IDS];

test('rng : reproductible et réparti', () => {
  const a = createRng(123), b = createRng(123);
  for (let i = 0; i < 50; i++) assert.equal(a.next(), b.next());
  const r = createRng(9);
  const vals = Array.from({ length: 1000 }, () => r.next());
  assert.ok(Math.min(...vals) >= 0 && Math.max(...vals) < 1);
  assert.ok(Math.abs(vals.reduce((s, v) => s + v, 0) / 1000 - 0.5) < 0.05);
});

test('même graine → même épisode ; graines différentes → épisodes variés', () => {
  assert.deepEqual(generateStory({ seed: 77 }), generateStory({ seed: 77 }));
  const ids = new Set(Array.from({ length: 30 }, (_, i) => generateStory({ seed: i + 1 }).template));
  assert.ok(ids.size >= 5, `scénarios tirés : ${[...ids]}`);
});

test('scénarios : structure valide (animations connues, rôles, marques)', () => {
  for (const t of TEMPLATES) {
    assert.ok(t.steps[0].zone, `${t.id} commence par un décor`);
    for (const st of t.steps) {
      if (st.s) assert.ok(['A', 'B', 'C'].includes(st.s));
      if (st.a) assert.ok(CLIPS[st.a], `${t.id} : animation ${st.a}`);
      for (const ra of Object.values(st.r || {})) assert.ok(CLIPS[ra], `${t.id} : réaction ${ra}`);
      for (const [, [type]] of Object.entries(st.mv || {})) assert.ok(['walk', 'run'].includes(type));
      for (const z of ZONE_IDS) {
        for (const m of Object.values(st.place || {})) resolveMark(z, m);
        for (const [, [, m]] of Object.entries(st.mv || {})) resolveMark(z, m);
      }
      for (const line of st.l || []) assert.ok(line.length <= 90, `${t.id} : réplique trop longue « ${line} »`);
    }
  }
});

test('tous les scénarios × décors × graines : 45 s exactement, sans dépassement, montage continu', () => {
  for (const template of TEMPLATE_IDS) {
    for (const zone of ZONE_MODES) {
      for (let seed = 1; seed <= 20; seed++) {
        const story = generateStory({ seed, zone, template });
        const sb = buildStoryboard(story);
        const tag = `${template}/${zone}/${seed}`;
        assert.equal(sb.duration, 45, tag);
        assert.equal(sb.overflow, 0, `${tag} dépasse`);
        // plans contigus de 0 à 45 s, tous assez longs
        assert.equal(sb.shots[0].start, 0, tag);
        assert.equal(sb.shots.at(-1).end, 45, tag);
        for (let i = 1; i < sb.shots.length; i++) assert.ok(Math.abs(sb.shots[i].start - sb.shots[i - 1].end) < 1e-6, `${tag} plan ${i}`);
        for (const s of sb.shots) assert.ok(s.end - s.start >= 0.6 - 1e-6 || s === sb.shots.at(-1), `${tag} plan trop court`);
        // répliques dans l'ordre, sans chevauchement, avant la fin
        for (let i = 1; i < sb.dialogue.length; i++) assert.ok(sb.dialogue[i].start >= sb.dialogue[i - 1].end - 1e-6, `${tag} répliques`);
        assert.ok(sb.dialogue.at(-1).end <= 45 - 2, `${tag} la dernière réplique laisse une fin`);
        assert.ok(sb.dialogue.length >= 8, `${tag} assez de dialogues`);
        // fin (rires) entre 2 et 7 s
        const outro = 45 - sb.shots.at(-1).start;
        assert.ok(outro >= 2 && outro <= 7.5, `${tag} fin de ${outro.toFixed(1)} s`);
        // le décor imposé est respecté
        if (zone !== 'auto') assert.deepEqual(sb.zones, [zone], tag);
      }
    }
  }
});

test('storyboard : les pistes sont jouables et les personnages restent dans leur zone', () => {
  const story = generateStory({ seed: 5, template: 'rumeur-pizza' });
  const sb = buildStoryboard(story);
  for (const [id, track] of Object.entries(sb.tracks)) {
    for (let f = 0; f < 45 * 30; f += 7) {
      const s = evaluateTrack(track, f / 30);
      assert.ok(Number.isFinite(s.x) && Number.isFinite(s.z), `${id} @${f}`);
      assert.ok(Math.abs(s.x) < 140 && Math.abs(s.z) < 140, `${id} reste dans le monde`);
    }
  }
});

test('storyboard : la durée réelle des voix est utilisée', () => {
  const story = generateStory({ seed: 3, template: 'sac-magique' });
  const first = story.steps.find((s) => s.lineId);
  const sb = buildStoryboard(story, { lineDurations: { [first.lineId]: 3.21 } });
  const d = sb.dialogue.find((x) => x.lineId === first.lineId);
  assert.ok(Math.abs(d.end - d.start - 3.21) < 1e-3);
});

test('storyboard : voix trop longues → étapes optionnelles retirées ou dépassement signalé', () => {
  const story = generateStory({ seed: 3, template: 'devoir-oublie' });
  const long = Object.fromEntries(story.steps.filter((s) => s.lineId).map((s) => [s.lineId, 4.5]));
  const sb = buildStoryboard(story, { lineDurations: long });
  assert.ok(sb.dropped.length > 0 || sb.overflow > 0);
  assert.equal(sb.shots.at(-1).end, 45);
});

test('distribution personnalisée et erreurs', () => {
  const s = generateStory({ seed: 1, cast: { A: 'max', B: 'nino', C: 'zoe' } });
  assert.equal(s.names.A, 'Max');
  assert.ok(storyScript(s).includes('Max'));
  assert.throws(() => generateStory({ seed: 1, cast: { A: 'max', B: 'max', C: 'zoe' } }));
  assert.throws(() => generateStory({ seed: 1, zone: 'piscine' }));
  assert.throws(() => generateStory({ seed: 1, template: 'inconnu' }));
  assert.throws(() => generateStory({}));
});

test('texte : prénoms remplacés, titre et description avec crédits', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const s = generateStory({ seed });
    for (const st of s.steps) if (st.text) assert.ok(!/[{}]/.test(st.text), st.text);
    assert.ok(!/[{}]/.test(s.title));
    assert.ok(s.description.includes('CC-BY'));
    assert.ok(s.description.includes('#shorts'));
  }
});

test('estimation de durée : plausible', () => {
  assert.ok(estimateLineDuration('Donc personne.') < 1.6);
  const long = estimateLineDuration('Ce n’est pas INTERRO… c’est INTER-RÉCRÉ ! Une récré en plus !');
  assert.ok(long > 3 && long < 6);
});

test('règle du théâtre : orientation ouverte vers la caméra', () => {
  const a = cheatFace([0, 0], [5, 0]); // regarde à droite (π/2)
  assert.ok(a > 0 && a < Math.PI / 2);
});

test('contournement : un trajet qui traverse quelqu\'un est dévié, sinon il reste droit', async () => {
  const { detour } = await import('../src/story/storyboard.js');
  assert.deepEqual(detour([0, 0], [10, 0], [[5, 8]]), [], 'personne sur le chemin');
  const via = detour([0, 0], [10, 0], [[5, 0]]);
  assert.equal(via.length, 1);
  assert.ok(Math.hypot(via[0][0] - 5, via[0][1]) >= 2.6, 'le point de passage est hors de portée');
  assert.ok(via[0][1] > 0, 'passe devant (côté caméra) quand l\'obstacle est pile sur la ligne');
  const via2 = detour([0, 0], [20, 0], [[5, 0.5], [15, -0.5]]);
  assert.ok(via2.length >= 2, 'deux obstacles → deux détours');
});

test('aucun personnage ne traverse un autre (tous scénarios × décors, image par image)', () => {
  for (const template of TEMPLATE_IDS) {
    for (const zone of ZONE_MODES) {
      for (let seed = 1; seed <= 5; seed++) {
        const sb = buildStoryboard(generateStory({ seed, zone, template }));
        const ids = Object.keys(sb.tracks);
        for (let f = 0; f < 45 * 30; f += 2) {
          const p = ids.map((id) => evaluateTrack(sb.tracks[id], f / 30));
          for (let i = 0; i < p.length; i++) {
            for (let j = i + 1; j < p.length; j++) {
              const d = Math.hypot(p[i].x - p[j].x, p[i].z - p[j].z);
              assert.ok(d >= 2.0, `${template}/${zone}/${seed} t=${(f / 30).toFixed(1)} : ${ids[i]} et ${ids[j]} à ${d.toFixed(2)}`);
            }
          }
        }
      }
    }
  }
});

// ---------------------------------------------------------------- cohérence des dialogues
// Défaut évité : une réponse qui ne correspond pas à la question (« Et une lampe de poche ? » →
// « Un parapluie, voilà ! »), parce que chaque réplique tirait sa variante indépendamment.
const coherenceWords = (t) => new Set(t.toLowerCase().replace(/\{[abc]\}/g, ' ').split(/[^\p{L}]+/u).filter((w) => w.length >= 5));

/** Mots présents dans CERTAINES variantes d'une réplique précédente (pas toutes) et repris plus loin. */
function unlinkedDependencies(tpl) {
  const found = [];
  const usedIndep = new Set();
  tpl.steps.forEach((sj, j) => {
    if (!sj.l) return;
    tpl.steps.slice(0, j).forEach((si, i) => {
      if (!si.l || si.l.length < 2 || (si.v && si.v === sj.v)) return;
      const sets = si.l.map(coherenceWords);
      const distinct = [...new Set(sets.flatMap((s) => [...s]))].filter((w) => !sets.every((s) => s.has(w)));
      for (const w of distinct) {
        if (!sj.l.some((l) => coherenceWords(l).has(w))) continue;
        if (sj.indep?.includes(w)) { usedIndep.add(`${j}:${w}`); continue; }
        found.push(`réplique ${j} « ${sj.l[0].slice(0, 45)}… » reprend « ${w} » de la réplique ${i} sans lui être liée (v)`);
      }
    });
  });
  return { found, usedIndep };
}

test('dialogues : les variantes liées (v) ont le même nombre de choix dans tout le groupe', () => {
  for (const t of TEMPLATES) {
    const sizes = {};
    for (const st of t.steps) {
      if (!st.v) continue;
      assert.ok(st.l, `${t.id} : « v » sur une étape sans réplique`);
      sizes[st.v] ??= st.l.length;
      assert.equal(st.l.length, sizes[st.v], `${t.id} : groupe « ${st.v} » de tailles différentes`);
    }
    for (const [g] of Object.entries(sizes)) {
      assert.ok(t.steps.filter((s) => s.v === g).length >= 2, `${t.id} : groupe « ${g} » utilisé une seule fois`);
    }
  }
});

test('dialogues : aucune réponse ne dépend d\'une variante précédente sans y être liée', () => {
  const problems = TEMPLATES.flatMap((t) => unlinkedDependencies(t).found.map((p) => `${t.id} : ${p}`));
  assert.deepEqual(problems, [], `\n${problems.join('\n')}\n→ liez les répliques (même « v ») ou, si c'est une simple coïncidence, ajoutez le mot dans « indep ».`);
});

test('dialogues : chaque mot déclaré « indep » correspond à une vraie reprise (pas d\'exception oubliée)', () => {
  for (const t of TEMPLATES) {
    const { usedIndep } = unlinkedDependencies(t);
    t.steps.forEach((st, j) => {
      for (const w of st.indep || []) assert.ok(usedIndep.has(`${j}:${w}`), `${t.id} : « ${w} » déclaré indep à la réplique ${j} mais inutile`);
    });
  }
});

test('dialogues générés : dans chaque épisode, les répliques liées utilisent bien la même variante', () => {
  for (const t of TEMPLATES) {
    for (let seed = 1; seed <= 40; seed++) {
      const story = generateStory({ seed, template: t.id });
      const names = story.names;
      const fill = (x) => x.replace(/\{([ABC])\}/g, (_, r) => names[r]);
      const chosen = {};
      let k = 0;
      t.steps.forEach((st) => {
        if (!st.l) return;
        const line = story.steps.filter((s) => s.lineId)[k++];
        if (!st.v) return;
        const idx = st.l.map(fill).indexOf(line.text);
        assert.ok(idx >= 0, `${t.id}/${seed} : réplique introuvable`);
        chosen[st.v] ??= idx;
        assert.equal(idx, chosen[st.v], `${t.id}/${seed} : groupe « ${st.v} » incohérent (« ${line.text} »)`);
      });
    }
  }
});

// ---------------------------------------------------------------- format compact des histoires
test('format compact : une histoire est convertie fidèlement', async () => {
  const { parseStories } = await import('../src/story/dsl.js');
  const [t] = parseStories(`
=== test-histoire | Mon test | mystery
titres: Titre un / Titre deux
# yard A:left B:center C:farRight
C.scared!scared mv:C=run>right r:A=surprise,B=laugh punch sfx:ding : Bonjour {A} ! || Salut {A} !
~1.2 sfx:buzz r:C=jump cam:closeup:C
A to:B opt : Une réplique simple.
`);
  assert.equal(t.id, 'test-histoire');
  assert.equal(t.label, 'Mon test');
  assert.equal(t.mood, 'mystery');
  assert.deepEqual(t.titles, ['Titre un', 'Titre deux']);
  assert.deepEqual(t.zones, ['yard']);
  assert.deepEqual(t.steps[0], { zone: 'yard', place: { A: 'left', B: 'center', C: 'farRight' } });
  assert.deepEqual(t.steps[1], { s: 'C', a: 'scared', e: 'scared', mv: { C: ['run', 'right'] }, r: { A: 'surprise', B: 'laugh' }, punch: true, sfx: 'ding', l: ['Bonjour {A} !', 'Salut {A} !'] });
  assert.deepEqual(t.steps[2], { hold: 1.2, sfx: 'buzz', r: { C: 'jump' }, cam: 'closeup:C' });
  assert.deepEqual(t.steps[3], { s: 'A', to: 'B', opt: true, l: ['Une réplique simple.'] });
});

test('format compact : les erreurs d\'écriture sont signalées avec la ligne', async () => {
  const { parseStories } = await import('../src/story/dsl.js');
  const base = '=== ok | Ok\ntitres: T\n# yard A:left B:center C:right\n';
  assert.throws(() => parseStories('=== Mauvais Id | X\ntitres: T\n# yard A:left'), /identifiant invalide/);
  assert.throws(() => parseStories(`${base}D.talk : Qui suis-je ?`), /rôle invalide/);
  assert.throws(() => parseStories(`${base}A.talk sans deux-points`), /« : » manquant/);
  assert.throws(() => parseStories(`${base}A mv:A=vole>left : Hop`), /déplacement invalide/);
  assert.throws(() => parseStories(`${base}A bizarre : Hop`), /option inconnue/);
  assert.throws(() => parseStories('=== sans-decor | X\ntitres: T\nA : Bonjour'), /doit commencer par un décor/);
  assert.throws(() => parseStories('=== sans-titre | X\n# yard A:left B:center C:right\nA : Bonjour'), /titres manquants/);
});

test('catalogue : au moins 100 histoires, identifiants uniques, libellés et titres présents', () => {
  assert.ok(TEMPLATES.length >= 100, `${TEMPLATES.length} histoires`);
  assert.equal(new Set(TEMPLATE_IDS).size, TEMPLATE_IDS.length, 'identifiants uniques');
  for (const t of TEMPLATES) {
    assert.ok(t.label && !/[{}]/.test(t.label), `${t.id} : libellé`);
    assert.ok(t.titles.length >= 1, `${t.id} : titres`);
    assert.ok(t.steps.filter((s) => s.l).length >= 8, `${t.id} : au moins 8 répliques`);
    if (t.mood) assert.ok(['happy', 'mystery'].includes(t.mood), `${t.id} : humeur ${t.mood}`);
  }
});
