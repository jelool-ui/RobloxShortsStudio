// Distribution originale de RobloxShortsStudio.
// Chaque personnage a une voix Piper attitrée — voir docs/ARCHITECTURE.md §4.
// lengthScale < 1 = parle plus vite ; pitch = décalage de hauteur en demi-tons (voix plus jeune).
export const CHARACTERS = {
  nino: {
    id: 'nino',
    name: 'Nino',
    personality: 'farceur, énergique, toujours une idée folle',
    voice: { model: 'fr_FR-gilles-low', speaker: null, lengthScale: 0.92, pitch: 7, noiseScale: 0.7 },
    colors: {
      skin: 0xf2c39a,
      shirt: 0x2f6fdb,
      pants: 0x3a3f4b,
      shoes: 0xf2f2f2,
      accessory: 0xe53935,
      features: 0x1d1d26,
    },
    accessories: ['cap', 'star'],
  },
  zoe: {
    id: 'zoe',
    name: 'Zoé',
    personality: 'maline, curieuse, première de la classe',
    voice: { model: 'fr_FR-siwis-medium', speaker: null, lengthScale: 0.95, pitch: 2.5, noiseScale: 0.667 },
    colors: {
      skin: 0x9c6a48,
      shirt: 0x2fb36d,
      pants: 0x6a3fb5,
      shoes: 0x2b2b2b,
      hair: 0xff8a1f,
      accessory: 0xffd23f,
      features: 0x1a1414,
      brows: 0x5a2d0c,
    },
    accessories: ['pigtails', 'backpack'],
  },
  max: {
    id: 'max',
    name: 'Max',
    personality: 'grand, calme, peureux en secret',
    voice: { model: 'fr_FR-upmc-medium', speaker: 'pierre', lengthScale: 1.02, pitch: 0, noiseScale: 0.6 },
    scale: 1.1,
    colors: {
      skin: 0xffd9b8,
      shirt: 0xffc928,
      pants: 0x2d5fa8,
      shoes: 0x7a4a26,
      hair: 0x4a2e1a,
      accessory: 0x222222,
      features: 0x1d1d26,
    },
    accessories: ['spikyHair', 'glasses', 'stripe'],
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS);
