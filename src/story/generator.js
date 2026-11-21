// Générateur d'histoires 100 % local (aucune API) : graine → épisode.
import { createRng } from './rng.js';
import { TEMPLATES } from './templates.js';
import { CHARACTERS } from '../engine/characters.js';
import { ZONE_IDS } from '../engine/sets/marks.js';

export const DEFAULT_CAST = { A: 'nino', B: 'zoe', C: 'max' };

export const VOICE_CREDITS = [
  'Voix : Piper TTS (MIT) — modèles « siwis » (CC-BY 4.0, SIWIS database, Univ. of Edinburgh),',
  '« upmc » (CC-BY-SA 4.0, MaryTTS / UPMC) et « gilles » (CC0).',
];

function fill(text, names) {
  return text.replace(/\{([ABC])\}/g, (_, r) => names[r]);
}

/**
 * @param {object} opts
 * @param {number} opts.seed
 * @param {'auto'|'hallway'|'classroom'|'yard'} [opts.zone]  décor imposé (sinon celui du scénario)
 * @param {{A:string,B:string,C:string}} [opts.cast]           personnage pour chaque rôle
 * @param {string} [opts.template]                             scénario imposé
 */
export function generateStory({ seed, zone = 'auto', cast = DEFAULT_CAST, template } = {}) {
  if (seed == null) throw new Error('Graine (seed) obligatoire');
  const rng = createRng(seed);
  for (const r of ['A', 'B', 'C']) {
    if (!CHARACTERS[cast[r]]) throw new Error(`Personnage inconnu pour le rôle ${r} : ${cast[r]}`);
  }
  if (new Set(Object.values(cast)).size !== 3) throw new Error('Les 3 rôles doivent être tenus par 3 personnages différents');
  if (zone !== 'auto' && !ZONE_IDS.includes(zone)) throw new Error(`Décor inconnu : ${zone}`);

  // Choix du scénario : imposé, sinon tiré au sort (en préférant ceux qui se passent dans le décor demandé)
  let tpl;
  if (template) {
    tpl = TEMPLATES.find((t) => t.id === template);
    if (!tpl) throw new Error(`Scénario inconnu : ${template}`);
  } else {
    const fitting = zone === 'auto' ? TEMPLATES : TEMPLATES.filter((t) => t.zones.includes(zone));
    tpl = rng.pick(fitting.length ? fitting : TEMPLATES);
  }

  const names = { A: CHARACTERS[cast.A].name, B: CHARACTERS[cast.B].name, C: CHARACTERS[cast.C].name };
  let lineNo = 0;
  const linked = {}; // groupe de variantes liées → indice tiré une seule fois (question/réponse cohérentes)
  const steps = tpl.steps.map((st) => {
    const step = { ...st };
    if (step.zone && zone !== 'auto') step.zone = zone;
    if (step.l) {
      let idx;
      if (step.v) {
        if (linked[step.v] == null) linked[step.v] = Math.floor(rng.next() * step.l.length);
        idx = linked[step.v];
      } else idx = Math.floor(rng.next() * step.l.length);
      step.text = fill(step.l[idx], names);
      delete step.v;
      delete step.indep;
      step.lineId = `l${String(++lineNo).padStart(2, '0')}`;
      delete step.l;
    }
    return step;
  });

  const title = fill(rng.pick(tpl.titles), names);
  const id = `ep-${tpl.id}-${seed}`;
  const description = [
    `${title}`,
    '',
    `Avec ${names.A}, ${names.B} et ${names.C}. Épisode généré automatiquement par RobloxShortsStudio.`,
    '',
    ...VOICE_CREDITS,
    'Musique et bruitages : générés procéduralement par RobloxShortsStudio.',
    '',
    '#shorts #animation #école #humour',
  ].join('\n');

  return {
    id,
    seed,
    template: tpl.id,
    title,
    description,
    zoneMode: zone,
    cast: { ...cast },
    names,
    steps,
  };
}

/** Le script lisible (pour l'interface et les journaux). */
export function storyScript(story) {
  const out = [`# ${story.title}`];
  for (const st of story.steps) {
    if (st.zone) out.push(`\n[${st.zone.toUpperCase()}]`);
    if (st.text) out.push(`${story.names[st.s]} : ${st.text}`);
    else if (st.hold) out.push(`(…)`);
  }
  return out.join('\n');
}
