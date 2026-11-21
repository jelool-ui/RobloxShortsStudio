// Fabrique de personnages cubiques procéduraux (aucun fichier 3D externe).
//
// Hiérarchie (unités ≈ « blocs », hauteur ≈ 5.3) :
//   root            position au sol, orientation globale
//   └─ body         rebond / inclinaison du corps entier (sauts, surprise)
//      ├─ legL/legR pivot à la hanche
//      └─ torso     pivot à la taille
//         ├─ armL/armR pivot à l'épaule
//         └─ head   pivot au cou → face (yeux, sourcils, bouche)
//
// API publique (utilisée par les animations, le lip-sync et les scènes) :
//   char.root, char.joints, char.def
//   char.setMouth(0..1)            ouverture de bouche (lip-sync)
//   char.setExpression(name)       neutral | happy | surprised | angry | sad | scared
//   char.setBlink(0..1)            fermeture des yeux
//   char.resetPose()               remet toutes les articulations à zéro
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const EXPRESSIONS = ['neutral', 'happy', 'surprised', 'angry', 'sad', 'scared'];

const matCache = new Map();
function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...opts }));
  }
  return matCache.get(key);
}

const geoCache = new Map();
function rbox(w, h, d, r = 0.08) {
  const key = `${w}|${h}|${d}|${r}`;
  if (!geoCache.has(key)) geoCache.set(key, new RoundedBoxGeometry(w, h, d, 2, r));
  return geoCache.get(key);
}

function part(w, h, d, color, { r = 0.08, shadow = true } = {}) {
  const m = new THREE.Mesh(rbox(w, h, d, r), mat(color));
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  return m;
}

// Visage : yeux, sourcils, bouche (géométrie simple, pas de texture → déterministe et testable)
function buildFace(def, headSize) {
  const face = new THREE.Group();
  face.name = 'face';
  const z = headSize / 2 + 0.005;
  const dark = def.colors.features ?? 0x1d1d26;

  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.24, 0.1, z);
    const pupil = new THREE.Mesh(rbox(0.16, 0.26, 0.03, 0.03), mat(dark));
    const shine = new THREE.Mesh(rbox(0.05, 0.07, 0.02, 0.01), mat(0xffffff, { emissive: 0x555555 }));
    shine.position.set(0.03, 0.06, 0.015);
    eye.add(pupil, shine);
    face.add(eye);
    eyes.push(eye);
  }

  const brows = [];
  for (const side of [-1, 1]) {
    const brow = new THREE.Mesh(rbox(0.26, 0.06, 0.03, 0.02), mat(def.colors.brows ?? dark));
    brow.position.set(side * 0.24, 0.32, z);
    face.add(brow);
    brows.push(brow);
  }

  // Bouche : un fond sombre (ouverture) + une ligne de sourire (fermée)
  const mouth = new THREE.Group();
  mouth.position.set(0, -0.24, z);
  const mouthOpen = new THREE.Mesh(rbox(0.34, 0.3, 0.03, 0.04), mat(0x5a1f2a));
  const tongue = new THREE.Mesh(rbox(0.2, 0.08, 0.02, 0.02), mat(0xe06070));
  tongue.position.set(0, -0.08, 0.012);
  mouthOpen.add(tongue);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 6, 16, Math.PI), mat(dark));
  smile.rotation.z = Math.PI; // arc vers le bas = sourire
  smile.position.y = 0.09;
  mouth.add(mouthOpen, smile);
  face.add(mouth);

  return { face, eyes, brows, mouth, mouthOpen, smile };
}

function addAccessories(def, parts) {
  const { head, headSize, torso } = parts;
  const c = def.colors;
  const top = headSize / 2;
  // Les accessoires de tête ne projettent pas d'ombre (évite une ombre dure sur le visage)
  const hpart = (w, h, d, color, o = {}) => part(w, h, d, color, { ...o, shadow: false });
  for (const acc of def.accessories ?? []) {
    switch (acc) {
      case 'cap': {
        const crown = hpart(headSize + 0.06, 0.35, headSize + 0.06, c.accessory, { r: 0.1 });
        crown.position.y = top + 0.1;
        const brim = hpart(headSize * 0.9, 0.08, 0.55, c.accessory, { r: 0.03 });
        brim.position.set(0, top - 0.02, headSize / 2 + 0.22);
        head.add(crown, brim);
        break;
      }
      case 'pigtails': {
        const hairTop = hpart(headSize + 0.04, 0.3, headSize + 0.04, c.hair, { r: 0.12 });
        hairTop.position.y = top + 0.02;
        const back = hpart(headSize + 0.04, headSize * 0.75, 0.18, c.hair, { r: 0.08 });
        back.position.set(0, 0.15, -headSize / 2 - 0.04);
        head.add(hairTop, back);
        for (const side of [-1, 1]) {
          const tail = hpart(0.32, 0.6, 0.32, c.hair, { r: 0.12 });
          tail.position.set(side * (headSize / 2 + 0.22), 0.05, -0.1);
          tail.rotation.z = side * 0.35;
          const tie = hpart(0.2, 0.1, 0.2, c.accessory, { r: 0.04 });
          tie.position.set(side * (headSize / 2 + 0.1), 0.3, -0.1);
          head.add(tail, tie);
        }
        break;
      }
      case 'spikyHair': {
        const base = hpart(headSize + 0.04, 0.32, headSize + 0.04, c.hair, { r: 0.12 });
        base.position.y = top + 0.0;
        const backHair = hpart(headSize + 0.04, headSize * 0.6, 0.16, c.hair, { r: 0.06 });
        backHair.position.set(0, 0.25, -headSize / 2 - 0.03);
        head.add(backHair);
        head.add(base);
        const spikes = [[-0.35, 0.2], [0, 0.32], [0.35, 0.22], [-0.15, 0.1], [0.2, 0.05]];
        spikes.forEach(([x, zz], i) => {
          const s = hpart(0.34, 0.42, 0.34, c.hair, { r: 0.08 });
          s.position.set(x, top + 0.22, zz - 0.2);
          s.rotation.set(-0.3, 0, (i - 2) * 0.18);
          head.add(s);
        });
        const fringe = hpart(headSize + 0.04, 0.16, 0.14, c.hair, { r: 0.06 });
        fringe.position.set(0, top - 0.12, headSize / 2 - 0.03);
        head.add(fringe);
        break;
      }
      case 'glasses': {
        const z = headSize / 2 + 0.03;
        for (const side of [-1, 1]) {
          const frame = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 4), mat(c.accessory));
          frame.rotation.z = Math.PI / 4;
          frame.position.set(side * 0.24, 0.1, z);
          head.add(frame);
        }
        const bridge = hpart(0.16, 0.04, 0.03, c.accessory, { r: 0.01 });
        bridge.position.set(0, 0.14, z);
        head.add(bridge);
        break;
      }
      case 'backpack': {
        const bag = part(1.5, 1.6, 0.6, c.accessory, { r: 0.15 });
        bag.position.set(0, 0, -0.75);
        torso.add(bag);
        break;
      }
      case 'stripe': {
        const s = part(2.02, 0.35, 1.02, c.accessory, { r: 0.04 });
        s.position.y = 0.15;
        torso.add(s);
        break;
      }
      case 'star': {
        const s = part(0.5, 0.5, 0.05, c.accessory, { r: 0.05 });
        s.rotation.z = Math.PI / 4;
        s.position.set(0, 0.2, 0.52);
        torso.add(s);
        break;
      }
      default:
        break;
    }
  }
}

export function createCharacter(def) {
  const c = def.colors;
  const s = def.scale ?? 1;

  const root = new THREE.Group();
  root.name = `char:${def.id}`;
  root.scale.setScalar(s);

  const body = new THREE.Group();
  body.name = 'body';
  root.add(body);

  // Jambes (pivot à la hanche, y = 2)
  const legs = {};
  for (const [name, x] of [['legL', -0.5], ['legR', 0.5]]) {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(x, 2, 0);
    const leg = part(0.96, 2, 0.96, c.pants);
    leg.position.y = -1;
    const shoe = part(1.0, 0.35, 1.08, c.shoes ?? 0x333333, { r: 0.06 });
    shoe.position.set(0, -1.85, 0.04);
    pivot.add(leg, shoe);
    body.add(pivot);
    legs[name] = pivot;
  }

  // Torse (pivot à la taille, y = 2)
  const torso = new THREE.Group();
  torso.name = 'torso';
  torso.position.y = 2;
  const torsoMesh = part(2, 2, 1, c.shirt);
  torsoMesh.position.y = 1;
  torso.add(torsoMesh);
  body.add(torso);

  // Bras (pivot à l'épaule)
  const arms = {};
  for (const [name, x] of [['armL', -1.5], ['armR', 1.5]]) {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(x, 1.8, 0);
    const sleeve = part(0.96, 0.9, 0.96, c.shirt);
    sleeve.position.y = -0.35;
    const arm = part(0.9, 1.3, 0.9, c.skin);
    arm.position.y = -1.3;
    pivot.add(sleeve, arm);
    torso.add(pivot);
    arms[name] = pivot;
  }

  // Tête (pivot au cou)
  const headSize = def.headSize ?? 1.3;
  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = 2;
  const headMesh = part(headSize, headSize, headSize, c.skin, { r: 0.16 });
  headMesh.position.y = headSize / 2;
  head.add(headMesh);
  const headContent = new THREE.Group(); // centre de la tête : visage + accessoires
  headContent.position.y = headSize / 2;
  head.add(headContent);
  torso.add(head);

  const faceParts = buildFace(def, headSize);
  headContent.add(faceParts.face);
  addAccessories(def, { head: headContent, headSize, torso: torsoMesh });

  const joints = { body, torso, head, ...arms, ...legs };

  // --- État du visage ---
  let mouthAmount = 0;
  let expression = 'neutral';
  let blink = 0;

  function applyFace() {
    const { eyes, brows, mouthOpen, smile } = faceParts;
    const e = expression;
    // Yeux
    const eyeScale = e === 'surprised' || e === 'scared' ? 1.3 : e === 'happy' ? 0.85 : 1;
    const eyeY = e === 'angry' ? 0.75 : e === 'sad' ? 0.85 : 1;
    eyes.forEach((eye) => {
      eye.scale.set(eyeScale, eyeScale * eyeY * Math.max(0.08, 1 - blink), 1);
    });
    // Sourcils
    brows.forEach((b, i) => {
      const side = i === 0 ? -1 : 1;
      let y = 0.32, rot = 0;
      if (e === 'surprised') y = 0.44;
      if (e === 'scared') { y = 0.42; rot = side * 0.25; }
      if (e === 'angry') { y = 0.28; rot = side * -0.4; }
      if (e === 'sad') { y = 0.34; rot = side * 0.35; }
      if (e === 'happy') y = 0.36;
      b.position.y = y;
      b.rotation.z = rot;
    });
    // Bouche
    let open = mouthAmount;
    if (e === 'surprised' || e === 'scared') open = Math.max(open, 0.85);
    const roundMouth = e === 'surprised' || e === 'scared';
    const visible = open > 0.04;
    mouthOpen.visible = visible;
    mouthOpen.scale.set(roundMouth ? 0.75 : 1, Math.max(0.15, open), 1);
    mouthOpen.position.y = -0.15 * open + 0.02;
    // Ligne de bouche quand fermée : sourire (happy/neutral), arc inversé (sad/angry)
    smile.visible = !visible;
    const frown = e === 'sad' || e === 'angry';
    smile.rotation.z = frown ? 0 : Math.PI;
    smile.position.y = frown ? -0.12 : 0.09;
    smile.scale.set(e === 'happy' ? 1.15 : 0.9, e === 'neutral' ? 0.45 : 0.9, 1);
  }
  applyFace();

  return {
    def,
    root,
    joints,
    headSize,
    get expression() { return expression; },
    get mouth() { return mouthAmount; },
    setMouth(v) { mouthAmount = THREE.MathUtils.clamp(v, 0, 1); applyFace(); },
    setExpression(name) {
      if (!EXPRESSIONS.includes(name)) throw new Error(`Expression inconnue : ${name}`);
      expression = name;
      applyFace();
    },
    setBlink(v) { blink = THREE.MathUtils.clamp(v, 0, 1); applyFace(); },
    resetPose() {
      for (const j of Object.values(joints)) j.rotation.set(0, 0, 0);
      body.position.set(0, 0, 0);
    },
    _face: faceParts,
  };
}
