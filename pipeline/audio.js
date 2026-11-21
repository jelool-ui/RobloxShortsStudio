// Étape audio complète d'un épisode :
//   histoire → voix Piper → storyboard recalé sur les vraies durées → courbes de lip-sync
//   → musique + bruitages synthétisés → mixage → normalisation (−14 LUFS) → audio.wav
// Usage : node pipeline/audio.js [--seed 42] [--zone auto] [--template id] [--cast nino,zoe,max]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { generateStory, storyScript, DEFAULT_CAST } from '../src/story/generator.js';
import { buildStoryboard } from '../src/story/storyboard.js';
import { randomSeed } from '../src/story/rng.js';
import { ensureVoices } from './lib/voices.js';
import { synthesizeLines } from './lib/tts.js';
import { mouthCurve } from './lib/lipsync.js';
import { renderMusic, renderSfx, TEMPLATE_MOOD, SR } from './lib/synth.js';
import { mixTracks, loudnorm, writeMono } from './lib/mix.js';
import { probe } from './lib/verify.js';
import { rms } from './lib/wav.js';

export const FPS = 30;
const MAX_SPEED = 1.3;

/**
 * Produit l'audio et le storyboard définitif d'une histoire.
 * @returns {{ storyboard, audioFile, report }}
 */
export async function produceAudio(story, outDir, { log = console.log } = {}) {
  const audioDir = join(outDir, 'audio');
  rmSync(audioDir, { recursive: true, force: true });
  const linesDir = join(audioDir, 'lines');
  mkdirSync(linesDir, { recursive: true });

  const lines = story.steps.filter((s) => s.lineId).map((s) => ({ lineId: s.lineId, charId: story.cast[s.s], text: s.text }));
  const voicePaths = await ensureVoices(Object.values(story.cast), undefined, log);

  // 1) Voix, puis ajustement de vitesse tant que l'épisode dépasse 45 s
  let speed = 1, voices, storyboard;
  for (let attempt = 0; attempt < 4; attempt++) {
    voices = synthesizeLines(lines, voicePaths, linesDir, { speed });
    const lineDurations = Object.fromEntries(Object.entries(voices).map(([id, v]) => [id, v.duration]));
    storyboard = buildStoryboard(story, { lineDurations });
    log(`Voix (vitesse ×${speed.toFixed(2)}) : ${lines.length} répliques, parole ${Object.values(lineDurations).reduce((a, b) => a + b, 0).toFixed(1)} s, dépassement ${storyboard.overflow} s`);
    if (storyboard.overflow <= 0) break;
    const speech = Object.values(lineDurations).reduce((a, b) => a + b, 0);
    const next = Math.min(MAX_SPEED, speed * (speech / Math.max(1, speech - storyboard.overflow)) * 1.03);
    if (next <= speed + 1e-3) break;
    speed = next;
  }
  if (storyboard.overflow > 0) throw new Error(`Épisode trop long même en accélérant les voix (dépassement ${storyboard.overflow} s)`);

  // 2) Lip-sync : courbe d'ouverture de bouche pour chaque réplique
  for (const d of storyboard.dialogue) {
    const v = voices[d.lineId];
    d.curve = mouthCurve(v.samples, SR, FPS);
    d.fps = FPS;
    d.audio = `audio/lines/${d.lineId}.wav`;
  }

  // 3) Musique + bruitages
  const mood = TEMPLATE_MOOD[story.template] ?? 'happy';
  const music = renderMusic({ seed: story.seed, duration: storyboard.duration, mood });
  const sfx = storyboard.sfx.map((e, i) => ({ t: e.t, samples: renderSfx(e.name, story.seed + i), gain: e.name === 'whoosh' ? 0.35 : 0.45 }));
  writeMono(join(audioDir, 'music.wav'), music.data);

  // 4) Mixage + normalisation
  const { mix, voice } = mixTracks({
    duration: storyboard.duration,
    voices: storyboard.dialogue.map((d) => ({ start: d.start, samples: voices[d.lineId].samples })),
    sfx,
    music: music.data,
  });
  writeMono(join(audioDir, 'voice.wav'), voice);
  const raw = join(audioDir, 'mix-raw.wav');
  writeMono(raw, mix);
  const audioFile = join(audioDir, 'audio.wav');
  const ln = loudnorm(raw, audioFile);

  // 5) Vérifications : durée, présence de son, voix réellement présentes
  const info = probe(audioFile);
  const dur = Number(info.format.duration);
  const errors = [];
  if (Math.abs(dur - storyboard.duration) > 0.05) errors.push(`durée audio ${dur.toFixed(2)} s ≠ ${storyboard.duration} s`);
  if (rms(mix) < 0.01) errors.push('mixage quasi silencieux');
  for (const d of storyboard.dialogue) {
    const a = Math.round(d.start * SR), b = Math.round(d.end * SR);
    if (rms(voice, a, b) < 0.01) errors.push(`réplique ${d.lineId} silencieuse`);
    if (!d.curve.some((x) => x > 0.3)) errors.push(`lip-sync vide pour ${d.lineId}`);
  }
  if (errors.length) throw new Error(`Audio invalide :\n - ${errors.join('\n - ')}`);

  const report = {
    speed: Number(speed.toFixed(3)),
    lines: storyboard.dialogue.length,
    speechSeconds: Number(storyboard.dialogue.reduce((s, d) => s + d.end - d.start, 0).toFixed(2)),
    music: { mood, bpm: music.bpm },
    sfx: storyboard.sfx.map((e) => e.name),
    loudness: { measured: ln.measuredI, target: ln.targetI },
    duration: dur,
  };
  storyboard.audio = { file: 'audio/audio.wav', ...report };
  writeFileSync(join(outDir, 'storyboard.json'), JSON.stringify(storyboard));
  writeFileSync(join(outDir, 'story.json'), JSON.stringify(story, null, 2));
  return { storyboard, audioFile, report };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const seed = Number(arg('--seed', randomSeed()));
  const castArg = arg('--cast', null);
  const cast = castArg ? Object.fromEntries(castArg.split(',').map((id, i) => [['A', 'B', 'C'][i], id])) : DEFAULT_CAST;
  const story = generateStory({ seed, zone: arg('--zone', 'auto'), template: arg('--template', undefined), cast });
  const outDir = join('output/episodes', story.id);
  mkdirSync(outDir, { recursive: true });
  console.log(storyScript(story));
  const t0 = Date.now();
  try {
    const { audioFile, report } = await produceAudio(story, outDir);
    console.log(`\nAudio OK en ${((Date.now() - t0) / 1000).toFixed(1)} s → ${audioFile}`);
    console.log(JSON.stringify(report));
  } catch (e) {
    console.error(`\nÉCHEC audio : ${e.message}`);
    process.exit(1);
  }
}
