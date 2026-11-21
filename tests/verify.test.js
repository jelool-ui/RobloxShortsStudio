import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyMp4 } from '../pipeline/lib/verify.js';

const dir = mkdtempSync(join(tmpdir(), 'rss-'));
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a]);

test('fichier absent → échec', () => {
  const r = verifyMp4(join(dir, 'nope.mp4'));
  assert.equal(r.ok, false);
});

test('fichier corrompu → échec', () => {
  const f = join(dir, 'bad.mp4');
  writeFileSync(f, Buffer.alloc(4096, 7));
  assert.equal(verifyMp4(f).ok, false);
});

test('vidéo sans audio → échec', () => {
  const f = join(dir, 'noaudio.mp4');
  ff('-f', 'lavfi', '-i', 'color=c=red:s=108x192:d=2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', f);
  const r = verifyMp4(f, { duration: 2, width: 108, height: 192 });
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('Piste audio absente'));
});

test('mauvaise durée → échec ; bonne vidéo → succès', () => {
  const f = join(dir, 'ok.mp4');
  ff('-f', 'lavfi', '-i', 'color=c=blue:s=108x192:d=2', '-f', 'lavfi', '-i', 'sine=d=2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', f);
  assert.equal(verifyMp4(f, { duration: 45, width: 108, height: 192 }).ok, false);
  const r = verifyMp4(f, { duration: 2, tolerance: 0.2, width: 108, height: 192 });
  assert.deepEqual(r.errors, []);
  assert.equal(r.ok, true);
});
