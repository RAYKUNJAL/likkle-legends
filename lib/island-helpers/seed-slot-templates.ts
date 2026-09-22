import type { SlotTemplate } from './slot-phrases';

export const SEED_SLOT_TEMPLATES: SlotTemplate[] = [
  {
    id: 'want_to',
    characterId: 'steelpan_sam',
    pattern: 'I want to ___.',
    slots: [{ id: 'activity', label: 'do' }],
    fringeOptions: [
      { id: 'play', text: 'play' },
      { id: 'eat', text: 'eat' },
      { id: 'rest', text: 'rest' },
      { id: 'outside', text: 'go outside' },
    ],
  },
  {
    id: 'need',
    characterId: 'tanty_spice',
    pattern: 'I need ___.',
    slots: [{ id: 'need', label: 'need' }],
    fringeOptions: [
      { id: 'help', text: 'help' },
      { id: 'quiet', text: 'quiet' },
      { id: 'break', text: 'a break' },
      { id: 'time', text: 'more time' },
    ],
  },
  {
    id: 'first_then',
    characterId: 'roti',
    pattern: 'First ___, then ___.',
    slots: [
      { id: 'first', label: 'first' },
      { id: 'then', label: 'then' },
    ],
    fringeOptions: [
      { id: 'wash', text: 'wash hands' },
      { id: 'story', text: 'story time' },
      { id: 'snack', text: 'snack' },
      { id: 'play', text: 'play' },
      { id: 'shoes', text: 'shoes on' },
      { id: 'outside', text: 'go outside' },
    ],
  },
  {
    id: 'feel',
    characterId: 'mango_moko',
    pattern: 'I feel ___ right now.',
    slots: [{ id: 'feeling', label: 'feeling' }],
    fringeOptions: [
      { id: 'calm', text: 'calm' },
      { id: 'wobbly', text: 'a little wobbly' },
      { id: 'happy', text: 'happy' },
      { id: 'tired', text: 'tired' },
    ],
  },
];

export function getSlotTemplate(id: string): SlotTemplate | undefined {
  return SEED_SLOT_TEMPLATES.find((t) => t.id === id);
}
