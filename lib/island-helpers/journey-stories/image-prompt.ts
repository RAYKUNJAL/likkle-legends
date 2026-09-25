/**
 * Journey Stories picture prompt.
 * Reuses the existing Island Helpers / library character trait anchors.
 * Does not invent a new character look. Brand art stays on hold.
 */
import { ART_STYLE_SUFFIX, CHARACTER_HINTS } from '@/lib/agents/tanty-illustrator';

/** Sensory-safe constraints. Not a new character design. */
export const JOURNEY_SENSORY_STYLE_ANCHOR = [
  'soft sensory-friendly lighting',
  'uncluttered background',
  'calm island colors',
  'no text or letters in the image',
  'no scary medical gore',
].join(', ');

const FRIEND_NAMES: Record<string, string> = {
  tanty_spice: 'Tanty Spice',
  steelpan_sam: 'Steelpan Sam',
  mango_moko: 'Mango Moko',
  roti: 'R.O.T.I.',
  dilly_doubles: 'Dilly Doubles',
};

export function existingTraitAnchor(characterId: string): string | null {
  return CHARACTER_HINTS[characterId] || null;
}

export function buildJourneyImagePrompt(input: {
  pageRole: string;
  pageText: string;
  castCharacterIds: string[];
}): string {
  const cast = input.castCharacterIds.filter(Boolean);
  const anchors = cast
    .map((id) => existingTraitAnchor(id))
    .filter((line): line is string => Boolean(line));
  const unnamed = cast
    .filter((id) => !existingTraitAnchor(id))
    .map((id) => FRIEND_NAMES[id] || id);

  return [
    "Children's book illustration",
    `Journey Story page (${input.pageRole}): ${input.pageText}`,
    anchors.length ? `Existing character anchors only: ${anchors.join('. ')}` : '',
    unnamed.length
      ? `Friends without a trait anchor (do not invent a new character design): ${unnamed.join(', ')}`
      : '',
    'Do not invent a new character design.',
    JOURNEY_SENSORY_STYLE_ANCHOR,
    ART_STYLE_SUFFIX,
  ]
    .filter(Boolean)
    .join(', ');
}
