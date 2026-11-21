// Caméra dynamique pilotée par une liste de plans (coupes franches entre les plans,
// mouvement lent à l'intérieur d'un plan, léger effet « caméra à l'épaule », zooms d'impact).
//
// Plan : { start, end, type, target: 'id' | ['id', ...], angle?, dolly?, center?: [x, z] }
//   type : wide | medium | closeup | two | track | low | over
//   angle : décalage horizontal (radians) autour du sujet, 0 = face (côté +z)
//   dolly : poussée (+) ou recul (-) progressif pendant le plan (défaut 0.12)
// Zooms d'impact : liste globale de temps (punches) → resserrement bref du champ.
import * as THREE from 'three';
import { hash01 } from './idle.js';

const BASE_FOV = 45;

const PRESETS = {
  wide:    { dist: 27, height: 6.5, look: 3.2 },
  medium:  { dist: 11.5, height: 4.4, look: 3.3 },
  closeup: { dist: 5.4, height: 0, look: 0, head: true },
  two:     { dist: 13, height: 4.6, look: 3.3 },
  track:   { dist: 12.5, height: 4.2, look: 3.2 },
  low:     { dist: 7.5, height: 1.0, look: 4.2 },
  over:    { dist: 7, height: 5.6, look: 3.8 },
};

const smooth = (x) => x * x * (3 - 2 * x);

const SINGLE = new Set(['medium', 'closeup', 'track', 'low', 'over']);
const ANGLE_TRIES = [0, 0.5, -0.5, 0.9, -0.9, 1.3, -1.3];

/** Un autre personnage se trouve-t-il entre la caméra et le sujet ? (plan horizontal) */
export function isOccluded(cam, subj, others, radius = 2.6) {
  const vx = subj[0] - cam[0], vz = subj[1] - cam[1];
  const len2 = vx * vx + vz * vz;
  if (len2 < 1e-6) return false;
  return others.some(([ox, oz]) => {
    if (Math.hypot(ox - cam[0], oz - cam[1]) < radius) return true; // caméra « dans » un personnage
    const s = ((ox - cam[0]) * vx + (oz - cam[1]) * vz) / len2;
    if (s <= 0.02 || s >= 0.92) return false;
    const px = cam[0] + vx * s, pz = cam[1] + vz * s;
    return Math.hypot(ox - px, oz - pz) < radius;
  });
}

const angleCache = new Map();
/** Choisit, une fois par plan, un angle sans obstacle au début, au milieu et à la fin du plan. */
function clearAngle(shot, getChar, allIds, dist) {
  if (!SINGLE.has(shot.type) || !allIds?.length || !shot.target) return shot.angle ?? 0;
  const key = shot;
  if (angleCache.has(key)) return angleCache.get(key);
  const base = shot.angle ?? 0;
  const times = [shot.start + 0.01, (shot.start + shot.end) / 2, shot.end - 0.01];
  // Parmi les angles sans obstacle, on garde celui qui montre le mieux le visage (3/4 face),
  // en restant proche de l'angle demandé. Sinon : le moins mauvais (visage avant tout).
  const mid = getChar(shot.target, (shot.start + shot.end) / 2);
  const facing = (a) => (mid?.heading == null ? 0
    : Math.abs(((a - mid.heading + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI));
  let chosen = null, bestScore = Infinity, fallback = base, fallbackDiff = Infinity;
  for (const da of ANGLE_TRIES) {
    const a = base + da;
    const diff = facing(a);
    if (diff < fallbackDiff) { fallbackDiff = diff; fallback = a; }
    const ok = times.every((tt) => {
      const sc = getChar(shot.target, tt);
      if (!sc) return true;
      if (sc.heading != null && shot.type !== 'track') {
        const d = Math.abs(((a - sc.heading + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
        if (d > 1.25) return false; // jamais de dos
      }
      const cam = [sc.x + Math.sin(a) * dist, sc.z + Math.cos(a) * dist];
      const others = allIds.filter((id) => id !== shot.target).map((id) => getChar(id, tt)).filter(Boolean).map((c) => [c.x, c.z]);
      return !isOccluded(cam, [sc.x, sc.z], others);
    });
    if (!ok) continue;
    const score = (shot.type === 'track' ? 0 : Math.abs(diff - 0.35)) + Math.abs(da) * 0.3;
    if (score < bestScore) { bestScore = score; chosen = a; }
  }
  if (chosen == null) chosen = fallback;
  angleCache.set(key, chosen);
  return chosen;
}

export function shotAt(shots, t) {
  let found = shots[0];
  for (const s of shots) if (t >= s.start) found = s;
  return found;
}

/**
 * @param camera THREE.PerspectiveCamera
 * @param shots  liste de plans
 * @param t      temps
 * @param getChar(id, time?) → { x, z, scale, headY } position monde d'un personnage (au temps donné)
 * @param punches temps des zooms d'impact
 * @param allIds tous les personnages (pour éviter qu'un autre masque le sujet)
 * @returns {{ target: THREE.Vector3, shot }}
 */
export function updateCamera(camera, shots, t, getChar, punches = [], allIds = []) {
  const shot = shotAt(shots, t);
  const p = PRESETS[shot.type] ?? PRESETS.medium;
  const ids = Array.isArray(shot.target) ? shot.target : shot.target ? [shot.target] : [];
  const chars = ids.map((id) => getChar(id)).filter(Boolean);

  // Centre du sujet
  let cx = 0, cz = 0, headY = 5, scale = 1;
  if (chars.length) {
    for (const c of chars) { cx += c.x; cz += c.z; }
    cx /= chars.length;
    cz /= chars.length;
    headY = Math.max(...chars.map((c) => c.headY));
    scale = Math.max(...chars.map((c) => c.scale));
  }
  if (shot.center) [cx, cz] = shot.center;

  // Distance : pour un plan à plusieurs, assez loin pour que tout le monde tienne dans le cadre vertical
  let dist = p.dist * (shot.type === 'closeup' ? scale : 1);
  if (chars.length > 1 && (shot.type === 'two' || shot.type === 'wide')) {
    const xs = chars.map((c) => c.x), zs = chars.map((c) => c.z);
    const spread = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...zs) - Math.min(...zs)) * 0.5);
    dist = Math.max(dist, (spread + 4.5) * 2.25);
  }

  const k = smooth(Math.min(1, (t - shot.start) / Math.max(0.01, shot.end - shot.start)));
  const dolly = shot.dolly ?? 0.12;
  dist *= 1 - dolly * k;

  const angle = clearAngle(shot, getChar, allIds, dist) + (shot.orbit ?? 0) * k;
  const seed = Math.floor(shot.start * 10);
  const shakeA = 0.05;
  const sx = Math.sin(t * 1.7 + hash01(seed) * 6) * shakeA + Math.sin(t * 3.1) * shakeA * 0.4;
  const sy = Math.sin(t * 1.3 + hash01(seed + 1) * 6) * shakeA * 0.8;

  const lookY = p.head ? headY - 0.15 : p.look;
  const camY = p.head ? headY + 0.2 : p.height;

  camera.position.set(cx + Math.sin(angle) * dist + sx, camY + sy, cz + Math.cos(angle) * dist);
  const target = new THREE.Vector3(cx, lookY, cz);
  camera.lookAt(target);

  // Zoom d'impact : -10° de champ, retour en 0,5 s
  let fov = BASE_FOV;
  for (const pt of punches) {
    const d = t - pt;
    if (d >= 0 && d < 0.5) fov -= 10 * (d < 0.08 ? d / 0.08 : 1 - smooth((d - 0.08) / 0.42));
  }
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return { target, shot };
}
