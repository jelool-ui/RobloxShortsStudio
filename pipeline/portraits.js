import { chromium } from 'playwright';
// Gros plans des visages (contrôle visuel des personnages et expressions).
// Usage : npm run build && npm run portraits   → output/portraits/portraits.jpg
import { startPreview } from './lib/server.js';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const out = process.argv[2] || 'output/portraits';
mkdirSync(out, { recursive: true });
const s = await startPreview(); const b = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 600, height: 600 } });
p.on('pageerror', e => console.error(e.message));
await p.goto(`${s.url}render.html?scene=showcase&w=600&h=600`);
await p.waitForFunction('window.__RSS_READY');
const shots = [['nino',0,'happy',0],['zoe',1,'surprised',0],['max',2,'scared',0],['max',2,'neutral',0.7],['nino',0,'angry',0],['zoe',1,'sad',0]];
let k=0;
for (const [id,i,ex,m] of shots) {
  await p.evaluate(([i,ex,m,side]) => {
    const { stage, show } = window.__RSS_DEBUG; show.update(0.5);
    const c = show.characters[i]; c.setExpression(ex); c.setMouth(m); c.setBlink(0);
    c.joints.head.rotation.set(0,0,0);
    const v = new stage.camera.position.constructor(); c.joints.head.getWorldPosition(v);
    const ang = c.root.rotation.y + side;
    stage.camera.position.set(v.x + Math.sin(ang)*4.2, v.y + 1.2, v.z + Math.cos(ang)*4.2);
    stage.camera.lookAt(v.x, v.y + 0.8, v.z); stage.render();
  }, [i,ex,m, k%2 ? 0.6 : 0]);
  await p.screenshot({ path: `${out}/face${k++}.png` });
}
await b.close(); await s.close();
const inputs = Array.from({ length: k }, (_, i) => ['-i', `${out}/face${i}.png`]).flat();
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex',
  '[0][1][2]hstack=3[a];[3][4][5]hstack=3[b];[a][b]vstack', `${out}/portraits.jpg`]);
console.log(`Planche : ${out}/portraits.jpg`);
