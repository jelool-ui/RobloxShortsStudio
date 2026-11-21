// Lecture / écriture de fichiers WAV PCM 16 bits (sans dépendance).
import { readFileSync, writeFileSync } from 'node:fs';

/** @returns {{ sampleRate:number, channels:number, data: Float32Array }} (canaux mélangés en mono) */
export function readWav(file) {
  const buf = readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Pas un fichier WAV : ${file}`);
  }
  let off = 12, fmt = null, dataOff = -1, dataLen = 0;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const len = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      fmt = {
        format: buf.readUInt16LE(off + 8),
        channels: buf.readUInt16LE(off + 10),
        sampleRate: buf.readUInt32LE(off + 12),
        bits: buf.readUInt16LE(off + 22),
      };
    } else if (id === 'data') {
      dataOff = off + 8;
      dataLen = Math.min(len, buf.length - dataOff);
      break;
    }
    off += 8 + len + (len % 2);
  }
  if (!fmt || dataOff < 0) throw new Error(`WAV incomplet : ${file}`);
  if (fmt.format !== 1 || fmt.bits !== 16) throw new Error(`WAV non PCM16 : ${file}`);
  const frames = Math.floor(dataLen / (2 * fmt.channels));
  const data = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    for (let c = 0; c < fmt.channels; c++) s += buf.readInt16LE(dataOff + (i * fmt.channels + c) * 2);
    data[i] = s / fmt.channels / 32768;
  }
  return { sampleRate: fmt.sampleRate, channels: fmt.channels, data };
}

/** Écrit un WAV PCM16. `channels` = tableau de Float32Array (1 = mono, 2 = stéréo). */
export function writeWav(file, sampleRate, channels) {
  const chans = Array.isArray(channels) ? channels : [channels];
  const n = chans[0].length, nc = chans.length;
  const buf = Buffer.alloc(44 + n * nc * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * nc * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * nc * 2, 28);
  buf.writeUInt16LE(nc * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * nc * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  writeFileSync(file, buf);
}

export function rms(data, start = 0, end = data.length) {
  let s = 0;
  const a = Math.max(0, start), b = Math.min(data.length, end);
  for (let i = a; i < b; i++) s += data[i] * data[i];
  return b > a ? Math.sqrt(s / (b - a)) : 0;
}

/** Retire les silences au début et à la fin (seuil en dBFS), garde une petite marge. */
export function trimSilence(data, sampleRate, { thresholdDb = -42, padMs = 30 } = {}) {
  const thr = 10 ** (thresholdDb / 20);
  const win = Math.round(sampleRate * 0.01);
  let a = 0, b = data.length;
  while (a + win < b && rms(data, a, a + win) < thr) a += win;
  while (b - win > a && rms(data, b - win, b) < thr) b -= win;
  const pad = Math.round((sampleRate * padMs) / 1000);
  return data.slice(Math.max(0, a - pad), Math.min(data.length, b + pad));
}
