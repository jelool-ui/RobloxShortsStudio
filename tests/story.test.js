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
