// Évaluation déterministe de la piste d'un personnage au temps t.
//
// Format d'une piste (produit par le storyboard en phase 5) :
// {
//   id: 'nino',
//   start: [x, z],          position initiale (monde)
//   heading: 0,             orientation initiale (radians, 0 = regarde vers +z / la caméra)
//   actions: [
//     { type: 'walk', start: 0, end: 3, to: [x, z], via?: [[x, z]] }  déplacement (walk | run), via = points de passage
//     { type: 'jump', start: 3, end: 4, to: [x, z]? },          saut (sur place ou en avançant)
//     { type: 'talk', start: 4, end: 6, face: [x, z] | angle }, action sur place
//     { type: 'place', start: 8, to: [x, z], heading: 0 },        téléportation (changement de décor)
//     { ..., expression: 'happy' }                              expression forcée (optionnel)
//   ]
// }
// Entre deux actions : 'idle'. Les transitions entre actions sont fondues sur BLEND secondes.
import { evalClip, lerpPose, MOVE_TYPES, STRIDE } from './animation.js';

export const BLEND = 0.2;
const TURN = 0.3; // durée d'un demi-tour

function angleLerp(a, b, w) {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * w;
}

const smooth = (x) => x * x * (3 - 2 * x);

/** Distance parcourue au temps u d'un trajet de longueur d en D secondes (accélération/freinage). */
export function travel(d, D, u) {
  const ta = Math.min(0.25, D / 4);
  const vmax = d / (D - ta);
  const a = vmax / ta;
  if (u <= 0) return { dist: 0, v: 0, vmax };
  if (u >= D) return { dist: d, v: 0, vmax };
  if (u < ta) return { dist: 0.5 * a * u * u, v: a * u, vmax };
  if (u > D - ta) return { dist: d - 0.5 * a * (D - u) ** 2, v: a * (D - u), vmax };
  return { dist: 0.5 * vmax * ta + vmax * (u - ta), v: vmax, vmax };
}

function faceAngle(face, pos, fallback) {
  if (face == null) return fallback;
  if (typeof face === 'number') return face;
  const dx = face[0] - pos[0], dz = face[1] - pos[1];
  if (Math.abs(dx) + Math.abs(dz) < 1e-6) return fallback;
  return Math.atan2(dx, dz);
}

/** Points du trajet : départ → points de passage (via) → arrivée. */
function pathPoints(startPos, a) {
  return [startPos, ...(a.via || []), a.to];
}

export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/** Position à la distance `d` le long d'un trajet. */
export function pointAt(pts, d) {
  let rest = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const seg = Math.hypot(bx - ax, bz - az);
    if (rest <= seg || i === pts.length - 1) {
      const k = seg > 0 ? Math.min(1, rest / seg) : 1;
      return [ax + (bx - ax) * k, az + (bz - az) * k];
    }
    rest -= seg;
  }
  return [...pts[pts.length - 1]];
}

function isMoving(a) {
  return MOVE_TYPES.has(a.type) || (a.type === 'jump' && a.to);
}

/**
 * @returns {{x:number, z:number, heading:number, pose:object, expression:string|null, type:string}}
 */
export function evaluateTrack(track, t, seed = 0) {
  const actions = [...(track.actions || [])].sort((a, b) => a.start - b.start);
  let pos = [...track.start];
  let heading = track.heading ?? 0;
  let last = null; // dernière action terminée
  let current = null;

  for (const a of actions) {
    if (a.start > t) break;
    if (a.type === 'place') { // téléportation instantanée (changement de décor)
      pos = [...a.to];
      heading = a.heading ?? heading;
      last = null;
      continue;
    }
    const startPos = [...pos];
    const startHeading = heading;
    const moving = isMoving(a);
    const pts = moving ? pathPoints(startPos, a) : null;
    // en fin de trajet, le personnage regarde dans la direction du dernier segment
    const target = moving
      ? faceAngle(a.to, pts[pts.length - 2], heading)
      : faceAngle(a.face, startPos, heading);
    if (t >= a.end) {
      if (moving) pos = [...a.to];
      heading = target;
      last = { a, startPos };
      continue;
    }
    current = { a, startPos, startHeading, target, moving, pts };
    break;
  }

  const ctxBase = { t, seed };
  let type, ctx, x, z, h, expression = null;

  if (current) {
    const { a, startPos, startHeading, target, moving, pts } = current;
    const u = t - a.start;
    const dur = a.end - a.start;
    type = a.type;
    ctx = { ...ctxBase, u, dur, amp: 1, phase: 0 };
    x = startPos[0];
    z = startPos[1];
    let pathHeading = null;
    if (moving) {
      const d = pathLength(pts);
      let dist, amp = 1;
      if (MOVE_TYPES.has(a.type)) {
        const tr = travel(d, dur, u);
        dist = tr.dist;
        amp = tr.vmax > 0 ? Math.min(1, tr.v / tr.vmax + 0.25) : 0;
        ctx.phase = (dist / STRIDE[a.type]) * Math.PI * 2;
      } else {
        dist = d * smooth(Math.min(1, u / dur));
      }
      ctx.amp = amp;
      [x, z] = pointAt(pts, dist);
      // orientation : vers un point un peu plus loin sur le trajet (virages en douceur)
      const ahead = pointAt(pts, Math.min(d, dist + 1.2));
      if (Math.hypot(ahead[0] - x, ahead[1] - z) > 0.05) pathHeading = Math.atan2(ahead[0] - x, ahead[1] - z);
      else pathHeading = target;
    }
    const goal = pathHeading ?? target;
    h = angleLerp(startHeading, goal, smooth(Math.min(1, u / TURN)));
    expression = a.expression ?? null;
  } else {
    type = 'idle';
    ctx = { ...ctxBase, u: last ? t - last.a.end : t, dur: Infinity, amp: 1, phase: 0 };
    x = pos[0];
    z = pos[1];
    h = heading;
  }

  const res = evalClip(type, ctx);
  let pose = res.pose;
  expression = expression ?? res.expression ?? null;

  // Fondu depuis l'action précédente (ou depuis 'idle' s'il y avait un trou)
  let since = Infinity, prevType = null;
  if (current) {
    since = t - current.a.start;
    prevType = last && current.a.start - last.a.end < 0.05 ? last.a.type : 'idle';
  } else if (last) {
    since = t - last.a.end;
    prevType = last.a.type;
  }
  if (since < BLEND && prevType && prevType !== type) {
    const prevCtx = { ...ctxBase, u: t - (last?.a.start ?? 0), dur: last ? last.a.end - last.a.start : Infinity, amp: 1, phase: 0 };
    if (last && prevType === last.a.type && MOVE_TYPES.has(prevType)) {
      const d = pathLength(pathPoints(last.startPos, last.a));
      prevCtx.phase = (d / STRIDE[prevType]) * Math.PI * 2;
      prevCtx.amp = 0.25;
    }
    const prevPose = evalClip(prevType, prevCtx).pose;
    pose = lerpPose(prevPose, pose, smooth(since / BLEND));
  }

  return { x, z, heading: h, pose, expression, type };
}

/** Durée conseillée pour parcourir une distance avec une locomotion donnée. */
export function moveDuration(type, from, to, speed) {
  const d = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const v = speed ?? (type === 'run' ? 9 : 4);
  return Math.max(0.6, d / v + 0.25);
}
