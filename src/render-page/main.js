// Page de rendu pilotée par Playwright.
// Contrat (stable pour toutes les phases) :
//   window.__RSS_READY      → true quand la scène est prête
//   window.renderFrame(n)   → dessine l'image n (temps = n / fps), de façon déterministe
//   window.__RSS_INFO       → { width, height, fps, frames, scene }
// Paramètres d'URL : w, h, fps, frames, scene (test | showcase)
import { createTestScene } from '../engine/testScene.js';
import { createStage } from '../engine/stage.js';
import { buildShowcase } from '../engine/scenes/showcase.js';

const params = new URLSearchParams(location.search);
const width = Number(params.get('w') || 1080);
const height = Number(params.get('h') || 1920);
const fps = Number(params.get('fps') || 30);
const sceneName = params.get('scene') || 'showcase';

let renderer, renderAt;
let debug = {};
if (sceneName === 'test') {
  ({ renderer, renderAt } = createTestScene({ width, height }));
} else if (sceneName === 'showcase') {
  const stage = createStage({ width, height });
  const show = buildShowcase(stage);
  renderer = stage.renderer;
  renderAt = (t) => { show.update(t); stage.render(); };
  debug = { stage, show };
} else {
  throw new Error(`Scène inconnue : ${sceneName}`);
}
document.body.appendChild(renderer.domElement);

window.__RSS_INFO = { width, height, fps, frames: Number(params.get('frames') || fps * 45), scene: sceneName };
window.renderFrame = (n) => renderAt(n / fps);
window.__RSS_DEBUG = debug; // accès développeur (gros plans, tests visuels)
window.renderFrame(0);
window.__RSS_READY = true;
