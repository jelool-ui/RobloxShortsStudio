// Musique et bruitages 100 % synthétisés (aucun fichier externe → aucun problème de licence).
// Tout est déterministe : même graine → même musique.
import { createRng } from '../../src/story/rng.js';

export const SR = 48000;
const TAU = Math.PI * 2;

const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);
const lp = (fc) => 1 - Math.exp((-TAU * fc) / SR);

// ------------------------------------------------------------------ BRUITAGES
function buf(sec) { return new Float32Array(Math.round(sec * SR)); }

export const SFX = {
  boing(rng) {
    const out = buf(0.55);
    let ph = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const f = 160 + 520 * t + 70 * Math.sin(TAU * 13 * t) * Math.exp(-2 * t);
      ph += (TAU * f) / SR;
      out[i] = Math.sin(ph) * Math.exp(-5 * t) * Math.min(1, t * 200) * 0.8;
    }
    return out;
  },
  pop(rng) {
    const out = buf(0.12);
    let ph = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      ph += (TAU * (1000 * Math.exp(-25 * t) + 250)) / SR;
      out[i] = (Math.sin(ph) * 0.9 + (rng.next() * 2 - 1) * 0.15 * Math.exp(-200 * t)) * Math.exp(-30 * t);
    }
    return out;
  },
  buzz(rng) {
    const out = buf(0.9);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const saw = ((t * 150) % 1) * 2 - 1;
      const saw2 = ((t * 301) % 1) * 2 - 1;
      const am = 0.6 + 0.4 * Math.sin(TAU * 28 * t);
      const env = Math.min(1, t * 30) * Math.min(1, (0.9 - t) * 10);
      out[i] = (saw * 0.5 + saw2 * 0.25) * am * env * 0.5;
    }
    return out;
  },
  whoosh(rng) {
    const out = buf(0.55);
    let y1 = 0, y2 = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const fc = 300 + 3500 * Math.sin(Math.PI * Math.min(1, t / 0.55));
      const n = rng.next() * 2 - 1;
      y1 += lp(fc) * (n - y1);
      y2 += lp(fc * 0.3) * (y1 - y2);
      out[i] = (y1 - y2) * Math.sin(Math.PI * Math.min(1, t / 0.55)) ** 2 * 1.4;
    }
    return out;
  },
  ding(rng) {
    const out = buf(1.4);
    const f = 1046.5;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = (Math.sin(TAU * f * t) * Math.exp(-3 * t) * 0.5
        + Math.sin(TAU * f * 2.76 * t) * Math.exp(-6 * t) * 0.25
        + Math.sin(TAU * f * 5.4 * t) * Math.exp(-10 * t) * 0.12) * Math.min(1, t * 500);
    }
    return out;
  },
  sting(rng) {
    const out = buf(1.1);
    const notes = [57, 60, 63, 66].map(midiHz); // accord diminué : effet « oh non ! »
    let y = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      let s = 0;
      for (const f of notes) s += ((t * f) % 1) * 2 - 1;
      y += lp(1800 * Math.exp(-1.5 * t) + 300) * (s / notes.length - y);
      out[i] = y * Math.exp(-2.2 * t) * Math.min(1, t * 300) * (0.8 + 0.2 * Math.sin(TAU * 7 * t)) * 0.9;
    }
    return out;
  },
};

export function renderSfx(name, seed = 1) {
  const fn = SFX[name];
  if (!fn) throw new Error(`Bruitage inconnu : ${name}`);
  return fn(createRng(seed));
}

// ------------------------------------------------------------------ MUSIQUE
// Ambiances : chaque scénario peut choisir son humeur (gai / mystère).
const MOODS = {
  happy: { scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], bpm: [112, 126] },
  mystery: { scale: [0, 2, 3, 5, 7, 8, 10], prog: [[0, 3, 7], [8, 12, 15], [3, 7, 10], [10, 14, 17]], bpm: [100, 112] },
};
export const TEMPLATE_MOOD = { 'casier-fantome': 'mystery' };

/**
 * @returns Float32Array (mono, SR) de `duration` secondes, avec fondu final.
 */
export function renderMusic({ seed = 1, duration = 45, mood = 'happy' } = {}) {
  const rng = createRng(seed * 7919 + 13);
  const M = MOODS[mood] ?? MOODS.happy;
  const bpm = rng.int(M.bpm[0], M.bpm[1]);
  const beat = 60 / bpm;
  const bar = beat * 4;
  const root = 48 + rng.int(-3, 4); // tonalité (do ± quelques demi-tons)
  const out = new Float32Array(Math.round(duration * SR));

  // Motif mélodique de 2 mesures (8 croches × 2), répété → mélodie accrocheuse
  const rhythm = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0].map((x) => (x && rng.chance(0.85) ? 1 : 0));
  const motif = rhythm.map(() => rng.int(0, 4)); // degré dans l'accord / la gamme
  const melodyOn = (barIdx) => barIdx >= 2 && barIdx % 8 < 6;

  const add = (start, len, fn) => {
    const a = Math.max(0, Math.floor(start * SR));
    const b = Math.min(out.length, Math.floor((start + len) * SR));
    for (let i = a; i < b; i++) out[i] += fn((i - a) / SR, i);
  };
  const noise = createRng(seed + 99);

  const nBars = Math.ceil(duration / bar);
  for (let b = 0; b < nBars; b++) {
    const t0 = b * bar;
    const chord = M.prog[b % 4].map((n) => root + n);
    // Nappe douce (accord)
    for (const n of chord) {
      const f = midiHz(n + 12);
      add(t0, bar, (t) => (((t * f) % 1) < 0.5 ? 1 : -1) * 0.025 * Math.min(1, t * 8) * Math.min(1, (bar - t) * 8));
    }
    // Basse (croches qui rebondissent)
    for (let k = 0; k < 8; k++) {
      const n = chord[0] - 12 + (k % 4 === 3 ? 7 : 0);
      const f = midiHz(n);
      add(t0 + k * beat / 2, beat / 2, (t) => (2 * Math.abs(((t * f) % 1) * 2 - 1) - 1) * 0.16 * Math.exp(-6 * t));
    }
    // Arpège
    for (let k = 0; k < 8; k++) {
      const f = midiHz(chord[k % 3] + 24);
      add(t0 + k * beat / 2, beat / 2, (t) => (((t * f) % 1) < 0.25 ? 1 : -1) * 0.035 * Math.exp(-12 * t));
    }
    // Mélodie
    if (melodyOn(b)) {
      for (let k = 0; k < 8; k++) {
        const idx = (b % 2) * 8 + k;
        if (!rhythm[idx]) continue;
        const deg = motif[idx];
        const n = deg < 3 ? chord[deg] + 12 : root + 12 + M.scale[(deg * 2) % 7] + 12;
        const f = midiHz(n);
        add(t0 + k * beat / 2, beat * 0.45, (t) => (Math.sin(TAU * f * t) * 0.7 + Math.sin(TAU * f * 2 * t) * 0.2) * 0.09 * Math.min(1, t * 80) * Math.exp(-4 * t));
      }
    }
    // Batterie
    if (b >= 1) {
      for (let k = 0; k < 4; k++) {
        const tb = t0 + k * beat;
        if (k % 2 === 0) { // grosse caisse
          let ph = 0;
          add(tb, 0.3, (t) => { ph += (TAU * (45 + 100 * Math.exp(-30 * t))) / SR; return Math.sin(ph) * 0.35 * Math.exp(-12 * t); });
        } else { // caisse claire
          add(tb, 0.2, (t) => ((noise.next() * 2 - 1) * 0.16 + Math.sin(TAU * 190 * t) * 0.08) * Math.exp(-22 * t));
        }
        for (const off of [0, beat / 2]) { // charleston
          let hp = 0, prev = 0;
          add(tb + off, 0.05, (t) => { const n = noise.next() * 2 - 1; hp = 0.85 * (hp + n - prev); prev = n; return hp * 0.05 * Math.exp(-80 * t); });
        }
      }
    }
  }

  // Fondus d'entrée et de sortie
  const fadeIn = Math.round(0.3 * SR), fadeOut = Math.round(2.0 * SR);
  for (let i = 0; i < fadeIn; i++) out[i] *= i / fadeIn;
  for (let i = 0; i < fadeOut; i++) out[out.length - 1 - i] *= i / fadeOut;
  return { data: out, bpm, root, mood };
}
