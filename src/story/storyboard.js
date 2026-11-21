// Storyboard automatique : histoire → séquence animée complète de durée fixe (45 s).
// Produit les pistes des personnages, les plans caméra, les zooms d'impact, les bruitages
// et la liste horodatée des répliques (pour la voix, le lip-sync et les sous-titres).
//
// La durée de chaque réplique vient de la voix réelle (phase 6, `lineDurations`) ou, à défaut,
// d'une estimation. Le minutage s'adapte ensuite pour tomber pile sur la durée cible.
import { resolveMark } from '../engine/sets/marks.js';
import { pathLength } from '../engine/timeline.js';

export const TARGET_DURATION = 45;
const OUTRO_MIN = 2.2;
const OUTRO_MAX = 6;
const GAP_MIN = 0.12;
const GAP_DEFAULT = 0.3;
const GAP_MAX = 0.8;
const ONE_SHOT = { jump: 1.0, surprise: 1.1 };
const EMOTIONAL_EXPR = new Set(['scared', 'surprised', 'angry']);
const BIG_MOVES = new Set(['jump', 'celebrate']);
const REACT_PUNCH = new Set(['surprise', 'scared', 'jump']);

/** Estimation de la durée parlée d'une réplique française (≈ 14–15 lettres / s). */
export function estimateLineDuration(text) {
  const letters = (text.match(/[\p{L}\p{N}]/gu) || []).length;
  const pauses = (text.match(/[.!?…,]/g) || []).length;
  return Math.max(1.0, 0.35 + letters * 0.066 + pauses * 0.12);
}

const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const CHEAT = 0.4; // part de l'orientation « tournée vers le public » (règle du théâtre)
const PERSONAL_SPACE = 2.6; // distance minimale entre deux personnages (bras écartés compris)
const SPEED = { walk: 4, run: 9 };

/**
 * Points de passage pour aller de `from` à `to` sans traverser les autres personnages.
 * Pour chaque obstacle trop proche du trajet, on ajoute un point qui le contourne
 * (du côté où passe déjà le trajet, sinon côté caméra).
 */
export function detour(from, to, obstacles, depth = 0) {
  const vx = to[0] - from[0], vz = to[1] - from[1];
  const L2 = vx * vx + vz * vz;
  if (L2 < 1e-6 || depth > 3) return [];
  let hit = null;
  for (const o of obstacles) {
    const s = ((o[0] - from[0]) * vx + (o[1] - from[1]) * vz) / L2;
    if (s <= 0 || s >= 1) continue;
    const px = from[0] + vx * s, pz = from[1] + vz * s;
    const d = Math.hypot(o[0] - px, o[1] - pz);
    if (d < PERSONAL_SPACE && (!hit || s < hit.s)) hit = { o, s, px, pz, d };
  }
  if (!hit) return [];
  let nx = hit.px - hit.o[0], nz = hit.pz - hit.o[1];
  const n = Math.hypot(nx, nz);
  if (Math.abs(vx) > Math.abs(vz)) {
    // déplacement latéral : on passe toujours devant (côté caméra) pour ne pas être caché
    const L = Math.sqrt(L2);
    nx = -vz / L; nz = vx / L;
    if (nz < 0) { nx = -nx; nz = -nz; }
  } else if (n < 0.3) {
    const L = Math.sqrt(L2);
    nx = -vz / L; nz = vx / L;
    if (nz < 0) { nx = -nx; nz = -nz; } // passe devant (côté caméra)
  } else { nx /= n; nz /= n; }
  const w = [r3(hit.o[0] + nx * (PERSONAL_SPACE + 0.5)), r3(hit.o[1] + nz * (PERSONAL_SPACE + 0.5))];
  const rest = obstacles.filter((o) => o !== hit.o);
  return [...detour(from, w, rest, depth + 1), w, ...detour(w, to, rest, depth + 1)];
}

/** Angle pour regarder `target` depuis `from`, légèrement ouvert vers la caméra (côté +z). */
export function cheatFace(from, target) {
  if (!from || !target) return 0;
  const a = Math.atan2(target[0] - from[0], target[1] - from[1]);
  const d = ((0 - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  return r3(a + d * CHEAT);
}
const r3 = (x) => Math.round(x * 1000) / 1000;

function layout(story, steps, durOf, gap) {
  const roles = ['A', 'B', 'C'];
  const idOf = (r) => story.cast[r];
  const tracks = {};
  const pos = {};
  let zone = null;
  let T = 0;
  const shots = [];
  const punches = [];
  const sfx = [];
  const dialogue = [];
  let lineCount = 0;
  let establishing = false;

  const addAction = (role, a) => tracks[idOf(role)].actions.push(a);
  const nearestOther = (role) => roles.filter((r) => r !== role).sort((a, b) => dist2(pos[a], pos[role]) - dist2(pos[b], pos[role]))[0];

  // Évite que deux personnages se retrouvent au même endroit
  const freeSpot = (role, p) => {
    let q = [...p];
    for (let i = 0; i < 4; i++) {
      const clash = roles.some((r) => r !== role && pos[r] && dist2(pos[r], q) < PERSONAL_SPACE);
      if (!clash) break;
      q = [q[0] + (i % 2 === 0 ? 3 : -6), q[1] + 0.5];
    }
    return q;
  };

  const shot = (start, end, type, targetRoles, extra = {}) => {
    if (end - start <= 0.01) return;
    shots.push({ start: r3(start), end: r3(end), type, target: targetRoles.length === 1 ? idOf(targetRoles[0]) : targetRoles.map(idOf), ...extra });
  };

  const parseCam = (cam, fallbackRole) => {
    const [type, role] = cam.split(':');
    return { type, roles: role ? [role] : type === 'wide' ? roles : [fallbackRole] };
  };

  for (const st of steps) {
    // --- Changement de décor
    if (st.zone) {
      zone = st.zone;
      const center = resolveMark(zone, 'center');
      for (const r of roles) pos[r] = null;
      for (const r of roles) {
        const markName = st.place?.[r] ?? 'center';
        const p = freeSpot(r, resolveMark(zone, markName));
        pos[r] = p;
        const heading = String(markName).startsWith('far') ? Math.atan2(center[0] - p[0], center[1] - p[1]) : 0;
        if (!tracks[idOf(r)]) tracks[idOf(r)] = { start: p, heading, actions: [] };
        else addAction(r, { type: 'place', start: r3(T), to: p, heading });
      }
      if (T > 0) sfx.push({ t: r3(T), name: 'whoosh' });
      establishing = true;
      continue;
    }

    const stepStart = T;
    // --- Déplacements
    let moveEnd = 0;
    const moveEndOf = {};
    const before = { ...pos };
    for (const [r, [type, mark]] of Object.entries(st.mv || {})) {
      const from = pos[r];
      const to = freeSpot(r, resolveMark(zone, mark));
      // obstacles : les autres, là où ils sont (et là où ils vont s'ils bougent aussi)
      const obstacles = roles.filter((o) => o !== r).flatMap((o) => [before[o], pos[o]]).filter(Boolean);
      const via = detour(from, to, obstacles);
      const d = Math.max(0.6, pathLength([from, ...via, to]) / SPEED[type] + 0.25);
      addAction(r, { type, start: r3(stepStart), end: r3(stepStart + d), to, ...(via.length ? { via } : {}) });
      pos[r] = to;
      moveEnd = Math.max(moveEnd, d);
      moveEndOf[r] = stepStart + d;
    }
    const firstMover = Object.keys(st.mv || {})[0];

    let stepEnd;
    if (st.text) {
      // --- Réplique
      const s = st.s;
      let lineStart = moveEnd > 0 ? stepStart + moveEnd - Math.min(0.3, moveEnd * 0.3) : stepStart;
      if (moveEndOf[s]) lineStart = Math.max(lineStart, moveEndOf[s]);
      const lineDur = durOf(st);
      const lineEnd = lineStart + lineDur;
      const listener = st.to ?? nearestOther(s);
      const face = cheatFace(pos[s], pos[listener]);
      const anim = st.a ?? 'talk';

      if (ONE_SHOT[anim]) {
        const osEnd = lineStart + ONE_SHOT[anim];
        addAction(s, { type: anim, start: r3(lineStart), end: r3(osEnd), face, ...(st.e ? { expression: st.e } : {}) });
        if (lineEnd > osEnd + 0.3) addAction(s, { type: 'talk', start: r3(osEnd), end: r3(lineEnd), face, ...(st.e ? { expression: st.e } : {}) });
        if (anim === 'jump' && st.sfx !== 'boing') sfx.push({ t: r3(lineStart + 0.25), name: 'boing' });
      } else {
        addAction(s, { type: anim, start: r3(lineStart), end: r3(lineEnd), face, ...(st.e ? { expression: st.e } : {}) });
      }
      dialogue.push({ lineId: st.lineId, role: s, charId: idOf(s), text: st.text, start: r3(lineStart), end: r3(lineEnd) });

      // Réactions des autres
      let reactEnd = lineEnd;
      const reactors = Object.entries(st.r || {});
      for (const [r, ra] of reactors) {
        const start = lineStart + 0.15;
        const dur = ONE_SHOT[ra] ?? Math.max(1.2, lineEnd - start);
        addAction(r, { type: ra, start: r3(start), end: r3(start + dur), face: cheatFace(pos[r], pos[s]) });
        if (ra === 'jump') sfx.push({ t: r3(start + 0.25), name: 'boing' });
        reactEnd = Math.max(reactEnd, start + dur);
      }
      // Ceux qui écoutent regardent celui qui parle
      for (const r of roles) {
        if (r === s || st.r?.[r] || (moveEndOf[r] && moveEndOf[r] > lineStart)) continue;
        addAction(r, { type: 'idle', start: r3(lineStart), end: r3(lineEnd), face: cheatFace(pos[r], pos[s]) });
      }

      if (st.sfx) sfx.push({ t: r3(lineStart), name: st.sfx });
      stepEnd = Math.max(lineEnd, reactEnd) + gap;

      // --- Plans caméra
      let camStart = stepStart;
      if (establishing) {
        if (firstMover && lineStart - stepStart > 0.5) {
          shot(stepStart, lineStart, 'track', [firstMover], { angle: 0.5 });
          camStart = lineStart;
        } else if (!firstMover) {
          const estEnd = Math.min(lineStart + 1.3, lineEnd - 0.6);
          if (estEnd - stepStart > 0.8) {
            shot(stepStart, estEnd, 'wide', roles, { dolly: 0.15 });
            camStart = estEnd;
          }
        }
      } else if (firstMover && lineStart - stepStart > 1.2) {
        shot(stepStart, lineStart, 'track', [firstMover], { angle: -0.4 });
        camStart = lineStart;
      }

      let type, targetRoles = [s], extra = {};
      if (st.cam) ({ type, roles: targetRoles } = parseCam(st.cam, s));
      else if (BIG_MOVES.has(anim)) type = 'medium';
      else if (EMOTIONAL_EXPR.has(st.e) || anim === 'surprise' || anim === 'scared' || st.punch) type = 'closeup';
      else {
        type = ['medium', 'two', 'closeup'][lineCount % 3];
        if (type === 'two') targetRoles = [s, listener];
      }
      extra.angle = lineCount % 2 === 0 ? 0.3 : -0.3;
      lineCount++;

      const punchReactor = reactors.find(([, ra]) => REACT_PUNCH.has(ra));
      const split = lineStart + Math.min(1.3, lineDur * 0.55);
      if (!st.cam && punchReactor && stepEnd - split > 0.9 && split - camStart > 0.7) {
        shot(camStart, split, type, targetRoles, extra);
        const [rr, ra] = punchReactor;
        shot(split, stepEnd, ra === 'jump' ? 'low' : 'closeup', [rr], { angle: 0.2 });
        if (st.punch) punches.push(r3(split));
      } else {
        shot(camStart, stepEnd, type, targetRoles, extra);
        if (st.punch) punches.push(r3(lineStart));
      }
    } else {
      // --- Étape muette (bruit, réaction collective, déplacement seul)
      const hold = st.hold ?? 0;
      let reactEnd = 0;
      for (const [r, ra] of Object.entries(st.r || {})) {
        const start = stepStart + 0.1;
        const dur = Math.max(hold, ONE_SHOT[ra] ?? hold);
        addAction(r, { type: ra, start: r3(start), end: r3(start + dur) });
        if (ra === 'jump' && st.sfx !== 'boing') sfx.push({ t: r3(start + 0.25), name: 'boing' });
        reactEnd = Math.max(reactEnd, 0.1 + dur);
      }
      if (st.sfx) sfx.push({ t: r3(stepStart + 0.05), name: st.sfx });
      if (st.punch) punches.push(r3(stepStart + 0.15));
      stepEnd = stepStart + Math.max(moveEnd, hold, reactEnd, 0.5) + gap * 0.5;
      if (st.cam) {
        const { type, roles: tr } = parseCam(st.cam, firstMover ?? 'A');
        shot(stepStart, stepEnd, type, tr, { angle: 0.25 });
      } else if (firstMover) shot(stepStart, stepEnd, 'track', [firstMover], { angle: 0.5 });
      else shot(stepStart, stepEnd, 'wide', roles);
    }
    establishing = false;
    T = stepEnd;
  }

  return { tracks, shots, punches, sfx, dialogue, contentEnd: T, zone, pos, idOf, roles };
}

/**
 * @param story  résultat de generateStory()
 * @param {{ lineDurations?: Record<string, number>, target?: number }} opts
 */
export function buildStoryboard(story, { lineDurations = {}, target = TARGET_DURATION } = {}) {
  const durOf = (st) => lineDurations[st.lineId] ?? estimateLineDuration(st.text);
  let steps = story.steps;
  const dropped = [];
  let gap = GAP_DEFAULT;
  let L = layout(story, steps, durOf, gap);

  // Trop long : on retire les étapes optionnelles (en partant de la fin), puis on resserre
  while (L.contentEnd + OUTRO_MIN > target) {
    let idx = -1;
    for (let i = steps.length - 1; i >= 0; i--) if (steps[i].opt) { idx = i; break; }
    if (idx < 0) break;
    dropped.push(steps[idx].lineId ?? `step${idx}`);
    steps = steps.filter((_, i) => i !== idx);
    L = layout(story, steps, durOf, gap);
  }
  if (L.contentEnd + OUTRO_MIN > target) {
    gap = GAP_MIN;
    L = layout(story, steps, durOf, gap);
  }
  // Trop court : on aère les silences entre les répliques
  const nSteps = steps.filter((s) => !s.zone).length;
  if (L.contentEnd + OUTRO_MAX < target && nSteps > 0) {
    const slack = target - OUTRO_MAX - L.contentEnd;
    gap = Math.min(GAP_MAX, gap + slack / nSteps);
    L = layout(story, steps, durOf, gap);
  }
  const overflow = Math.max(0, r3(L.contentEnd + OUTRO_MIN - target));

  // --- Final : tout le monde rit / fait la fête jusqu'à la fin
  const { tracks, shots, roles, idOf } = L;
  const outroStart = Math.min(L.contentEnd, target - OUTRO_MIN);
  const outroAnims = { A: 'laugh', B: 'laugh', C: 'celebrate' };
  for (const r of roles) {
    const id = idOf(r);
    tracks[id].actions = tracks[id].actions
      .filter((a) => a.start < outroStart)
      .map((a) => (a.end != null && a.end > outroStart ? { ...a, end: r3(outroStart) } : a));
    tracks[id].actions.push({ type: outroAnims[r], start: r3(outroStart), end: target, face: 0 });
  }
  let finalShots = shots.filter((s) => s.start < outroStart).map((s) => ({ ...s, end: Math.min(s.end, r3(outroStart)) }));
  finalShots.push({ start: r3(outroStart), end: target, type: 'wide', target: roles.map(idOf), dolly: -0.12 });

  // Fusionne les plans trop courts (< 0,7 s) avec le précédent ; garantit la continuité
  const merged = [];
  for (const s of finalShots) {
    const prev = merged[merged.length - 1];
    if (prev && (s.end - s.start < 0.7 || Math.abs(prev.start - s.start) < 1e-6)) { prev.end = s.end; continue; }
    if (prev) prev.end = s.start;
    merged.push({ ...s });
  }
  if (merged.length) merged[0].start = 0;
  const dialogue = L.dialogue.filter((d) => d.start < target);
  const sfx = L.sfx.filter((e) => e.t < target);
  sfx.push({ t: r3(target - 1.2), name: 'ding' });

  return {
    id: story.id,
    title: story.title,
    duration: target,
    overflow,
    gap: r3(gap),
    dropped,
    tracks,
    shots: merged,
    punches: L.punches.filter((p) => p < target),
    sfx,
    dialogue,
    zones: [...new Set(story.steps.filter((s) => s.zone).map((s) => s.zone))],
  };
}
