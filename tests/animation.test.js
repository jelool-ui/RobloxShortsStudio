import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CLIPS, POSE_KEYS, evalClip, lerpPose, zeroPose } from '../src/engine/animation.js';
import { evaluateTrack, travel, moveDuration } from '../src/engine/timeline.js';
import { isOccluded, updateCamera } from '../src/engine/cameraRig.js';
import { buildSchool, ZONES } from '../src/engine/sets/school.js';

const ctx = (o = {}) => ({ t: 1.3, u: 0.4, dur: 1, phase: 1.1, amp: 1, seed: 5, ...o });

test('les animations demandées existent (marche, course, saut, surprise) et renvoient des poses valides', () => {
  for (const name of ['walk', 'run', 'jump', 'surprise', 'idle', 'talk', 'wave', 'point', 'laugh', 'scared', 'celebrate', 'angry', 'think']) {
    assert.ok(CLIPS[name], name);
    for (const u of [0, 0.1, 0.5, 0.9, 1]) {
      const { pose } = evalClip(name, ctx({ u, t: u + 2 }));
      for (const k of POSE_KEYS) assert.ok(Number.isFinite(pose[k]), `${name}.${k} à u=${u}`);
    }
  }
  assert.throws(() => evalClip('moonwalk', ctx()));
});

test('saut : le corps décolle puis retombe au sol', () => {
  const mid = evalClip('jump', ctx({ u: 0.5, dur: 1 })).pose.bodyY;
  const end = evalClip('jump', ctx({ u: 1, dur: 1 })).pose.bodyY;
  assert.ok(mid > 2, `hauteur au sommet ${mid}`);
  assert.ok(Math.abs(end) < 0.05, `retour au sol ${end}`);
});

test('surprise : expression surprise et bras levés', () => {
  const r = evalClip('surprise', ctx({ u: 0.5 }));
  assert.equal(r.expression, 'surprised');
  assert.ok(r.pose.armLZ < -1.5 && r.pose.armRZ > 1.5);
});

test('course plus ample que la marche', () => {
  const w = evalClip('walk', ctx({ phase: Math.PI / 2 })).pose;
  const r = evalClip('run', ctx({ phase: Math.PI / 2 })).pose;
  assert.ok(Math.abs(r.legLX) > Math.abs(w.legLX));
  assert.ok(r.bodyRX > w.bodyRX);
});

test('lerpPose : bornes et milieu', () => {
  const a = zeroPose(), b = { ...zeroPose(), armRZ: 2 };
  assert.equal(lerpPose(a, b, 0).armRZ, 0);
  assert.equal(lerpPose(a, b, 1).armRZ, 2);
  assert.equal(lerpPose(a, b, 0.5).armRZ, 1);
});

test('trajet : départ, arrivée exacte, vitesse continue', () => {
  assert.equal(travel(10, 3, 0).dist, 0);
  assert.equal(travel(10, 3, 3).dist, 10);
  let prev = 0;
  for (let u = 0; u <= 3; u += 0.05) {
    const d = travel(10, 3, u).dist;
    assert.ok(d >= prev - 1e-9);
    assert.ok(d - prev < 0.6, 'pas de téléportation');
    prev = d;
  }
});

const track = {
  start: [0, 0], heading: 0,
  actions: [
    { type: 'walk', start: 1, end: 3, to: [8, 0] },
    { type: 'surprise', start: 3.5, end: 4.5, face: [8, 10] },
    { type: 'place', start: 6, to: [100, 0], heading: Math.PI },
    { type: 'run', start: 6, end: 7, to: [110, 0] },
  ],
};

test('timeline : positions, orientation, idle entre deux actions, téléportation', () => {
  let s = evaluateTrack(track, 0.5);
  assert.equal(s.type, 'idle');
  assert.deepEqual([s.x, s.z], [0, 0]);
  s = evaluateTrack(track, 2);
  assert.equal(s.type, 'walk');
  assert.ok(s.x > 0 && s.x < 8);
  assert.ok(Math.abs(s.heading - Math.PI / 2) < 0.01, 'regarde dans la direction de marche');
  s = evaluateTrack(track, 3.2);
  assert.equal(s.type, 'idle');
  assert.equal(s.x, 8);
  s = evaluateTrack(track, 4.2);
  assert.equal(s.type, 'surprise');
  assert.equal(s.expression, 'surprised');
  assert.ok(Math.abs(s.heading) < 0.01, 'se tourne vers le point visé');
  s = evaluateTrack(track, 6.5);
  assert.equal(s.type, 'run');
  assert.ok(s.x > 100 && s.x < 110);
  s = evaluateTrack(track, 9);
  assert.equal(s.x, 110);
});

test('timeline : mouvement continu (pas de saut de position entre images)', () => {
  let prev = evaluateTrack(track, 0);
  for (let f = 1; f < 30 * 5.9; f++) {
    const s = evaluateTrack(track, f / 30);
    assert.ok(Math.hypot(s.x - prev.x, s.z - prev.z) < 0.5, `image ${f}`);
    prev = s;
  }
});

test('timeline : déterminisme', () => {
  assert.deepEqual(evaluateTrack(track, 2.345, 3), evaluateTrack(track, 2.345, 3));
});

test('moveDuration : la course est plus rapide que la marche', () => {
  assert.ok(moveDuration('run', [0, 0], [20, 0]) < moveDuration('walk', [0, 0], [20, 0]));
});

test('caméra : détection d\'un personnage qui masque le sujet', () => {
  assert.equal(isOccluded([0, 10], [0, 0], [[0, 5]]), true);
  assert.equal(isOccluded([0, 10], [0, 0], [[6, 5]]), false);
  assert.equal(isOccluded([0, 10], [0, 0], [[0, -3]]), false, 'derrière le sujet');
});

test('caméra : choisit un angle dégagé quand un personnage gêne', () => {
  const cam = new THREE.PerspectiveCamera(45, 9 / 16, 0.1, 200);
  const pos = { a: [0, 0], b: [0, 5] }; // b est pile entre la caméra (face) et a
  const getChar = (id) => ({ x: pos[id][0], z: pos[id][1], scale: 1, headY: 4.65 });
  const shots = [{ start: 0, end: 2, type: 'medium', target: 'a', angle: 0, dolly: 0 }];
  updateCamera(cam, shots, 1, getChar, [], ['a', 'b']);
  assert.equal(isOccluded([cam.position.x, cam.position.z], pos.a, [pos.b]), false);
});

test('école : 3 zones construites avec leurs marques', () => {
  const scene = new THREE.Scene();
  const school = buildSchool(scene);
  assert.deepEqual(Object.keys(school.zones), ZONES);
  for (const z of ZONES) {
    const zone = school.zones[z];
    assert.ok(zone.group.children.length > 20, `${z} contient des objets`);
    assert.ok(Object.keys(zone.marks).length >= 5, `${z} a des marques`);
  }
  assert.equal(school.showNear(100, 0), 'yard');
  assert.equal(school.zones.yard.group.visible, true);
  assert.equal(school.zones.hallway.group.visible, false);
});
