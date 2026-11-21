// Scène de présentation des 3 personnages (phase 3) :
// idle, expressions qui défilent, bouches qui parlent à tour de rôle, caméra en orbite lente.
import * as THREE from 'three';
import { createCharacter, EXPRESSIONS } from '../character.js';
import { CHARACTERS, CHARACTER_IDS } from '../characters.js';
import { applyIdle, seedOf } from '../idle.js';

export function buildShowcase(stage) {
  const { scene, camera } = stage;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x5fbf5a, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Petite dalle de « scène »
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.3, 5),
    new THREE.MeshStandardMaterial({ color: 0xd9d4c7, roughness: 0.9 }),
  );
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  scene.add(plinth);

  const chars = CHARACTER_IDS.map((id, i) => {
    const c = createCharacter(CHARACTERS[id]);
    c.root.position.set((i - 1) * 3.3, 0.3, (i === 1 ? -0.6 : 0));
    c.root.rotation.y = (1 - i) * 0.25;
    scene.add(c.root);
    return { c, seed: seedOf(id) };
  });

  function update(t) {
    chars.forEach(({ c, seed }, i) => {
      applyIdle(c, t, seed);
      // Chacun parle 1,5 s à tour de rôle (bouche synthétique ; le vrai lip-sync = phase 6)
      const speaker = Math.floor(t / 1.5) % chars.length;
      const talking = speaker === i;
      const m = talking ? Math.max(0, Math.sin(t * 17 + i) * 0.5 + Math.sin(t * 9.3) * 0.4) : 0;
      c.setMouth(m);
      // Expressions qui défilent
      const ex = EXPRESSIONS[(Math.floor(t / 2) + i * 2) % EXPRESSIONS.length];
      c.setExpression(ex);
    });
    const a = Math.sin(t * 0.3) * 0.35;
    camera.position.set(Math.sin(a) * 30, 4.5, Math.cos(a) * 30);
    camera.lookAt(0, 3, 0);
  }

  return { update, characters: chars.map((x) => x.c) };
}
