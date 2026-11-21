// Rendu image par image d'un storyboard avec Playwright + Chromium (WebGL logiciel).
import { chromium } from 'playwright';
import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'vite';
import { startPreview } from './server.js';

// Préréglages de qualité : la 3D est calculée en `render`, puis agrandie en 1080×1920 par FFmpeg.
export const QUALITY = {
  fast: { w: 720, h: 1280, aa: 1, shadow: 1024 }, // ≈ 2,4× plus rapide (par défaut)
  high: { w: 1080, h: 1920, aa: 1, shadow: 2048 },
};

export async function ensureBuild(log = console.log) {
  if (existsSync('dist/render.html')) return;
  log('Construction de la page de rendu (vite build)…');
  await build({ logLevel: 'error' });
  if (!existsSync('dist/render.html')) throw new Error('Construction de dist/render.html impossible');
}

/**
 * @returns {{ frames:number, seconds:number, msPerFrame:number, dir:string, width:number, height:number }}
 */
export async function renderFrames(storyboard, framesDir, { fps = 30, quality = 'fast', log = console.log } = {}) {
  const q = QUALITY[quality];
  if (!q) throw new Error(`Qualité inconnue : ${quality}`);
  await ensureBuild(log);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const total = Math.round(storyboard.duration * fps);
  const server = await startPreview();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pageErrors = [];
  const t0 = Date.now();
  try {
    const page = await browser.newPage({ viewport: { width: q.w, height: q.h } });
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()); });
    await page.goto(`${server.url}render.html?scene=episode&w=${q.w}&h=${q.h}&fps=${fps}&aa=${q.aa}&shadow=${q.shadow}`);
    await page.waitForFunction('window.__RSS_READY === true', null, { timeout: 60000 });
    await page.evaluate((sb) => window.loadEpisode(sb), storyboard);
    if (pageErrors.length) throw new Error(`Erreur dans la page de rendu : ${pageErrors[0]}`);

    let lastPct = -1;
    for (let f = 0; f < total; f++) {
      const dataUrl = await page.evaluate((n) => {
        window.renderFrame(n);
        return document.querySelector('canvas').toDataURL('image/jpeg', 0.93);
      }, f);
      writeFileSync(join(framesDir, `${String(f).padStart(5, '0')}.jpg`), Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
      if (pageErrors.length) throw new Error(`Erreur pendant le rendu (image ${f}) : ${pageErrors[0]}`);
      const pct = Math.floor(((f + 1) / total) * 10) * 10;
      if (pct !== lastPct && pct % 20 === 0) {
        lastPct = pct;
        const el = (Date.now() - t0) / 1000;
        log(`  rendu ${pct} % (${f + 1}/${total} images, ${el.toFixed(0)} s)`);
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
  const frames = readdirSync(framesDir).filter((f) => f.endsWith('.jpg')).length;
  if (frames !== total) throw new Error(`Images manquantes : ${frames}/${total}`);
  const seconds = (Date.now() - t0) / 1000;
  return { frames, seconds, msPerFrame: (seconds * 1000) / frames, dir: framesDir, width: q.w, height: q.h };
}
