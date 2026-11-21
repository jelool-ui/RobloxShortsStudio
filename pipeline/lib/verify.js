// Vérification stricte d'un MP4 avec ffprobe.
// Une génération n'est JAMAIS déclarée réussie si cette fonction renvoie ok=false.
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

export function probe(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file,
  ]);
  return JSON.parse(out.toString());
}

/**
 * @param {string} file
 * @param {{duration?:number, tolerance?:number, width?:number, height?:number}} expect
 * @returns {{ok:boolean, errors:string[], info:object}}
 */
export function verifyMp4(file, expect = {}) {
  const errors = [];
  const info = {};
  if (!existsSync(file)) return { ok: false, errors: [`Fichier absent : ${file}`], info };
  info.size = statSync(file).size;
  if (info.size < 1024) errors.push(`Fichier trop petit (${info.size} octets)`);

  let data;
  try {
    data = probe(file);
  } catch (e) {
    return { ok: false, errors: [...errors, `ffprobe ne peut pas lire le fichier : ${e.message}`], info };
  }

  const video = data.streams.find((s) => s.codec_type === 'video');
  const audio = data.streams.find((s) => s.codec_type === 'audio');
  info.duration = Number(data.format?.duration || 0);
  info.video = video && { codec: video.codec_name, width: video.width, height: video.height };
  info.audio = audio && { codec: audio.codec_name, sampleRate: Number(audio.sample_rate) };

  if (!video) errors.push('Piste vidéo absente');
  if (!audio) errors.push('Piste audio absente');
  if (video && video.codec_name !== 'h264') errors.push(`Codec vidéo inattendu : ${video.codec_name}`);
  if (video && expect.width && video.width !== expect.width) errors.push(`Largeur ${video.width} ≠ ${expect.width}`);
  if (video && expect.height && video.height !== expect.height) errors.push(`Hauteur ${video.height} ≠ ${expect.height}`);
  if (expect.duration != null) {
    const tol = expect.tolerance ?? 1;
    if (Math.abs(info.duration - expect.duration) > tol) {
      errors.push(`Durée ${info.duration.toFixed(2)} s hors de ${expect.duration} ± ${tol} s`);
    }
  }
  return { ok: errors.length === 0, errors, info };
}
