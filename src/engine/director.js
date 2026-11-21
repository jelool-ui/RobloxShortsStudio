// Le « réalisateur » : relie personnages, pistes d'animation, caméra et décor.
// Une séquence = { tracks: { id: piste }, shots: [plans], punches: [temps], mouth?: (id, t) → 0..1 }
// C'est le format que le storyboard (phase 5) produira automatiquement.
import { createCharacter } from './character.js';
import { CHARACTERS } from './characters.js';
import { applyPose } from './animation.js';
import { evaluateTrack } from './timeline.js';
import { updateCamera } from './cameraRig.js';
import { blinkAt, seedOf } from './idle.js';

export function createDirector(stage, sequence, { school } = {}) {
  const cast = {};
  for (const id of Object.keys(sequence.tracks)) {
    const c = createCharacter(CHARACTERS[id]);
    stage.scene.add(c.root);
    cast[id] = { c, seed: seedOf(id), state: null };
  }

  // Position d'un personnage : état courant, ou évalué à un autre instant (calculs de caméra)
  function getChar(id, time) {
    const e = cast[id];
    if (!e) return null;
    const st = time == null ? e.state : evaluateTrack(sequence.tracks[id], time, e.seed);
    if (!st) return null;
    const s = e.c.def.scale ?? 1;
    return { x: st.x, z: st.z, heading: st.heading, scale: s, headY: (4 + e.c.headSize / 2) * s };
  }
  const ids = Object.keys(cast);

  // Bouche pendant les répliques : courbe d'amplitude réelle de la voix si fournie (phase 6,
  // d.curve échantillonnée à d.fps), sinon mouvement synthétique de syllabes.
  const lines = sequence.dialogue || [];
  function dialogueMouth(id, t) {
    for (const d of lines) {
      if (d.charId !== id || t < d.start || t > d.end) continue;
      const u = t - d.start;
      if (d.curve && d.fps) {
        const i = Math.min(d.curve.length - 1, Math.floor(u * d.fps));
        return d.curve[i] ?? 0;
      }
      const env = Math.min(1, u / 0.08, (d.end - t) / 0.08);
      return env * Math.max(0, 0.5 + 0.5 * Math.sin(u * 15.7) * Math.sin(u * 6.1 + 1));
    }
    return 0;
  }

  function update(t) {
    for (const [id, e] of Object.entries(cast)) {
      const st = evaluateTrack(sequence.tracks[id], t, e.seed);
      e.state = st;
      e.c.root.position.set(st.x, 0, st.z);
      e.c.root.rotation.y = st.heading;
      applyPose(e.c, st.pose);
      e.c.setExpression(st.expression ?? sequence.expression?.(id, t) ?? 'neutral');
      const m = sequence.mouth ? sequence.mouth(id, t) : dialogueMouth(id, t);
      e.c.setMouth(m);
      e.c.setBlink(st.expression === 'surprised' || st.expression === 'scared' ? 0 : blinkAt(t, e.seed));
    }
    const { target } = updateCamera(stage.camera, sequence.shots, t, getChar, sequence.punches ?? [], ids);
    stage.focus(target.x, target.z);
    if (school) school.showNear(target.x, target.z);
  }

  return { update, cast, getChar };
}
