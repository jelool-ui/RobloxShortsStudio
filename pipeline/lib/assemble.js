// Montage final avec FFmpeg : images → agrandissement 1080×1920 → sous-titres incrustés
// → audio AAC → MP4 H.264 compatible YouTube Shorts (+ miniature).
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const escapeFilterPath = (p) => resolve(p).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");

export function assembleMp4({ framesDir, audioFile, assFile, fontsDir, output, fps = 30, duration }) {
  const vf = [
    'scale=1080:1920:flags=lanczos',
    `ass='${escapeFilterPath(assFile)}':fontsdir='${escapeFilterPath(fontsDir)}'`,
    'format=yuv420p',
  ].join(',');
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-framerate', String(fps), '-i', join(framesDir, '%05d.jpg'),
    '-i', audioFile,
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', vf,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high', '-level', '4.1',
    '-r', String(fps), '-g', String(fps * 2),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-t', String(duration),
    '-movflags', '+faststart',
    '-metadata', 'comment=RobloxShortsStudio',
    output,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  return output;
}

/** Miniature : image du MP4 final à l'instant `t` (avec sous-titres). */
export function extractThumbnail(mp4, t, output) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-q:v', '2', output]);
  return output;
}

/** Nombre d'images et cadence réels du flux vidéo. */
export function videoStats(mp4) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_read_packets,r_frame_rate', '-of', 'json', mp4]).toString();
  const s = JSON.parse(out).streams[0];
  const [a, b] = s.r_frame_rate.split('/').map(Number);
  return { frames: Number(s.nb_read_packets), fps: a / (b || 1) };
}

/** Luminosité moyenne de quelques images (détecte une vidéo noire / vide). */
export function meanLuma(mp4, times) {
  return times.map((t) => {
    const out = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1',
      '-vf', 'scale=64:114,format=gray', '-f', 'rawvideo', '-']);
    let s = 0;
    for (const v of out) s += v;
    return s / out.length;
  });
}
