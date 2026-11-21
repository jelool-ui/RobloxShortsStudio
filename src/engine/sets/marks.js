// Données de mise en scène des zones de l'école (pures, sans 3D) :
// utilisées par le décor 3D ET par le storyboard (qui tourne sous Node, sans navigateur).
// Toutes les positions sont des coordonnées monde [x, z]. La caméra filme depuis le côté +z.
//
// Marques communes à toutes les zones (le storyboard peut toujours compter dessus) :
//   left, center, right        positions de conversation (espacées de ~4,5)
//   farLeft, farRight          entrées / sorties de champ
//   front                      plus près de la caméra
const oz = -100; // origine de la classe
const ox = 100; // origine de la cour

export const ZONE_DATA = {
  hallway: {
    label: 'Couloir',
    origin: [0, 0],
    marks: {
      left: [-4.5, -1], center: [0, -1.5], right: [4.5, -1],
      farLeft: [-22, 1], farRight: [22, 1], front: [0, 4],
      lockerL: [-5.5, -5], lockerR: [5.5, -5], doorL: [-10, -5.5], doorR: [10, -5.5],
      spotL: [-15, -1], spotR: [15, -1],
    },
    // objets du décor qui peuvent masquer un personnage : [x, z, rayon, hauteur]
    props: [[-22.5, -4, 1, 1.8], [22.5, -5.5, 1.2, 2.6]],
  },
  classroom: {
    label: 'Salle de classe',
    origin: [0, oz],
    marks: {
      left: [-4.5, oz - 3.5], center: [0, oz - 4], right: [4.5, oz - 3.5],
      farLeft: [-14, oz - 2], farRight: [14, oz - 2], front: [0, oz - 1],
      board: [0, oz - 7], boardLeft: [-2.2, oz - 6.5], boardRight: [2.2, oz - 6.5],
      teacherDesk: [-10, oz - 3.5], door: [14.5, oz - 3],
      aisleLeft: [-4, oz + 7], aisleRight: [4, oz + 7],
    },
    props: [[-10, oz - 6.5, 2.8, 2.9]],
  },
  yard: {
    label: 'Cour de récréation',
    origin: [ox, 0],
    marks: {
      left: [ox - 4.5, 1], center: [ox, 0.5], right: [ox + 4.5, 1],
      farLeft: [ox - 26, 6], farRight: [ox + 26, 6], front: [ox, 5],
      hoop: [ox + 14, -5], tree: [ox - 19, -6], bench: [ox + 13, 3.5],
      door: [ox, -19], hopscotch: [ox - 9, 4],
      spotL: [ox - 12, 1], spotR: [ox + 12, 1],
    },
    props: [[ox + 13, 6.3, 3.3, 3.8], [ox - 22, -10, 3, 11], [ox + 24, -12, 2.7, 10], [ox - 30, 4, 2.4, 9], [ox + 16, -8.8, 1.2, 11]],
  },
};

export const ZONE_IDS = Object.keys(ZONE_DATA);

// Si une marque spécifique n'existe pas dans la zone choisie, on retombe sur une marque commune.
const FALLBACK = {
  lockerL: 'left', lockerR: 'right', doorL: 'farLeft', doorR: 'farRight',
  board: 'center', boardLeft: 'left', boardRight: 'right', teacherDesk: 'left', door: 'farRight',
  aisleLeft: 'left', aisleRight: 'right', hoop: 'right', tree: 'left', bench: 'right',
  hopscotch: 'left', spotL: 'left', spotR: 'right',
};

export function resolveMark(zone, name) {
  const marks = ZONE_DATA[zone]?.marks;
  if (!marks) throw new Error(`Zone inconnue : ${zone}`);
  if (Array.isArray(name)) return name;
  if (marks[name]) return [...marks[name]];
  const fb = FALLBACK[name];
  if (fb && marks[fb]) return [...marks[fb]];
  throw new Error(`Marque inconnue « ${name} » dans la zone ${zone}`);
}

/** Tous les obstacles fixes des décors (coordonnées monde). */
export const ALL_PROPS = Object.values(ZONE_DATA).flatMap((z) => z.props || []);
