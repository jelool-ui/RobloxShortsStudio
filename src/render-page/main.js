// Page de rendu pilotée par Playwright.
// Contrat (stable pour toutes les phases) :
//   window.__RSS_READY      → true quand la scène est prête
//   window.renderFrame(n)   → dessine l'image n (temps = n / fps), de façon déterministe
//   window.__RSS_INFO       → { width, height, fps, frames }
// Phase 2 : scène de test minimale. Les vrais personnages/décors arrivent en phases 3–4.
import { createTestScene } from '../engine/testScene.js';

const params = new URLSearchParams(location.search);
const width = Number(params.get('w') || 1080);
const height = Number(params.get('h') || 1920);
const fps = Number(params.get('fps') || 30);

const { renderer, renderAt } = createTestScene({ width, height });
document.body.appendChild(renderer.domElement);

window.__RSS_INFO = { width, height, fps, frames: Number(params.get('frames') || fps * 45) };
window.renderFrame = (n) => renderAt(n / fps);
window.renderFrame(0);
window.__RSS_READY = true;
