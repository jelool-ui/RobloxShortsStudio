// Lip-sync : enveloppe d'amplitude de la voix → ouverture de bouche (0..1) image par image.
import { rms } from './wav.js';

/**
 * @param {Float32Array} data  échantillons mono
 * @param {number} sampleRate
 * @param {number} fps         images par seconde de la vidéo
 * @returns {number[]}         une valeur par image (arrondie au centième)
 */
export function mouthCurve(data, sampleRate, fps = 30) {
  const hop = sampleRate / fps;
  const frames = Math.ceil(data.length / hop);
  const raw = [];
  for (let f = 0; f < frames; f++) {
    // fenêtre centrée, avec une légère avance (la bouche s'ouvre juste avant le son)
    const c = (f + 0.5) * hop + sampleRate * 0.02;
    raw.push(rms(data, Math.round(c - hop * 0.75), Math.round(c + hop * 0.75)));
  }
  // Normalisation robuste (95e centile) → indépendante du volume de la voix
  const sorted = [...raw].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1e-6;
  const out = [];
  let m = 0;
  for (const v of raw) {
    let target = Math.min(1, Math.max(0, (v / ref - 0.12) / 0.78));
    target = target ** 0.8;
    m += (target - m) * (target > m ? 0.7 : 0.4); // attaque rapide, relâchement plus doux
    out.push(Math.round(m * 100) / 100);
  }
  if (out.length) out[out.length - 1] = 0;
  return out;
}
