// Test de bout en bout de la chaîne technique (phase 2) :
// build → Playwright rend N images → FFmpeg (vidéo + bip audio) → vérification ffprobe.
// Usage : npm run build && npm run smoke  [-- --seconds 3 --scene demo|showcase|test]
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { startPreview } from './lib/server.js';
import { verifyMp4 } from './lib/verify.js';

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const seconds = Number(arg('--seconds', 2));
const sceneName = arg('--scene', 'demo');
const W = 1080, H = 1920, FPS = 30, N = seconds * FPS;
const outDir = 'output/smoke';
const framesDir = join(outDir, 'frames');
const mp4 = join(outDir, 'smoke.mp4');

if (!existsSync('dist/render.html')) {
  console.error('dist/render.html absent : lancez d\'abord « npm run build ».');
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

const server = await startPreview();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let exitCode = 0;
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('Erreur page :', e.message));
  await page.goto(`${server.url}render.html?scene=${sceneName}&w=${W}&h=${H}&fps=${FPS}&frames=${N}`);
  await page.waitForFunction('window.__RSS_READY === true', null, { timeout: 30000 });

  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate((n) => window.renderFrame(n), f);
    await page.screenshot({ path: join(framesDir, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  console.log(`${N} images rendues en ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-framerate', String(FPS), '-i', join(framesDir, '%05d.jpg'),
    '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seconds}`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4,
  ]);

  const res = verifyMp4(mp4, { duration: seconds, tolerance: 0.2, width: W, height: H });
  console.log(JSON.stringify(res.info));
  if (res.ok) console.log(`SUCCÈS : ${mp4}`);
  else { console.error('ÉCHEC :\n - ' + res.errors.join('\n - ')); exitCode = 1; }
} catch (e) {
  console.error('ÉCHEC :', e.message);
  exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
process.exit(exitCode);
