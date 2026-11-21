// Bibliothèque d'animations procédurales, réutilisable par tous les personnages.
// Une « pose » est un simple objet de nombres (rotations en radians, hauteur du corps) :
// facile à mélanger (crossfade), à tester et totalement déterministe.
//
// Conventions (personnage tourné vers +z) :
//   armLX / armRX < 0 : bras vers l'avant      legLX / legRX < 0 : jambe vers l'avant
//   armLZ < 0 / armRZ > 0 : bras écartés vers le haut
//   bodyRX > 0 : penché en avant              bodyY : décalage vertical (saut)
import { hash01 } from './idle.js';

export const POSE_KEYS = [
  'bodyY', 'bodyRX', 'bodyRZ',
  'torsoRX', 'torsoRY', 'torsoRZ',
  'headRX', 'headRY', 'headRZ',
  'armLX', 'armLZ', 'armRX', 'armRZ',
  'legLX', 'legRX',
];

export function zeroPose() {
  const p = {};
  for (const k of POSE_KEYS) p[k] = 0;
  return p;
}

export function lerpPose(a, b, w) {
  const p = {};
  for (const k of POSE_KEYS) p[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * w;
  return p;
}

export function applyPose(char, p) {
  const j = char.joints;
  j.body.position.y = p.bodyY;
  j.body.rotation.set(p.bodyRX, 0, p.bodyRZ);
  j.torso.rotation.set(p.torsoRX, p.torsoRY, p.torsoRZ);
  j.head.rotation.set(p.headRX, p.headRY, p.headRZ);
  j.armL.rotation.set(p.armLX, 0, p.armLZ);
  j.armR.rotation.set(p.armRX, 0, p.armRZ);
  j.legL.rotation.set(p.legLX, 0, 0);
  j.legR.rotation.set(p.legRX, 0, 0);
}

const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// --- Clips -------------------------------------------------------------
// ctx : { t (temps global), u (temps depuis le début de l'action), dur, phase (cycle de pas),
//         amp (0..1, intensité de locomotion), seed }
// Retour : { pose, expression? }

function idle({ t, seed }) {
  const p = zeroPose();
  const ph = hash01(seed) * 10;
  const breath = Math.sin((t + ph) * 2.2);
  p.torsoRX = breath * 0.015;
  p.headRX = -breath * 0.02;
  p.headRY = Math.sin((t + ph) * 0.6) * 0.15;
  p.armLZ = -0.06 - breath * 0.025;
  p.armRZ = 0.06 + breath * 0.025;
  p.armLX = Math.sin((t + ph) * 1.1) * 0.03;
  p.armRX = -Math.sin((t + ph) * 1.1) * 0.03;
  return { pose: p };
}

function walk({ phase, amp = 1 }) {
  const p = zeroPose();
  const s = Math.sin(phase);
  p.legLX = s * 0.6 * amp;
  p.legRX = -s * 0.6 * amp;
  p.armLX = -s * 0.5 * amp;
  p.armRX = s * 0.5 * amp;
  p.armLZ = -0.05;
  p.armRZ = 0.05;
  p.bodyY = Math.abs(Math.cos(phase)) * 0.15 * amp;
  p.torsoRY = s * 0.06 * amp;
  p.headRY = -s * 0.04 * amp;
  p.bodyRX = 0.04 * amp;
  return { pose: p };
}

function run({ phase, amp = 1 }) {
  const p = zeroPose();
  const s = Math.sin(phase);
  p.legLX = s * 1.0 * amp;
  p.legRX = -s * 1.0 * amp;
  p.armLX = -s * 1.1 * amp;
  p.armRX = s * 1.1 * amp;
  p.armLZ = -0.15;
  p.armRZ = 0.15;
  p.bodyY = Math.abs(Math.cos(phase)) * 0.45 * amp;
  p.bodyRX = 0.22 * amp;
  p.headRX = -0.15 * amp;
  p.torsoRY = s * 0.12 * amp;
  return { pose: p };
}

function jump({ u, dur }) {
  const p = zeroPose();
  const k = clamp01(u / dur);
  const crouchEnd = 0.2, landStart = 0.82;
  if (k < crouchEnd) {
    const c = smooth(k / crouchEnd);
    p.bodyY = -0.35 * c;
    p.bodyRX = 0.25 * c;
    p.armLX = 0.6 * c;
    p.armRX = 0.6 * c;
  } else if (k < landStart) {
    const a = (k - crouchEnd) / (landStart - crouchEnd); // 0..1 en l'air
    p.bodyY = 4 * 2.6 * a * (1 - a);
    p.armLZ = -2.7 * Math.sin(Math.min(1, a * 2.5) * Math.PI / 2);
    p.armRZ = 2.7 * Math.sin(Math.min(1, a * 2.5) * Math.PI / 2);
    p.legLX = -0.5 * Math.sin(a * Math.PI);
    p.legRX = 0.3 * Math.sin(a * Math.PI);
    p.headRX = -0.2;
  } else {
    const l = (k - landStart) / (1 - landStart);
    const squash = Math.sin(l * Math.PI);
    p.bodyY = -0.3 * squash;
    p.bodyRX = 0.2 * squash;
    p.armLZ = -0.6 * (1 - l);
    p.armRZ = 0.6 * (1 - l);
  }
  return { pose: p, expression: 'happy' };
}

function surprise({ u, t }) {
  const p = zeroPose();
  const hop = u < 0.35 ? Math.sin((u / 0.35) * Math.PI) * 0.7 : 0;
  const k = smooth(clamp01(u / 0.18));
  const shake = u > 0.35 ? Math.sin(t * 40) * 0.02 : 0;
  p.bodyY = hop;
  p.bodyRX = -0.22 * k;
  p.headRX = -0.25 * k + shake;
  p.armLZ = -2.3 * k;
  p.armRZ = 2.3 * k;
  p.armLX = -0.4 * k;
  p.armRX = -0.4 * k;
  p.legLX = -0.25 * k;
  return { pose: p, expression: 'surprised' };
}

function scared({ t, u }) {
  const p = zeroPose();
  const k = smooth(clamp01(u / 0.2));
  const shiver = Math.sin(t * 45) * 0.03;
  p.bodyY = -0.15 * k;
  p.bodyRX = 0.1 * k;
  p.bodyRZ = shiver;
  p.armLX = -1.7 * k;
  p.armRX = -1.7 * k;
  p.armLZ = 0.5 * k;
  p.armRZ = -0.5 * k;
  p.headRX = 0.15 * k;
  return { pose: p, expression: 'scared' };
}

function talk(ctx) {
  const { t, seed } = ctx;
  const { pose: p } = idle(ctx);
  const ph = hash01(seed + 3) * 6;
  // gestes de la main droite + hochements de tête
  p.armRX = -0.5 - Math.max(0, Math.sin((t + ph) * 2.3)) * 0.5;
  p.armRZ = 0.25 + Math.sin((t + ph) * 3.1) * 0.12;
  p.armLX = -0.15 - Math.max(0, Math.sin((t + ph) * 1.7 + 1)) * 0.35;
  p.headRX = Math.sin((t + ph) * 4.2) * 0.06;
  p.headRZ = Math.sin((t + ph) * 1.3) * 0.05;
  p.torsoRY = Math.sin((t + ph) * 1.1) * 0.06;
  return { pose: p };
}

function wave(ctx) {
  const { t, u } = ctx;
  const { pose: p } = idle(ctx);
  const k = smooth(clamp01(u / 0.25));
  p.armRZ = (2.6 + Math.sin(t * 9) * 0.35) * k;
  p.armRX = -0.2 * k;
  p.headRZ = 0.08 * k;
  return { pose: p, expression: 'happy' };
}

function point(ctx) {
  const { u } = ctx;
  const { pose: p } = idle(ctx);
  const k = smooth(clamp01(u / 0.25));
  p.armRX = -1.55 * k;
  p.armRZ = 0.1 * k;
  p.torsoRY = 0.15 * k;
  return { pose: p };
}

function laugh({ t, u }) {
  const p = zeroPose();
  const k = smooth(clamp01(u / 0.2));
  const bounce = Math.abs(Math.sin(t * 11));
  p.bodyRX = -0.12 * k;
  p.headRX = -0.3 * k;
  p.bodyY = bounce * 0.08 * k;
  p.torsoRX = bounce * 0.06 * k;
  p.armLX = -0.5 * k;
  p.armRX = -0.5 * k;
  p.armLZ = 0.3 * k;
  p.armRZ = -0.3 * k;
  return { pose: p, expression: 'happy' };
}

function celebrate({ t, u }) {
  const p = zeroPose();
  const k = smooth(clamp01(u / 0.2));
  const hop = Math.abs(Math.sin(t * 7));
  p.bodyY = hop * 0.8 * k;
  p.armLZ = -2.8 * k;
  p.armRZ = 2.8 * k;
  p.armLX = Math.sin(t * 14) * 0.2;
  p.armRX = -Math.sin(t * 14) * 0.2;
  p.headRX = -0.15 * k;
  return { pose: p, expression: 'happy' };
}

function angry({ t, u }) {
  const p = zeroPose();
  const k = smooth(clamp01(u / 0.2));
  p.bodyRX = 0.12 * k;
  p.armLZ = 0.35 * k; // poings sur les hanches
  p.armRZ = -0.35 * k;
  p.armLX = 0.2 * k;
  p.armRX = 0.2 * k;
  p.headRX = 0.12 * k + Math.sin(t * 6) * 0.03;
  return { pose: p, expression: 'angry' };
}

function think(ctx) {
  const { t, u } = ctx;
  const { pose: p } = idle(ctx);
  const k = smooth(clamp01(u / 0.3));
  p.armRX = -2.2 * k; // main au menton
  p.armRZ = -0.5 * k;
  p.headRZ = 0.12 * k;
  p.headRX = -0.1 * k + Math.sin(t * 1.5) * 0.02;
  return { pose: p };
}

export const CLIPS = { idle, walk, run, jump, surprise, scared, talk, wave, point, laugh, celebrate, angry, think };
export const MOVE_TYPES = new Set(['walk', 'run']);
export const STRIDE = { walk: 3.4, run: 5.5 }; // distance parcourue par cycle de 2 pas
export const SPEED = { walk: 4, run: 9 }; // vitesse nominale (unités / s)

export function evalClip(type, ctx) {
  const clip = CLIPS[type];
  if (!clip) throw new Error(`Animation inconnue : ${type}`);
  return clip(ctx);
}
