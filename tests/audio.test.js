import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readWav, writeWav, trimSilence, rms } from '../pipeline/lib/wav.js';
import { mouthCurve } from '../pipeline/lib/lipsync.js';
import { renderMusic, renderSfx, SFX, SR } from '../pipeline/lib/synth.js';
import { mixTracks, loudnorm } from '../pipeline/lib/mix.js';
import { speakable } from '../pipeline/lib/tts.js';
import { probe } from '../pipeline/lib/verify.js';
import { CHARACTERS } from '../src/engine/characters.js';
import { VOICE_PATHS } from '../pipeline/lib/voices.js';

const dir = mkdtempSync(join(tmpdir(), 'rss-audio-'));
const tone = (sec, f = 220, amp = 0.5) => Float32Array.from({ length: Math.round(sec * SR) }, (_, i) => Math.sin((2 * Math.PI * f * i) / SR) * amp);
const silence = (sec) => new Float32Array(Math.round(sec * SR));
const concat = (...arrs) => { const out = new Float32Array(arrs.reduce((s, a) => s + a.length, 0)); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };

test('WAV : écriture puis lecture identiques (à la quantification près)', () => {
  const f = join(dir, 't.wav');
  const data = tone(0.2);
  writeWav(f, SR, data);
  const r = readWav(f);
  assert.equal(r.sampleRate, SR);
  assert.equal(r.data.length, data.length);
  for (let i = 0; i < data.length; i += 97) assert.ok(Math.abs(r.data[i] - data[i]) < 1e-3);
});

test('silences retirés au début et à la fin', () => {
  const d = concat(silence(0.5), tone(1), silence(0.7));
  const t = trimSilence(d, SR);
  assert.ok(t.length / SR > 1 && t.length / SR < 1.15, `${t.length / SR}`);
});

test('lip-sync : bouche fermée dans le silence, ouverte quand on parle, une valeur par image', () => {
  const d = concat(silence(0.5), tone(1, 200, 0.6), silence(0.5));
  const c = mouthCurve(d, SR, 30);
  assert.equal(c.length, 60);
  assert.ok(Math.max(...c.slice(2, 12)) < 0.1, 'silence initial');
  assert.ok(Math.max(...c.slice(20, 40)) > 0.8, 'pendant le son');
  assert.ok(c.at(-1) === 0, 'se referme à la fin');
  assert.ok(c.every((v) => v >= 0 && v <= 1));
});

test('lip-sync : indépendant du volume de la voix', () => {
  const loud = mouthCurve(tone(1, 200, 0.8), SR, 30);
  const soft = mouthCurve(tone(1, 200, 0.08), SR, 30);
  assert.ok(Math.abs(loud[15] - soft[15]) < 0.05);
});

test('texte prononçable : emoji, apostrophes, majuscules accentuées', () => {
  assert.equal(speakable('Ce n’est pas INTERRO… c’est INTER-RÉCRÉ ! 📝'), "Ce n'est pas interro... c'est inter-récré !");
  assert.equal(speakable('Une ABEILLE !'), 'Une abeille !');
  assert.equal(speakable('Zoé et Max'), 'Zoé et Max', 'les prénoms restent intacts');
  assert.equal(speakable('À ton tour ! Vas-y !'), 'À ton tour ! Vas-i !', '« vas-y » non épelé');
  assert.equal(speakable('Allez-y.'), 'Allez-i.');
  assert.equal(speakable('Il y a un fantôme'), 'Il y a un fantôme', '« il y a » intact');
});

test('bruitages : tous générés, non vides, sans saturation, déterministes', () => {
  for (const name of Object.keys(SFX)) {
    const a = renderSfx(name, 3), b = renderSfx(name, 3);
    assert.ok(a.length > SR * 0.05, name);
    assert.ok(rms(a) > 0.01, `${name} audible`);
    assert.ok(a.every((v) => Number.isFinite(v) && Math.abs(v) <= 1.2), `${name} propre`);
    assert.deepEqual(a, b, `${name} déterministe`);
  }
  assert.throws(() => renderSfx('explosion'));
});

test('musique : bonne durée, audible, fondu final, déterministe, varie avec la graine', () => {
  const m = renderMusic({ seed: 5, duration: 10 });
  assert.equal(m.data.length, 10 * SR);
  assert.ok(rms(m.data) > 0.02);
  assert.ok(rms(m.data, m.data.length - 2000) < rms(m.data) * 0.2, 'fondu de fin');
  assert.ok(m.data.every(Number.isFinite));
  assert.deepEqual(renderMusic({ seed: 5, duration: 2 }).data, renderMusic({ seed: 5, duration: 2 }).data);
  const other = renderMusic({ seed: 6, duration: 2 });
  assert.notDeepEqual(other.data, renderMusic({ seed: 5, duration: 2 }).data);
  assert.ok(renderMusic({ seed: 1, duration: 2, mood: 'mystery' }).data.length === 2 * SR);
});

test('mixage : la musique baisse pendant les voix, pas de saturation', () => {
  const music = tone(4, 440, 0.5);
  const { mix, duck } = mixTracks({ duration: 4, voices: [{ start: 2, samples: tone(1, 180, 0.6) }], sfx: [], music });
  assert.equal(mix.length, 4 * SR);
  assert.ok(duck[Math.round(1 * SR)] > 0.95, 'musique pleine avant la voix');
  assert.ok(duck[Math.round(2.5 * SR)] < 0.5, 'musique baissée pendant la voix');
  assert.ok(mix.every((v) => Math.abs(v) <= 1));
});

test('normalisation du volume (FFmpeg 2 passes) → WAV stéréo 48 kHz même durée', () => {
  const src = join(dir, 'raw.wav'), out = join(dir, 'norm.wav');
  writeWav(src, SR, concat(tone(2, 300, 0.1), tone(2, 500, 0.2)));
  loudnorm(src, out);
  const info = probe(out);
  const a = info.streams[0];
  assert.equal(Number(a.sample_rate), 48000);
  assert.equal(a.channels, 2);
  assert.ok(Math.abs(Number(info.format.duration) - 4) < 0.02);
});

test('chaque personnage a sa propre voix répertoriée', () => {
  for (const c of Object.values(CHARACTERS)) assert.ok(VOICE_PATHS[c.voice.model], c.id);
  assert.equal(new Set(Object.values(CHARACTERS).map((c) => `${c.voice.model}/${c.voice.speaker}`)).size, 3);
});
