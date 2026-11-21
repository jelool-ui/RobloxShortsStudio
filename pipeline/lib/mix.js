// Mixage : voix + bruitages + musique (baissée automatiquement sous les voix),
// puis normalisation du volume (−14 LUFS, standard YouTube) avec FFmpeg en 2 passes.
import { execFileSync, spawnSync } from 'node:child_process';
import { SR } from './synth.js';
import { writeWav } from './wav.js';

/**
 * @param {object} p
 * @param {number} p.duration
 * @param {{start:number, samples:Float32Array}[]} p.voices
 * @param {{t:number, samples:Float32Array, gain?:number}[]} p.sfx
 * @param {Float32Array} p.music
 * @returns {{ mix: Float32Array, voice: Float32Array, duck: Float32Array }}
 */
export function mixTracks({ duration, voices, sfx, music }) {
  const n = Math.round(duration * SR);
  const voice = new Float32Array(n);
  const fx = new Float32Array(n);
  const place = (dst, start, samples, gain = 1) => {
    const a = Math.round(start * SR);
    for (let i = 0; i < samples.length && a + i < n; i++) if (a + i >= 0) dst[a + i] += samples[i] * gain;
  };
  for (const v of voices) place(voice, v.start, v.samples, 1);
  for (const e of sfx) place(fx, e.t, e.samples, e.gain ?? 0.45);

  // Ducking : enveloppe de la voix (attaque 40 ms, relâchement 350 ms)
  const duck = new Float32Array(n);
  const att = 1 - Math.exp(-1 / (0.04 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  let env = 0;
  // lookahead de 60 ms : la musique baisse juste avant que la voix commence
  const look = Math.round(0.06 * SR);
  for (let i = 0; i < n; i++) {
    const v = Math.abs(voice[Math.min(n - 1, i + look)]) > 0.01 ? 1 : 0;
    env += (v - env) * (v > env ? att : rel);
    duck[i] = 1 - 0.6 * env;
  }

  const mix = new Float32Array(n);
  const musicGain = 0.55;
  for (let i = 0; i < n; i++) {
    const m = (music[i] ?? 0) * musicGain * duck[i];
    // limiteur doux pour éviter toute saturation
    mix[i] = Math.tanh((voice[i] * 0.9 + fx[i] + m) * 1.1) / Math.tanh(1.1);
  }
  return { mix, voice, duck };
}

/** Normalisation EBU R128 en 2 passes (linéaire) → WAV stéréo 48 kHz. */
export function loudnorm(input, output, { I = -14, TP = -1.5, LRA = 11 } = {}) {
  // Passe 1 : mesure (FFmpeg écrit le rapport JSON sur stderr)
  const p1 = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  if (p1.status !== 0) throw new Error(`loudnorm (mesure) a échoué : ${p1.stderr.slice(-400)}`);
  const res = p1.stderr;
  const json = JSON.parse(res.slice(res.lastIndexOf('{'), res.lastIndexOf('}') + 1));
  const f = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-af', `${f},aresample=48000`, '-ac', '2', '-c:a', 'pcm_s16le', output]);
  return { measuredI: Number(json.input_i), targetI: I };
}

export function writeMono(file, data) {
  writeWav(file, SR, data);
}
