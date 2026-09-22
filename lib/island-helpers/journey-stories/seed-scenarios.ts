/**
 * Journey Stories — seed scenarios (Cut 2).
 * Parent-facing adventure language. No trademarked product names.
 */
import type { IslandHelpersCharacterId } from '../types';

export type JourneySeedScenario = {
  id: string;
  parentLabel: string;
  description: string;
  sensoryNotes: string;
  titleTemplate: string;
  defaultCast: IslandHelpersCharacterId[];
  pointOfView: 'first' | 'third';
};

export const SEED_SCENARIOS: JourneySeedScenario[] = [
  {
    id: 'dentist',
    parentLabel: 'Visiting the dentist',
    description: 'A calm adventure about going to the dentist chair and what mouths and tools might feel or sound like.',
    sensoryNotes:
      'Bright lights, chair that leans back, gentle buzzing tools, cool water rinse, gloves, waiting room chairs. Keep framing curious and safe — not scary.',
    titleTemplate: '{cast} Visits the Dentist',
    defaultCast: ['tanty_spice', 'roti'],
    pointOfView: 'third',
  },
  {
    id: 'new_food',
    parentLabel: 'Trying a new food',
    description: 'Trying a new island bite — looking, smelling, and tasting at your own pace.',
    sensoryNotes:
      'New smells, crunchy or soft textures, warm or cool food, plates and spoons. Celebrate noticing and choosing — no pressure to finish.',
    titleTemplate: 'R.O.T.I. Tries Something New',
    defaultCast: ['roti', 'tanty_spice'],
    pointOfView: 'third',
  },
  {
    id: 'loud_fete',
    parentLabel: 'Loud fête / carnival sounds',
    description: 'Steelpan, drums, and joyful crowd sounds at a loud fête — with ways to take a break.',
    sensoryNotes:
      'Loud music, steelpan rings, drums, cheering, bright costumes, crowded walkways. Offer quiet corners and headphones as options, descriptively.',
    titleTemplate: 'Steelpan Sam at the Loud Fête',
    defaultCast: ['steelpan_sam', 'mango_moko'],
    pointOfView: 'third',
  },
  {
    id: 'haircut',
    parentLabel: 'Getting a haircut',
    description: 'Haircut day — cape, scissors sounds, and looking in the mirror afterward.',
    sensoryNotes:
      'Cape on shoulders, snip sounds, buzz of clippers (optional), spray bottle mist, mirror, chair spin. Keep gentle and affirming.',
    titleTemplate: 'Tanty and the Haircut Day',
    defaultCast: ['tanty_spice', 'roti'],
    pointOfView: 'third',
  },
  {
    id: 'airplane',
    parentLabel: 'Riding an airplane',
    description: 'An airplane adventure — seatbelt, window clouds, and engine hum.',
    sensoryNotes:
      'Airport lines, engine hum, seatbelt click, pressure in ears, tray table, window view. Curious travel energy; offer calm breathing descriptively.',
    titleTemplate: 'Mango Moko’s Airplane Adventure',
    defaultCast: ['mango_moko', 'tanty_spice'],
    pointOfView: 'third',
  },
  {
    id: 'board_talks',
    parentLabel: 'My board talks for me',
    description: 'Pride story about using a talk board / phrase cards as a real voice with friends.',
    sensoryNotes:
      'Tap sounds on a board, clear speech from the device, friends listening, proud sharing. Celebrate AAC as valid talking — never deficit framing.',
    titleTemplate: 'My Board Talks for Me',
    defaultCast: ['tanty_spice', 'steelpan_sam'],
    pointOfView: 'first',
  },
];

export function getScenario(id: string): JourneySeedScenario | undefined {
  return SEED_SCENARIOS.find((s) => s.id === id);
}

export const SEED_SCENARIO_IDS = SEED_SCENARIOS.map((s) => s.id);
