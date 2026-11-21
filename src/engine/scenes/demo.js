// Séquence de démonstration (phase 4), écrite à la main : couloir → classe → cour.
// En phase 5, des séquences de ce format seront générées automatiquement par le storyboard.
import { buildSchool } from '../sets/school.js';
import { createDirector } from '../director.js';

export function demoSequence(zones) {
  const H = zones.hallway.marks, C = zones.classroom.marks, Y = zones.yard.marks;
  return {
    duration: 15,
    tracks: {
      nino: {
        start: H.farLeft, heading: Math.PI / 2,
        actions: [
          { type: 'run', start: 0, end: 2.4, to: [-3, 0] },
          { type: 'talk', start: 2.6, end: 4.8, face: [-5.5, -5] },
          { type: 'jump', start: 5.0, end: 6.0 },
          { type: 'laugh', start: 6.2, end: 8 },
          { type: 'place', start: 8, to: C.left, heading: 0.4 },
          { type: 'laugh', start: 8.2, end: 11 },
          { type: 'place', start: 11, to: Y.farLeft, heading: Math.PI / 2 },
          { type: 'run', start: 11, end: 13.2, to: [Y.center[0] - 2, 1] },
          { type: 'celebrate', start: 13.3, end: 15 },
        ],
      },
      zoe: {
        start: H.farRight, heading: -Math.PI / 2,
        actions: [
          { type: 'walk', start: 0.4, end: 5.0, to: [4, 0] },
          { type: 'wave', start: 5.0, end: 6.2, face: [-3, 0] },
          { type: 'place', start: 8, to: C.board, heading: 0 },
          { type: 'point', start: 8.2, end: 9.5, face: 0 },
          { type: 'talk', start: 9.5, end: 11, face: 0.3 },
          { type: 'place', start: 11, to: [Y.farLeft[0] - 4, 3], heading: Math.PI / 2 },
          { type: 'walk', start: 11, end: 14, to: [Y.center[0] - 6, 2] },
          { type: 'wave', start: 14, end: 15, face: 0 },
        ],
      },
      max: {
        start: H.lockerL, heading: Math.PI,
        actions: [
          { type: 'surprise', start: 2.3, end: 3.4, face: [-3, 0] },
          { type: 'scared', start: 3.4, end: 4.8, face: [-3, 0] },
          { type: 'talk', start: 6.2, end: 8, face: [0, 0] },
          { type: 'place', start: 8, to: C.right, heading: -0.4 },
          { type: 'think', start: 8.2, end: 11, face: -0.4 },
          { type: 'place', start: 11, to: [Y.center[0] + 4, 0], heading: 0 },
          { type: 'idle', start: 11, end: 13 },
          { type: 'jump', start: 13.2, end: 14.2 },
          { type: 'celebrate', start: 14.2, end: 15 },
        ],
      },
    },
    shots: [
      { start: 0, end: 2.4, type: 'track', target: 'nino', angle: 0.45 },
      { start: 2.4, end: 3.4, type: 'closeup', target: 'max', angle: 0.25 },
      { start: 3.4, end: 5.0, type: 'two', target: ['nino', 'max'], angle: -0.2 },
      { start: 5.0, end: 6.2, type: 'wide', target: ['nino', 'zoe', 'max'] },
      { start: 6.2, end: 8, type: 'medium', target: 'max', angle: 0.3 },
      { start: 8, end: 9.5, type: 'wide', target: ['nino', 'zoe', 'max'], dolly: 0.2 },
      { start: 9.5, end: 11, type: 'closeup', target: 'zoe', angle: -0.3 },
      { start: 11, end: 13.2, type: 'track', target: 'nino', angle: 0.7 },
      { start: 13.2, end: 15, type: 'low', target: 'max', angle: -0.35, dolly: -0.1 },
    ],
    punches: [2.4, 5.2, 13.5],
    // Bouche synthétique pendant 'talk' (le vrai lip-sync basé sur les voix = phase 6)
    mouth: (id, t) => {
      const talking = { nino: [2.6, 4.8], max: [6.2, 8], zoe: [9.5, 11] }[id];
      if (!talking || t < talking[0] || t > talking[1]) return 0;
      return Math.max(0, Math.sin(t * 17) * 0.5 + Math.sin(t * 9.3) * 0.4);
    },
  };
}

export function buildDemo(stage) {
  const school = buildSchool(stage.scene);
  const seq = demoSequence(school.zones);
  const director = createDirector(stage, seq, { school });
  return { update: director.update, director, school, sequence: seq, duration: seq.duration };
}
