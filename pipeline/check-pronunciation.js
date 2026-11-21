// Vérifie la prononciation de TOUTES les répliques possibles (toutes variantes, tous prénoms,
// toutes les voix). Échoue si un mot risque d'être épelé ou lu dans une autre langue.
// Usage : npm run check:pronunciation
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATES } from '../src/story/templates.js';
import { CHARACTERS } from '../src/engine/characters.js';
import { speakable } from './lib/tts.js';
import { ensureVoices } from './lib/voices.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const names = Object.values(CHARACTERS).map((c) => c.name);
const lines = new Set();
for (const t of TEMPLATES) {
  for (const st of t.steps) {
    for (const l of st.l || []) for (const n of names) lines.add(speakable(l.replace(/\{[ABC]\}/g, n)));
  }
}
const voices = await ensureVoices();
const file = join(mkdtempSync(join(tmpdir(), 'rss-pron-')), 'lines.json');
writeFileSync(file, JSON.stringify([...lines]));
const out = execFileSync(process.env.PIPER_PYTHON || 'python3', [join(HERE, 'pronunciation_audit.py'), file, ...Object.values(voices).map((p) => resolve(p))], { maxBuffer: 1 << 24 });
const problems = JSON.parse(out.toString());
console.log(`${lines.size} répliques × ${Object.keys(voices).length} voix vérifiées.`);
if (problems.length) {
  console.error(`ÉCHEC : ${problems.length} prononciation(s) suspecte(s) :`);
  for (const p of problems.slice(0, 20)) console.error(` - [${p.reason}] « ${p.text} » → ${p.phonemes}`);
  process.exit(1);
}
console.log('Aucune prononciation suspecte.');
