// Page de rendu pilotée par Playwright.
// Contrat (stable pour toutes les phases) :
//   window.__RSS_READY      → true quand la scène est prête
//   window.renderFrame(n)   → dessine l'image n (temps = n / fps), de façon déterministe
//   window.__RSS_INFO       → { width, height, fps, frames, scene }
// Paramètres d'URL : w, h, fps, frames, scene (test | showcase | demo | episode)
import { createTestScene } from '../engine/testScene.js';
import { createStage } from '../engine/stage.js';
import { buildShowcase } from '../engine/scenes/showcase.js';
import { buildDemo } from '../engine/scenes/demo.js';
import { buildSchool } from '../engine/sets/school.js';
import { createDirector } from '../engine/director.js';

const params = new URLSearchParams(location.search);
const width = Number(params.get('w') || 1080);
const height = Number(params.get('h') || 1920);
const fps = Number(params.get('fps') || 30);
const sceneName = params.get('scene') || 'demo';
// Qualité : aa=0 désactive l'anticrénelage, shadow=taille de la carte d'ombres
const stageOpts = { antialias: params.get('aa') !== '0', shadowSize: Number(params.get('shadow') || 2048) };

let renderer, renderAt;
let debug = {};
if (sceneName === 'test') {
  ({ renderer, renderAt } = createTestScene({ width, height }));
} else if (sceneName === 'showcase' || sceneName === 'demo') {
  const stage = createStage({ width, height, ...stageOpts });
  const show = sceneName === 'demo' ? buildDemo(stage) : buildShowcase(stage);
  renderer = stage.renderer;
  renderAt = (t) => { show.update(t); stage.render(); };
  debug = { stage, show };
} else if (sceneName === 'episode') {
  // L'épisode (storyboard JSON) est injecté par Playwright via window.loadEpisode(storyboard)
  const stage = createStage({ width, height, ...stageOpts });
  const school = buildSchool(stage.scene);
  let director = null;
  renderer = stage.renderer;
  renderAt = (t) => { if (director) director.update(t); stage.render(); };
  window.loadEpisode = (sb) => {
    director = createDirector(stage, sb, { school });
    window.__RSS_INFO.frames = Math.round(sb.duration * fps);
    window.__RSS_EPISODE_READY = true;
    return true;
  };
  debug = { stage, school, get director() { return director; } };
} else {
  throw new Error(`Scène inconnue : ${sceneName}`);
}
document.body.appendChild(renderer.domElement);

window.__RSS_INFO = { width, height, fps, frames: Number(params.get('frames') || fps * 45), scene: sceneName };
window.renderFrame = (n) => renderAt(n / fps);
window.__RSS_DEBUG = debug; // accès développeur (gros plans, tests visuels)
window.renderFrame(0);
window.__RSS_READY = true;
