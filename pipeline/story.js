// Génère une histoire + son storyboard, sans aucune API.
// Usage : node pipeline/story.js [--seed 42] [--zone auto|hallway|classroom|yard] [--template id]
//                                [--cast nino,zoe,max]   (rôles A=farceur, B=maline, C=peureux)
// Écrit output/episodes/<id>/story.json et storyboard.json, affiche le script.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateStory, storyScript, DEFAULT_CAST } from '../src/story/generator.js';
import { buildStoryboard } from '../src/story/storyboard.js';
import { randomSeed } from '../src/story/rng.js';

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);

export function makeEpisode({ seed, zone = 'auto', template, cast = DEFAULT_CAST, lineDurations, outRoot = 'output/episodes' }) {
  const story = generateStory({ seed, zone, template, cast });
  const storyboard = buildStoryboard(story, { lineDurations });
  const dir = join(outRoot, story.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'story.json'), JSON.stringify(story, null, 2));
  writeFileSync(join(dir, 'storyboard.json'), JSON.stringify(storyboard, null, 2));
  return { story, storyboard, dir };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seed = Number(arg('--seed', randomSeed()));
  const castArg = arg('--cast', null);
  const cast = castArg ? Object.fromEntries(castArg.split(',').map((id, i) => [['A', 'B', 'C'][i], id])) : DEFAULT_CAST;
  const { story, storyboard, dir } = makeEpisode({ seed, zone: arg('--zone', 'auto'), template: arg('--template', undefined), cast });
  console.log(storyScript(story));
  console.log(`\nDurée : ${storyboard.duration} s | répliques : ${storyboard.dialogue.length} | plans : ${storyboard.shots.length} | dépassement : ${storyboard.overflow} s | silences : ${storyboard.gap} s`);
  console.log(`Fichiers : ${dir}/story.json, ${dir}/storyboard.json`);
}
