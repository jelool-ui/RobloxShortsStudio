import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCharacter, EXPRESSIONS } from '../src/engine/character.js';
import { CHARACTERS, CHARACTER_IDS } from '../src/engine/characters.js';
import { blinkAt, applyIdle, seedOf } from '../src/engine/idle.js';

test('3 personnages distincts avec une voix chacun', () => {
  assert.equal(CHARACTER_IDS.length, 3);
  const voices = CHARACTER_IDS.map((id) => `${CHARACTERS[id].voice.model}/${CHARACTERS[id].voice.speaker}`);
  assert.equal(new Set(voices).size, 3);
  const shirts = CHARACTER_IDS.map((id) => CHARACTERS[id].colors.shirt);
  assert.equal(new Set(shirts).size, 3);
});

for (const id of CHARACTER_IDS) {
  test(`${id} : hiérarchie complète et taille plausible`, () => {
    const c = createCharacter(CHARACTERS[id]);
    for (const j of ['body', 'torso', 'head', 'armL', 'armR', 'legL', 'legR']) {
      assert.ok(c.joints[j] instanceof THREE.Object3D, `articulation ${j}`);
    }
    c.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c.root);
    const h = box.max.y - box.min.y;
    assert.ok(h > 4.5 && h < 7.5, `hauteur ${h}`);
    assert.ok(Math.abs(box.min.y) < 0.05, `pieds au sol (${box.min.y})`);
  });
}

test('bouche : ouverture pilotable et bornée', () => {
  const c = createCharacter(CHARACTERS.nino);
  c.setMouth(0);
  assert.equal(c._face.mouthOpen.visible, false);
  c.setMouth(0.8);
  assert.equal(c._face.mouthOpen.visible, true);
  const open = c._face.mouthOpen.scale.y;
  c.setMouth(0.3);
  assert.ok(c._face.mouthOpen.scale.y < open);
  c.setMouth(5);
  assert.equal(c.mouth, 1);
});

test('expressions : toutes acceptées, inconnue refusée', () => {
  const c = createCharacter(CHARACTERS.zoe);
  for (const e of EXPRESSIONS) c.setExpression(e);
  assert.throws(() => c.setExpression('dabbing'));
  c.setExpression('surprised');
  assert.equal(c._face.mouthOpen.visible, true, 'surprise = bouche ouverte');
});

test('animation déterministe : même temps → même pose', () => {
  const a = createCharacter(CHARACTERS.max);
  const b = createCharacter(CHARACTERS.max);
  applyIdle(a, 3.37, seedOf('max'));
  applyIdle(b, 3.37, seedOf('max'));
  assert.equal(a.joints.head.rotation.y, b.joints.head.rotation.y);
  assert.equal(a.joints.armL.rotation.z, b.joints.armL.rotation.z);
});

test('clignement : bref et périodique', () => {
  let closed = 0;
  for (let i = 0; i < 300; i++) if (blinkAt(i / 30, 7) > 0.5) closed++;
  assert.ok(closed >= 2 && closed <= 30, `images yeux fermés sur 10 s : ${closed}`);
});
