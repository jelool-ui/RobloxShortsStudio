// Utilisé par le workflow « Générer un épisode » : écrit le résumé de l'exécution et
// échoue (code 1) si l'épisode n'est pas un succès vérifié.
// Usage : node pipeline/ci-summary.js <manifest.json>   (option --title : affiche seulement le titre)
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file || !existsSync(resolve(file))) {
  console.log('::error::Aucun manifest : la génération n\'a pas démarré');
  process.exit(1);
}
const m = JSON.parse(readFileSync(resolve(file), 'utf8'));

if (args.includes('--title')) {
  console.log(m.title ?? m.id ?? 'Épisode');
  process.exit(0);
}

const lines = [
  `## ${m.status === 'success' ? '✅' : '❌'} ${m.title ?? 'Épisode'}`,
  '',
  `- Identifiant : \`${m.id}\` · graine ${m.seed} · histoire ${m.template} · décor ${m.zone}`,
  `- Durée totale : ${m.seconds} s`,
];
for (const [k, s] of Object.entries(m.steps ?? {})) {
  lines.push(`- Étape ${k} : ${s.status}${s.seconds ? ` (${s.seconds} s)` : ''}${s.error ? ` — ${s.error}` : ''}`);
}
if (m.video) lines.push(`- Vidéo : ${m.video.video?.width}×${m.video.video?.height}, ${Number(m.video.duration).toFixed(2)} s, ${m.video.frames} images, ${m.video.sizeMB} Mo`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));

const mp4 = join(dirname(resolve(file)), 'episode.mp4');
if (m.status !== 'success') {
  for (const e of m.errors ?? []) console.log(`::error::${String(e).replace(/\n/g, ' ')}`);
  process.exit(1);
}
if (!existsSync(mp4)) {
  console.log('::error::episode.mp4 absent alors que la génération est déclarée réussie');
  process.exit(1);
}
