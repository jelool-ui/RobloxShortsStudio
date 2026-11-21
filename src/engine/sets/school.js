// Décor : école procédurale en 3 zones éloignées les unes des autres dans le même monde.
//   hallway   (origine   0, 0,    0) : couloir, casiers, portes, affiches
//   classroom (origine   0, 0, -100) : tableau, pupitres, fenêtres
//   yard      (origine 100, 0,    0) : cour, façade de l'école, arbres, panier de basket
// La caméra regarde toujours depuis le côté +z (le « quatrième mur » ouvert).
// Chaque zone expose des « marques » (positions [x, z] en coordonnées monde) pour la mise en scène.
import * as THREE from 'three';

const mats = new Map();
function mat(color, extra = {}) {
  const key = `${color}|${JSON.stringify(extra)}`;
  if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra }));
  return mats.get(key);
}
const glow = (color, intensity = 0.6) => mat(color, { emissive: color, emissiveIntensity: intensity });

// Boîte posée : y = bas de la boîte
function box(parent, w, h, d, material, x, y, z, { cast = false, receive = true } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof material === 'number' ? mat(material) : material);
  m.position.set(x, y + h / 2, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  parent.add(m);
  return m;
}

// Texture procédurale (DataTexture → fonctionne aussi sous Node pour les tests)
function patternTex(colors, w, h, repeatX, repeatY) {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const c = new THREE.Color(colors[i % colors.length]);
    data.set([c.r * 255, c.g * 255, c.b * 255, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, w, h);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function floor(parent, w, d, cx, cz, material) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  m.rotation.x = -Math.PI / 2;
  m.position.set(cx, 0, cz);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function ceiling(parent, w, d, cx, cz, y, lightsEvery = 8) {
  const c = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(0xf4f4f0, { emissive: 0xe8e6dc, emissiveIntensity: 0.75 }));
  c.rotation.x = Math.PI / 2;
  c.position.set(cx, y, cz);
  parent.add(c);
  for (let x = cx - w / 2 + lightsEvery / 2; x < cx + w / 2; x += lightsEvery) {
    for (let z = cz - d / 2 + 4; z < cz + d / 2; z += lightsEvery) {
      box(parent, 3, 0.15, 1.2, glow(0xfffbe8, 1), x, y - 0.15, z);
    }
  }
}

function clock(parent, x, y, z) {
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 20), mat(0xffffff));
  face.rotation.x = Math.PI / 2;
  face.position.set(x, y, z + 0.1);
  parent.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.1, 6, 20), mat(0x333333));
  rim.position.set(x, y, z + 0.2);
  parent.add(rim);
  box(parent, 0.08, 0.6, 0.05, 0x222222, x, y, z + 0.25);
  const hand = box(parent, 0.45, 0.08, 0.05, 0x222222, x + 0.2, y - 0.04, z + 0.25);
  hand.rotation.z = 0.4;
}

function poster(parent, x, y, z, w, h, bg, accent) {
  box(parent, w, h, 0.05, bg, x, y, z);
  box(parent, w * 0.7, h * 0.18, 0.06, accent, x, y + h * 0.65, z);
  box(parent, w * 0.5, h * 0.35, 0.06, glow(accent, 0.15), x, y + h * 0.15, z);
}

// ---------------------------------------------------------------- COULOIR
function buildHallway(root) {
  const g = new THREE.Group();
  g.name = 'hallway';
  root.add(g);
  const backZ = -8, H = 11;

  floor(g, 50, 40, 0, 12, mat(0xffffff, { map: patternTex([0xe9e4d8, 0x9fb4c8, 0x9fb4c8, 0xe9e4d8], 2, 2, 12.5, 10) }));
  ceiling(g, 50, 40, 0, 12, H);
  box(g, 50, H, 0.5, 0xf1e6c8, 0, 0, backZ - 0.25);              // mur du fond
  box(g, 50, 2.6, 0.55, 0x6f9cc4, 0, 0, backZ - 0.2);            // soubassement
  box(g, 50, 0.3, 0.6, 0x4b6f91, 0, 2.6, backZ - 0.2);
  for (const sx of [-1, 1]) box(g, 0.5, H, 40, 0xf1e6c8, sx * 25, 0, 12); // murs latéraux

  // Casiers (sauf devant les portes)
  const lockerColors = [0x3f7fd0, 0x3a74c0];
  let i = 0;
  for (let x = -23; x <= 23; x += 1.7) {
    if (Math.abs(x + 10) < 3 || Math.abs(x - 10) < 3) continue;
    box(g, 1.6, 6, 1.2, lockerColors[i % 2], x, 0, backZ + 0.6, { cast: true });
    for (let v = 0; v < 3; v++) box(g, 1.0, 0.08, 0.05, 0x22406b, x, 4.8 + v * 0.25, backZ + 1.22);
    box(g, 0.12, 0.5, 0.1, 0xcfd6dc, x + 0.5, 2.8, backZ + 1.25);
    i++;
  }

  // Portes de classes
  for (const dx of [-10, 10]) {
    box(g, 4.6, 8.2, 0.4, 0x5b3a22, dx, 0, backZ + 0.15);
    box(g, 3.8, 7.6, 0.45, 0x9a6a3e, dx, 0, backZ + 0.2);
    box(g, 1.2, 1.8, 0.5, glow(0xbfe6ff, 0.5), dx - 0.8, 4.6, backZ + 0.2);
    box(g, 0.2, 0.2, 0.6, 0xd8c060, dx + 1.4, 3.5, backZ + 0.25);
    box(g, 2.6, 0.8, 0.1, dx < 0 ? 0x2fb36d : 0xe5534b, dx, 8.6, backZ + 0.1);
  }

  // Affiches, horloge, panneau d'affichage
  poster(g, -18, 7, backZ + 0.05, 2.4, 3, 0xffe082, 0xe53935);
  poster(g, -4.5, 7, backZ + 0.05, 2.2, 2.8, 0xb3e5fc, 0x1e88e5);
  poster(g, 4.5, 7.2, backZ + 0.05, 2.6, 2.6, 0xc8e6c9, 0x43a047);
  poster(g, 18, 7, backZ + 0.05, 2.4, 3, 0xf8bbd0, 0x8e24aa);
  box(g, 7, 3.2, 0.1, 0xb07a4a, 0, 6.8, backZ + 0.05);
  box(g, 6.6, 2.8, 0.12, 0xd9a86c, 0, 7.0, backZ + 0.05);
  for (const [px, py, c] of [[-2.3, 7.6, 0xffffff], [-0.6, 7.3, 0xfff59d], [1.2, 7.8, 0x80deea], [2.4, 7.1, 0xffffff]]) {
    box(g, 1.1, 1.3, 0.14, c, px, py, backZ + 0.05);
  }
  clock(g, 0, 10.2 - 0.6, backZ + 0.05);

  // Poubelle + fontaine
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 1.8, 12), mat(0x2e7d32));
  bin.position.set(-22.5, 0.9, -4);
  bin.castShadow = true;
  g.add(bin);
  box(g, 1.6, 2.6, 1.2, 0xb0bec5, 22.5, 0, -5.5, { cast: true });

  return {
    group: g,
    origin: [0, 0],
    marks: {
      left: [-15, -1], center: [0, -1], right: [15, -1],
      farLeft: [-22, 2], farRight: [22, 2],
      lockerL: [-5.5, -5], lockerR: [5.5, -5], doorL: [-10, -5.5], doorR: [10, -5.5],
      front: [0, 5],
    },
  };
}

// ---------------------------------------------------------------- SALLE DE CLASSE
function buildClassroom(root) {
  const oz = -100;
  const g = new THREE.Group();
  g.name = 'classroom';
  root.add(g);
  const backZ = oz - 10, H = 11;

  floor(g, 34, 44, 0, oz + 12, mat(0xffffff, { map: patternTex([0xc68a52, 0xb47a46], 1, 2, 1, 22) }));
  ceiling(g, 34, 44, 0, oz + 12, H);
  box(g, 34, H, 0.5, 0xd7e8cf, 0, 0, backZ - 0.25);
  box(g, 34, 2.2, 0.55, 0x8fb88a, 0, 0, backZ - 0.2);
  box(g, 0.5, H, 44, 0xd7e8cf, -17, 0, oz + 12);
  box(g, 0.5, H, 44, 0xd7e8cf, 17, 0, oz + 12);

  // Tableau + écritures à la craie
  box(g, 15, 5.6, 0.3, 0x7a5230, 0, 3.2, backZ + 0.1);
  box(g, 14.2, 4.9, 0.35, 0x2f5d46, 0, 3.55, backZ + 0.12);
  box(g, 14.4, 0.3, 0.8, 0x7a5230, 0, 3.2, backZ + 0.4);
  const chalk = mat(0xf2f2f2);
  [[-4.5, 7.2, 4], [-5, 6.4, 3], [-4.2, 5.6, 4.6], [-5.4, 4.8, 2.4]].forEach(([x, y, w]) => box(g, w, 0.16, 0.38, chalk, x, y, backZ + 0.13));
  // petit dessin : maison + soleil
  box(g, 2.4, 1.6, 0.38, chalk, 3.5, 4.4, backZ + 0.12).scale.set(1, 1, 1);
  box(g, 2.2, 1.4, 0.4, 0x2f5d46, 3.5, 4.5, backZ + 0.13);
  const roof = box(g, 2.2, 0.16, 0.4, chalk, 3.0, 6.2, backZ + 0.13); roof.rotation.z = 0.6;
  const roof2 = box(g, 2.2, 0.16, 0.4, chalk, 4.0, 6.2, backZ + 0.13); roof2.rotation.z = -0.6;
  const sun = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 6, 16), mat(0xfff176));
  sun.position.set(5.8, 7.2, backZ + 0.35);
  g.add(sun);
  clock(g, 0, 9.8, backZ + 0.05);

  // Fenêtres (mur gauche)
  for (const z of [oz - 4, oz + 4, oz + 12]) {
    box(g, 0.6, 5.2, 5.2, 0xffffff, -16.8, 3.2, z);
    box(g, 0.7, 4.6, 2.2, glow(0xbfe6ff, 0.9), -16.8, 3.5, z - 1.25);
    box(g, 0.7, 4.6, 2.2, glow(0xbfe6ff, 0.9), -16.8, 3.5, z + 1.25);
  }
  // Mur droit : porte + affiches
  box(g, 0.4, 8, 4.4, 0x5b3a22, 16.8, 0, oz - 3);
  box(g, 0.45, 7.4, 3.6, 0x9a6a3e, 16.75, 0, oz - 3);
  poster(g, 16.7, 4, oz + 5, 0.1, 0.1, 0xffffff, 0xffffff);
  [[oz + 4, 0xffcc80], [oz + 9, 0x90caf9]].forEach(([z, c]) => box(g, 0.1, 3, 3, c, 16.7, 4, z));

  // Bureau du professeur
  box(g, 5, 2.6, 2.6, 0x8d5a32, -10, 0, oz - 6.5, { cast: true });
  box(g, 5.3, 0.25, 2.9, 0xa86f40, -10, 2.6, oz - 6.5, { cast: true });
  box(g, 0.9, 0.9, 0.9, 0xe53935, -11, 2.85, oz - 6.5, { cast: true }); // pomme cubique
  box(g, 0.15, 0.4, 0.15, 0x5d4037, -11, 3.75, oz - 6.5);
  box(g, 1.6, 0.4, 1.2, 0x1e88e5, -8.8, 2.85, oz - 6.3, { cast: true }); // livres

  // Pupitres (3 × 3) + chaises
  for (const row of [2, 8.5, 15]) {
    for (const col of [-8, 0, 8]) {
      const z = oz + row;
      box(g, 3.4, 0.25, 2.2, 0xd9a86c, col, 2.5, z, { cast: true });
      for (const [lx, lz] of [[-1.5, -0.9], [1.5, -0.9], [-1.5, 0.9], [1.5, 0.9]]) {
        box(g, 0.18, 2.5, 0.18, 0x607d8b, col + lx, 0, z + lz);
      }
      box(g, 2.0, 0.22, 1.6, 0x26a69a, col, 1.5, z + 2.0, { cast: true });
      box(g, 2.0, 1.6, 0.22, 0x26a69a, col, 1.7, z + 2.8, { cast: true });
      for (const [lx, lz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, 2.6], [0.85, 2.6]]) {
        box(g, 0.14, 1.5, 0.14, 0x455a64, col + lx, 0, z + lz);
      }
    }
  }

  return {
    group: g,
    origin: [0, oz],
    marks: {
      board: [0, oz - 7], boardLeft: [-4.5, oz - 6.5], boardRight: [4.5, oz - 6.5],
      teacherDesk: [-10, oz - 3.5], door: [14.5, oz - 3],
      aisleLeft: [-4, oz + 5], aisleRight: [4, oz + 5], center: [0, oz - 3],
      left: [-4.5, oz - 3.5], right: [4.5, oz - 3.5],
    },
  };
}

// ---------------------------------------------------------------- COUR
function tree(g, x, z, s = 1) {
  box(g, 1.2 * s, 5 * s, 1.2 * s, 0x7b4a2a, x, 0, z, { cast: true });
  box(g, 5 * s, 3.2 * s, 5 * s, 0x3f9b3f, x, 4.4 * s, z, { cast: true });
  box(g, 3.6 * s, 2.4 * s, 3.6 * s, 0x4fb54a, x + 0.3 * s, 7.4 * s, z - 0.2 * s, { cast: true });
}

function buildYard(root) {
  const ox = 100;
  const g = new THREE.Group();
  g.name = 'yard';
  root.add(g);

  floor(g, 160, 120, ox, 0, mat(0xffffff, { map: patternTex([0x6cc24a, 0x66b947], 2, 2, 40, 30) }));
  floor(g, 40, 22, ox, -2, mat(0xc9c3b6)).position.y = 0.02; // cour goudronnée

  // Marelle
  const hop = [[0, 0], [0, 2.2], [-1.1, 4.4], [1.1, 4.4], [0, 6.6], [-1.1, 8.8], [1.1, 8.8]];
  hop.forEach(([hx, hz], k) => {
    box(g, 2, 0.04, 2, [0xff7043, 0xffca28, 0x42a5f5, 0x66bb6a][k % 4], ox - 9 + hx, 0.02, 6 - hz);
  });

  // Façade de l'école
  const fz = -24;
  box(g, 62, 17, 6, 0xc0533a, ox, 0, fz - 3);
  box(g, 64, 1, 7, 0x8d3a28, ox, 17, fz - 3);
  for (const wx of [-24, -16, -8, 8, 16, 24]) {
    for (const wy of [3, 10]) {
      box(g, 4.4, 4.4, 0.3, 0xffffff, ox + wx, wy, fz + 0.1);
      box(g, 3.8, 3.8, 0.4, glow(0xbfe6ff, 0.7), ox + wx, wy + 0.3, fz + 0.1);
    }
  }
  box(g, 7, 8.5, 0.4, 0xffffff, ox, 0, fz + 0.1);
  box(g, 6, 8, 0.5, 0x2f6fdb, ox, 0, fz + 0.15);
  box(g, 0.15, 8, 0.6, 0xffffff, ox, 0, fz + 0.2);
  box(g, 12, 2.6, 0.5, 0xffffff, ox, 11.5, fz + 0.15);   // enseigne
  box(g, 11, 1.6, 0.6, 0x1e5bb8, ox, 12, fz + 0.2);
  for (let k = -4; k <= 4; k++) box(g, 0.6, 0.9, 0.7, 0xffd23f, ox + k * 1.1, 12.35, fz + 0.2); // « lettres » cubiques
  box(g, 10, 0.5, 3, 0x9e9e9e, ox, 0, fz + 1.5);            // marche

  // Arbres, banc, panier de basket, nuages
  tree(g, ox - 22, -10, 1.1);
  tree(g, ox + 24, -12, 1);
  tree(g, ox - 30, 4, 0.9);
  box(g, 6, 0.4, 1.6, 0xa86f40, ox + 13, 1.4, 6, { cast: true });
  for (const bx of [-2.6, 2.6]) box(g, 0.4, 1.4, 1.4, 0x555555, ox + 13 + bx, 0, 6, { cast: true });
  box(g, 6, 1.6, 0.3, 0xa86f40, ox + 13, 2.2, 6.8, { cast: true });
  box(g, 0.5, 9, 0.5, 0x607d8b, ox + 16, 0, -9, { cast: true });
  box(g, 4.4, 3, 0.25, 0xffffff, ox + 16, 8.5, -8.5, { cast: true });
  box(g, 1.8, 1.2, 0.3, 0xe53935, ox + 16, 9.0, -8.4);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 18), mat(0xff6d00));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(ox + 16, 8.7, -7.4);
  g.add(ring);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), mat(0xff7a1a));
  ball.position.set(ox + 12, 0.55, -4);
  ball.castShadow = true;
  ball.name = 'ball';
  g.add(ball);
  for (const [cx, cy, cz] of [[-40, 30, -70], [10, 36, -80], [45, 28, -65]]) {
    box(g, 14, 3, 6, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3 }), ox + cx, cy, cz);
    box(g, 8, 3, 5, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3 }), ox + cx + 2, cy + 2.5, cz);
  }

  return {
    group: g,
    origin: [ox, 0],
    marks: {
      center: [ox, 0], left: [ox - 12, 1], right: [ox + 12, 1],
      farLeft: [ox - 26, 6], farRight: [ox + 26, 6],
      hoop: [ox + 14, -5], tree: [ox - 19, -6], bench: [ox + 13, 3.5],
      door: [ox, -19], hopscotch: [ox - 9, 4],
    },
  };
}

export const ZONES = ['hallway', 'classroom', 'yard'];

/** Construit toute l'école dans la scène et renvoie les zones et leurs marques. */
export function buildSchool(scene) {
  const root = new THREE.Group();
  root.name = 'school';
  scene.add(root);
  const zones = {
    hallway: buildHallway(root),
    classroom: buildClassroom(root),
    yard: buildYard(root),
  };
  // N'affiche que la zone la plus proche du point filmé (gain de vitesse de rendu important)
  function showNear(x, z) {
    let best = null, bd = Infinity;
    for (const [name, zone] of Object.entries(zones)) {
      const d = Math.hypot(zone.origin[0] - x, zone.origin[1] - z);
      if (d < bd) { bd = d; best = name; }
    }
    for (const [name, zone] of Object.entries(zones)) zone.group.visible = name === best;
    return best;
  }
  return { root, zones, showNear };
}
