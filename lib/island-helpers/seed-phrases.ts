/**
 * Island Helpers — seed phrase packs (Cut 1).
 * Caribbean English gestalts. No clinic-speak.
 */
import type { IslandHelpersCharacterId } from './types';

export type SeedPhraseCard = {
  id: string;
  characterId: IslandHelpersCharacterId;
  text: string;
  imageSrc?: string;
  sortOrder: number;
  source: 'seed';
  speakVoiceId?: string;
};

function seed(
  characterId: IslandHelpersCharacterId,
  items: string[],
): SeedPhraseCard[] {
  return items.map((text, i) => ({
    id: `seed:${characterId}:${i + 1}`,
    characterId,
    text,
    sortOrder: i + 1,
    source: 'seed' as const,
  }));
}

export const SEED_PHRASES: SeedPhraseCard[] = [
  ...seed('tanty_spice', [
    'Come sit with me.',
    'You can take a break.',
    'I need help, please.',
    'That feels hard right now.',
    'I’m proud of you.',
    'Let’s try together.',
    'It’s okay to feel big feelings.',
  ]),
  ...seed('steelpan_sam', [
    'I want to play.',
    'Let’s make music.',
    'One more turn.',
    'Can I join in?',
    'That rhythm feels good.',
    'My turn, then your turn.',
    'Let’s dance a little.',
  ]),
  ...seed('mango_moko', [
    'I need quiet.',
    'Slow down.',
    'I’m ready when I’m ready.',
    'Too loud for me.',
    'Give me a minute.',
    'Soft voices, please.',
    'I want a calm space.',
  ]),
  ...seed('roti', [
    'I’m hungry.',
    'All done.',
    'First this, then that.',
    'I want a snack.',
    'More, please.',
    'I’m finished eating.',
    'What’s next on our list?',
  ]),

  ...seed('dilly_doubles', [
    'Let’s share a bite.',
    'That smells yummy.',
    'I want to try something new.',
    'Can we cook together?',
    'More sauce, please.',
    'I’m thankful for this food.',
    'Let’s invite a friend.',
  ]),
];
