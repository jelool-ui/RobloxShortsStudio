// Met à jour le menu « Histoire » du workflow GitHub à partir des histoires du code.
// Usage : npm run sync:workflow   (le test tests/ui.test.js vérifie que tout est synchronisé)
import { readFileSync, writeFileSync } from 'node:fs';
import { TEMPLATE_IDS } from '../src/story/templates.js';

const file = '.github/workflows/generate.yml';
const yml = readFileSync(file, 'utf8');
const start = yml.indexOf('      template:');
const end = yml.indexOf('      cast:');
if (start < 0 || end < 0) throw new Error('Bloc « template » introuvable dans le workflow');
const block = [
  '      template:',
  '        description: Histoire',
  '        type: choice',
  '        default: auto',
  '        options:',
  ...['auto', ...TEMPLATE_IDS].map((id) => `          - "${id}"`),
  '',
].join('\n');
writeFileSync(file, yml.slice(0, start) + block + yml.slice(end));
console.log(`Workflow mis à jour : ${TEMPLATE_IDS.length} histoires + auto.`);
