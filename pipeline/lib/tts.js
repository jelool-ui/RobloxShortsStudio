// Synthèse des répliques : Piper → hauteur ajustée par personnage → 48 kHz mono, silences retirés.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS } from '../../src/engine/characters.js';
import { readWav, writeWav, trimSilence } from './wav.js';

export const SAMPLE_RATE = 48000;
const HERE = dirname(fileURLToPath(import.meta.url));
const PY = process.env.PIPER_PYTHON || 'python3';

/** Texte affiché → texte prononcé (emoji retirés, MAJUSCULES lues comme des mots, ponctuation simple). */
export function speakable(text) {
  return text
    .replace(/[\p{Extended_Pictographic}‍️]/gu, '')
    .replace(/[’‘]/g, "'")
    .replace(/…/g, '...')
    .replace(/[«»]/g, '"')
    .replace(/(?<!\p{L})\p{Lu}[\p{Lu}-]{2,}(?!\p{L})/gu, (w) => w.toLowerCase())
    // « Vas-y ! », « Allez-y. » : sinon le « y » final est lu comme la lettre (« i grec »)
    .replace(/-y(?=\s*(?:[!?.,…;:]|$))/giu, '-i')
    .replace(/\s+/g, ' ')
    .trim();
}

let rubberband = null;
function hasRubberband() {
  if (rubberband == null) {
    try {
      rubberband = execFileSync('ffmpeg', ['-hide_banner', '-filters'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().includes('rubberband');
    } catch {
      rubberband = false;
    }
  }
  return rubberband;
}

/** Décalage de hauteur (demi-tons) + passage en 48 kHz mono, via FFmpeg. */
function pitchAndResample(src, dest, semitones, srcRate) {
  const f = 2 ** (semitones / 12);
  const filter = !semitones
    ? `aresample=${SAMPLE_RATE}`
    : hasRubberband()
      ? `rubberband=pitch=${f.toFixed(5)},aresample=${SAMPLE_RATE}`
      : `asetrate=${Math.round(srcRate * f)},aresample=${SAMPLE_RATE},atempo=${(1 / f).toFixed(5)}`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', filter, '-ac', '1', '-c:a', 'pcm_s16le', dest]);
}

/**
 * @param lines  [{ lineId, charId, text }]
 * @param voicePaths  { modelName: chemin .onnx }
 * @param outDir dossier de sortie
 * @param speed  facteur global de vitesse (>1 = plus rapide), utilisé si l'épisode dépasse 45 s
 * @returns { [lineId]: { file, duration, samples } }
 */
export function synthesizeLines(lines, voicePaths, outDir, { speed = 1 } = {}) {
  const rawDir = join(outDir, 'raw');
  mkdirSync(rawDir, { recursive: true });
  const jobs = lines.map((l) => {
    const v = CHARACTERS[l.charId].voice;
    return {
      id: l.lineId,
      text: speakable(l.text),
      model: resolve(voicePaths[v.model]),
      speaker: v.speaker,
      length_scale: (v.lengthScale ?? 1) / speed,
      noise_scale: v.noiseScale,
      out: resolve(join(rawDir, `${l.lineId}.wav`)),
    };
  });
  const jobsFile = join(outDir, 'tts-jobs.json');
  writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
  let results;
  try {
    const out = execFileSync(PY, [join(HERE, '..', 'tts_piper.py'), jobsFile], { maxBuffer: 1 << 24, stdio: ['ignore', 'pipe', 'pipe'] });
    results = JSON.parse(out.toString());
  } catch (e) {
    throw new Error(`Échec de Piper TTS : ${e.stderr?.toString().slice(-800) || e.message}`);
  }

  const res = {};
  for (const r of results) {
    const line = lines.find((l) => l.lineId === r.id);
    const v = CHARACTERS[line.charId].voice;
    if (!existsSync(r.out) || r.duration < 0.2) throw new Error(`Voix vide pour ${r.id}`);
    const file48 = join(outDir, `${r.id}.wav`);
    pitchAndResample(r.out, file48, v.pitch ?? 0, r.sample_rate);
    const wav = readWav(file48);
    const trimmed = trimSilence(wav.data, wav.sampleRate);
    writeWav(file48, SAMPLE_RATE, trimmed);
    res[r.id] = { file: file48, duration: trimmed.length / SAMPLE_RATE, samples: trimmed };
  }
  return res;
}
