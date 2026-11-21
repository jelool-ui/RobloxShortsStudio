// Téléchargement (si absent) et vérification des modèles vocaux Piper.
// Source officielle : huggingface.co/rhasspy/piper-voices (licences vérifiées, voir docs/ARCHITECTURE.md §4).
import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { CHARACTERS } from '../../src/engine/characters.js';

const BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/fr/fr_FR';
export const VOICE_PATHS = {
  'fr_FR-siwis-medium': 'siwis/medium',
  'fr_FR-upmc-medium': 'upmc/medium',
  'fr_FR-gilles-low': 'gilles/low',
};
export const VOICE_DIR = process.env.RSS_VOICE_DIR || 'assets/voices';

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status}) : ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(`${dest}.part`, buf);
  renameSync(`${dest}.part`, dest);
  return buf.length;
}

function valid(name, dir) {
  const onnx = join(dir, `${name}.onnx`), json = join(dir, `${name}.onnx.json`);
  if (!existsSync(onnx) || !existsSync(json)) return false;
  if (statSync(onnx).size < 5_000_000) return false;
  try {
    const cfg = JSON.parse(readFileSync(json, 'utf8'));
    return Boolean(cfg.audio?.sample_rate);
  } catch {
    return false;
  }
}

/** S'assure que les modèles des personnages demandés sont présents ; renvoie leurs chemins. */
export async function ensureVoices(charIds = Object.keys(CHARACTERS), dir = VOICE_DIR, log = console.log) {
  mkdirSync(dir, { recursive: true });
  const models = [...new Set(charIds.map((id) => CHARACTERS[id].voice.model))];
  const paths = {};
  for (const name of models) {
    const sub = VOICE_PATHS[name];
    if (!sub) throw new Error(`Modèle vocal non répertorié : ${name}`);
    if (!valid(name, dir)) {
      log(`Téléchargement de la voix ${name}…`);
      await download(`${BASE}/${sub}/${name}.onnx.json`, join(dir, `${name}.onnx.json`));
      const size = await download(`${BASE}/${sub}/${name}.onnx`, join(dir, `${name}.onnx`));
      log(`  ${(size / 1e6).toFixed(1)} Mo`);
      if (!valid(name, dir)) throw new Error(`Modèle vocal invalide après téléchargement : ${name}`);
    }
    paths[name] = join(dir, `${name}.onnx`);
  }
  return paths;
}
