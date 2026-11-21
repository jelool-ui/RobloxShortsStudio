// GÉNÉRATION COMPLÈTE D'UN ÉPISODE, sans aucune intervention :
//   histoire → storyboard → voix + lip-sync + musique + bruitages → rendu 3D → sous-titres
//   → montage MP4 → vérifications strictes → manifest.json
//
// Usage : node pipeline/generate.js [--seed 42] [--zone auto|hallway|classroom|yard]
//           [--template id] [--cast nino,zoe,max] [--quality fast|high] [--keep-frames]
// Code de sortie 0 uniquement si le MP4 existe ET passe toutes les vérifications.
import { mkdirSync, writeFileSync, rmSync, statSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateStory, storyScript, DEFAULT_CAST } from '../src/story/generator.js';
import { randomSeed } from '../src/story/rng.js';
import { produceAudio, FPS } from './audio.js';
import { renderFrames } from './lib/render.js';
import { buildAss } from './lib/subtitles.js';
import { assembleMp4, extractThumbnail, videoStats, meanLuma } from './lib/assemble.js';
import { verifyMp4 } from './lib/verify.js';

const W = 1080, H = 1920;

/** Vérifications finales : un épisode n'est « réussi » que si tout passe. */
export function verifyEpisode(mp4, duration) {
  const res = verifyMp4(mp4, { duration, tolerance: 0.1, width: W, height: H });
  const errors = [...res.errors];
  if (res.ok) {
    if (res.info.audio?.codec !== 'aac') errors.push(`codec audio ${res.info.audio?.codec} ≠ aac`);
    if (res.info.audio?.sampleRate !== 48000) errors.push(`fréquence audio ${res.info.audio?.sampleRate} ≠ 48000`);
    const vs = videoStats(mp4);
    res.info.frames = vs.frames;
    res.info.fps = vs.fps;
    if (Math.abs(vs.fps - FPS) > 0.01) errors.push(`cadence ${vs.fps} ≠ ${FPS} i/s`);
    if (Math.abs(vs.frames - duration * FPS) > 2) errors.push(`${vs.frames} images au lieu de ${duration * FPS}`);
    const lum = meanLuma(mp4, [1, duration / 2, duration - 1]);
    res.info.luma = lum.map((x) => Math.round(x));
    if (lum.some((l) => l < 12)) errors.push('image noire détectée');
  }
  return { ok: errors.length === 0, errors, info: res.info };
}

export async function generateEpisode({ seed = randomSeed(), zone = 'auto', template, cast = DEFAULT_CAST, quality = 'fast', keepFrames = false, outRoot = 'output/episodes', log = console.log } = {}) {
  const t0 = Date.now();
  const manifest = { status: 'running', seed, zone, template: template ?? null, quality, startedAt: new Date().toISOString(), steps: {}, errors: [] };
  let outDir = null;
  const save = () => outDir && writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const step = async (name, fn) => {
    const s = Date.now();
    manifest.steps[name] = { status: 'running' };
    save();
    try {
      const r = await fn();
      manifest.steps[name] = { status: 'ok', seconds: Number(((Date.now() - s) / 1000).toFixed(1)) };
      save();
      return r;
    } catch (e) {
      manifest.steps[name] = { status: 'failed', seconds: Number(((Date.now() - s) / 1000).toFixed(1)), error: e.message };
      throw new Error(`[${name}] ${e.message}`);
    }
  };

  try {
    // 1. Histoire
    const story = generateStory({ seed, zone, template, cast });
    outDir = join(outRoot, story.id);
    mkdirSync(outDir, { recursive: true });
    Object.assign(manifest, { id: story.id, title: story.title, template: story.template, cast: story.cast });
    manifest.steps.story = { status: 'ok' };
    save();
    log(`\n=== ${story.title} (${story.id}) ===`);
    log(storyScript(story));

    // 2. Audio (voix, storyboard définitif, lip-sync, musique, bruitages, mixage)
    log('\n[1/4] Voix, musique et bruitages…');
    const { storyboard, audioFile, report } = await step('audio', () => produceAudio(story, outDir, { log }));
    manifest.audio = report;

    // 3. Rendu 3D
    log(`\n[2/4] Rendu 3D (${Math.round(storyboard.duration * FPS)} images, qualité ${quality})…`);
    const framesDir = join(outDir, 'frames');
    const render = await step('render', () => renderFrames(storyboard, framesDir, { fps: FPS, quality, log }));
    manifest.render = { frames: render.frames, msPerFrame: Math.round(render.msPerFrame), resolution: `${render.width}x${render.height}` };
    log(`  ${render.frames} images en ${render.seconds.toFixed(0)} s (${Math.round(render.msPerFrame)} ms/image)`);

    // 4. Sous-titres + montage
    log('\n[3/4] Sous-titres et montage MP4…');
    const mp4 = join(outDir, 'episode.mp4');
    await step('assemble', () => {
      const assFile = join(outDir, 'subtitles.ass');
      writeFileSync(assFile, buildAss(storyboard, story));
      assembleMp4({ framesDir, audioFile, assFile, fontsDir: 'assets/fonts', output: mp4, fps: FPS, duration: storyboard.duration });
      const punch = storyboard.punches[0] ?? 3;
      extractThumbnail(mp4, Math.min(storyboard.duration - 1, punch + 0.3), join(outDir, 'thumbnail.jpg'));
      writeFileSync(join(outDir, 'youtube.txt'), `TITRE :\n${story.title}\n\nDESCRIPTION :\n${story.description}\n`);
    });

    // 5. Vérifications strictes
    log('\n[4/4] Vérification du MP4…');
    const check = await step('verify', () => {
      const v = verifyEpisode(mp4, storyboard.duration);
      if (!v.ok) throw new Error(v.errors.join(' ; '));
      return v;
    });
    manifest.video = { ...check.info, sizeMB: Number((statSync(mp4).size / 1e6).toFixed(2)) };

    if (!keepFrames) rmSync(framesDir, { recursive: true, force: true });
    manifest.status = 'success';
    manifest.files = { mp4: 'episode.mp4', thumbnail: 'thumbnail.jpg', subtitles: 'subtitles.ass', youtube: 'youtube.txt', audio: 'audio/audio.wav' };
    manifest.seconds = Number(((Date.now() - t0) / 1000).toFixed(1));
    manifest.finishedAt = new Date().toISOString();
    save();
    log(`\nSUCCÈS : ${mp4} (${manifest.video.sizeMB} Mo, ${check.info.duration.toFixed(2)} s, ${check.info.frames} images, audio ${check.info.audio.codec} ${check.info.audio.sampleRate} Hz) en ${manifest.seconds} s`);
    return { ok: true, outDir, mp4, manifest };
  } catch (e) {
    manifest.status = 'failed';
    manifest.errors.push(e.message);
    manifest.seconds = Number(((Date.now() - t0) / 1000).toFixed(1));
    manifest.finishedAt = new Date().toISOString();
    if (outDir) {
      // Un MP4 invalide ne doit jamais être pris pour un épisode réussi
      const mp4 = join(outDir, 'episode.mp4');
      if (existsSync(mp4)) copyFileSync(mp4, join(outDir, 'episode.INVALIDE.mp4')), rmSync(mp4);
      save();
    }
    log(`\nÉCHEC de la génération : ${e.message}`);
    return { ok: false, outDir, manifest };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const castArg = arg('--cast', null);
  const res = await generateEpisode({
    seed: Number(arg('--seed', randomSeed())),
    zone: arg('--zone', 'auto'),
    template: arg('--template', undefined) || undefined,
    cast: castArg ? Object.fromEntries(castArg.split(',').map((id, i) => [['A', 'B', 'C'][i], id])) : DEFAULT_CAST,
    quality: arg('--quality', 'fast'),
    keepFrames: args.includes('--keep-frames'),
  });
  process.exit(res.ok ? 0 : 1);
}
