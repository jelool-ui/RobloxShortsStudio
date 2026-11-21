import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chunkLine, buildAss, assTime, SPEAKER_COLORS } from '../pipeline/lib/subtitles.js';
import { verifyEpisode } from '../pipeline/generate.js';
import { assembleMp4 } from '../pipeline/lib/assemble.js';
import { generateStory } from '../src/story/generator.js';
import { buildStoryboard } from '../src/story/storyboard.js';
import { CHARACTER_IDS } from '../src/engine/characters.js';

const dir = mkdtempSync(join(tmpdir(), 'rss-final-'));
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);

test('temps ASS', () => {
  assert.equal(assTime(0), '0:00:00.00');
  assert.equal(assTime(61.255), '0:01:01.26');
  assert.equal(assTime(-1), '0:00:00.00');
});

test('sous-titres : groupes courts, mots dans l\'ordre, minutage continu dans la réplique', () => {
  const text = 'Ce n’est pas INTERRO… c’est INTER-RÉCRÉ ! Une récré en plus ! 📝';
  const chunks = chunkLine(text, 10, 14);
  const words = chunks.flatMap((c) => c.words.map((w) => w.word));
  assert.equal(words.join(' '), 'CE N’EST PAS INTERRO… C’EST INTER-RÉCRÉ ! UNE RÉCRÉ EN PLUS !');
  for (const c of chunks) {
    assert.ok(c.words.length <= 3);
    assert.ok(c.words.map((w) => w.word).join(' ').length <= 22, 'groupe court');
  }
  assert.equal(chunks[0].start, 10);
  assert.ok(Math.abs(chunks.at(-1).end - 14) < 1e-9);
  const all = chunks.flatMap((c) => c.words);
  for (let i = 1; i < all.length; i++) assert.ok(Math.abs(all[i].start - all[i - 1].end) < 1e-9);
});

test('sous-titres : une fin de phrase commence un nouveau groupe', () => {
  const chunks = chunkLine('Donc personne. Facile !', 0, 2);
  assert.equal(chunks[0].words.at(-1).word, 'PERSONNE.');
});

test('fichier ASS : structure, couleurs des personnages, titre, appel final, pas d\'emoji', () => {
  const story = generateStory({ seed: 8, template: 'interro-surprise' });
  const sb = buildStoryboard(story);
  const ass = buildAss(sb, story);
  assert.ok(ass.startsWith('[Script Info]'));
  assert.ok(ass.includes('PlayResX: 1080') && ass.includes('PlayResY: 1920'));
  assert.ok(ass.includes('Style: Sub,Lilita One'));
  const dialogues = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
  assert.ok(dialogues.length > sb.dialogue.length * 3);
  assert.ok(ass.includes('ABONNE-TOI'));
  assert.ok(!/[\p{Extended_Pictographic}‍]/u.test(ass), 'aucun emoji (la police ne les a pas)');
  for (const id of CHARACTER_IDS) assert.ok(SPEAKER_COLORS[id], `couleur pour ${id}`);
  // tous les événements finissent avant la fin de la vidéo
  for (const l of dialogues) {
    const end = l.split(',')[2];
    const [h, m, s] = end.split(':').map(Number);
    assert.ok(h * 3600 + m * 60 + s <= 45.001, l);
  }
});

function makeFrames(n, color = 'skyblue') {
  const fdir = join(dir, `frames-${color}-${n}`);
  execFileSync('mkdir', ['-p', fdir]);
  ff('-f', 'lavfi', '-i', `color=c=${color}:s=360x640:r=30`, '-frames:v', String(n), '-q:v', '5', join(fdir, '%05d.jpg'));
  return fdir;
}

test('montage + vérification finale : un épisode valide passe', () => {
  const frames = makeFrames(90);
  const audio = join(dir, 'a.wav');
  ff('-f', 'lavfi', '-i', 'sine=f=300:d=3', '-ar', '48000', '-ac', '2', audio);
  const ass = join(dir, 's.ass');
  const story = generateStory({ seed: 1 });
  const sb = { ...buildStoryboard(story), duration: 3 };
  sb.dialogue = [{ ...sb.dialogue[0], start: 0.5, end: 2.5 }];
  writeFileSync(ass, buildAss(sb, story));
  const mp4 = join(dir, 'ok.mp4');
  assembleMp4({ framesDir: frames, audioFile: audio, assFile: ass, fontsDir: 'assets/fonts', output: mp4, fps: 30, duration: 3 });
  const v = verifyEpisode(mp4, 3);
  assert.deepEqual(v.errors, []);
  assert.equal(v.info.video.width, 1080);
  assert.equal(v.info.video.height, 1920);
  assert.equal(v.info.frames, 90);
});

test('vérification finale : refuse une vidéo noire', () => {
  const frames = makeFrames(90, 'black');
  const audio = join(dir, 'b.wav');
  ff('-f', 'lavfi', '-i', 'sine=f=300:d=3', '-ar', '48000', '-ac', '2', audio);
  const ass = join(dir, 'empty.ass');
  writeFileSync(ass, '[Script Info]\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize\nStyle: Default,Lilita One,40\n\n[Events]\nFormat: Layer, Start, End, Style, Text\n');
  const mp4 = join(dir, 'black.mp4');
  assembleMp4({ framesDir: frames, audioFile: audio, assFile: ass, fontsDir: 'assets/fonts', output: mp4, fps: 30, duration: 3 });
  const v = verifyEpisode(mp4, 3);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes('noire')));
});

test('vérification finale : refuse une mauvaise durée, un fichier sans audio, un fichier absent', () => {
  const short = join(dir, 'short.mp4');
  ff('-f', 'lavfi', '-i', 'color=c=red:s=1080x1920:r=30:d=2', '-f', 'lavfi', '-i', 'sine=d=2', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-shortest', short);
  assert.equal(verifyEpisode(short, 45).ok, false);
  const mute = join(dir, 'mute.mp4');
  ff('-f', 'lavfi', '-i', 'color=c=red:s=1080x1920:r=30:d=2', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', mute);
  const v = verifyEpisode(mute, 2);
  assert.equal(v.ok, false);
  assert.ok(v.errors.includes('Piste audio absente'));
  assert.equal(verifyEpisode(join(dir, 'absent.mp4'), 45).ok, false);
  assert.ok(!existsSync(join(dir, 'absent.mp4')));
});

test('vérification finale : refuse une mauvaise cadence', () => {
  const f24 = join(dir, 'f24.mp4');
  ff('-f', 'lavfi', '-i', 'color=c=red:s=1080x1920:r=24:d=2', '-f', 'lavfi', '-i', 'sine=d=2', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-shortest', f24);
  const v = verifyEpisode(f24, 2);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes('cadence')));
});
