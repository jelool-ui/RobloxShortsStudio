// Libellés de l'interface, construits à partir des vraies données du moteur (pas de doublon à maintenir).
import { TEMPLATES } from '../story/templates.js';
import { CHARACTERS } from '../engine/characters.js';
import { ZONE_DATA } from '../engine/sets/marks.js';

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

export const ZONES = [
  { id: 'auto', label: 'Auto', icon: '🎲' },
  { id: 'hallway', label: ZONE_DATA.hallway.label, icon: '🚪' },
  { id: 'classroom', label: ZONE_DATA.classroom.label, icon: '📚' },
  { id: 'yard', label: ZONE_DATA.yard.label, icon: '🌳' },
];

const STORY_LABELS = {
  'devoir-oublie': 'Le devoir oublié',
  'casier-fantome': 'Le casier hanté',
  'concours-saut': 'Le concours de saut',
  'rumeur-pizza': 'La rumeur de la pizza',
  'sac-magique': 'Le sac magique',
  'interro-surprise': "L'interro surprise",
};
export const STORIES = [
  { id: 'auto', label: 'Surprise (au hasard)' },
  ...TEMPLATES.map((t) => ({ id: t.id, label: STORY_LABELS[t.id] ?? t.id, zones: t.zones })),
];

export const ROLES = [
  { id: 'A', label: 'Le farceur' },
  { id: 'B', label: 'Le cerveau' },
  { id: 'C', label: 'Le peureux' },
];

export const CAST = Object.values(CHARACTERS).map((c) => ({
  id: c.id,
  name: c.name,
  shirt: hex(c.colors.shirt),
  skin: hex(c.colors.skin),
  accent: hex(c.colors.accessory ?? c.colors.hair ?? 0x333333),
  hair: hex(c.colors.hair ?? c.colors.accessory ?? 0x333333),
}));

export const DEFAULTS = { zone: 'auto', template: 'auto', cast: ['nino', 'zoe', 'max'], quality: 'fast', seed: '' };

export const labelZone = (id) => ZONES.find((z) => z.id === id)?.label ?? id;
export const labelStory = (id) => STORIES.find((s) => s.id === id)?.label ?? id;
