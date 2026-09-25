/**
 * Journey Stories picture prompt.
 * Physical traits are copied from the existing character bibles
 * (tanty-illustrator CHARACTER_HINTS, ai-content-generator CHARACTER_PROFILES,
 * characterConfig / build-your-story for R.O.T.I.). No new looks.
 */
import { ART_STYLE_SUFFIX, CHARACTER_HINTS } from '@/lib/agents/tanty-illustrator';

/**
 * Sensory-safe, low cognitive load. Busy detail is a fail.
 * Not a new character design.
 */
export const JOURNEY_SENSORY_STYLE_ANCHOR = [
  'soft sensory-friendly lighting',
  'uncluttered background',
  'calm island colors',
  'composition focused on the action that matches the page text',
  'busy highly-detailed scenes are a fail for comprehension',
  'no text or letters in the image',
  'no scary medical gore',
].join(', ');

/**
 * Exact physical traits for Island Helpers. Quoted from existing bibles.
 * R.O.T.I. has no costume sheet; the words below are the existing robot identity only.
 */
export const ISLAND_HELPER_TRAITS: Record<string, string> = {
  tanty_spice: [
    CHARACTER_HINTS.tanty_spice,
    'Warm elderly Caribbean grandmother with a round face, kind twinkling eyes, colorful headwrap, floral dress, warm brown skin, and a gentle smile',
  ].join('. '),
  dilly_doubles: CHARACTER_HINTS.dilly_doubles,
  steelpan_sam: CHARACTER_HINTS.steelpan_sam,
  mango_moko: CHARACTER_HINTS.mango_moko,
  roti: 'R.O.T.I. is a friendly Caribbean island learning robot, a cute island robot and playful word robot',
};

export function existingTraitAnchor(characterId: string): string | null {
  return ISLAND_HELPER_TRAITS[characterId] || CHARACTER_HINTS[characterId] || null;
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

  return [
    "Children's book illustration",
    `Journey Story page (${input.pageRole}): ${input.pageText}`,
    'Draw only the action described in the page text. Keep the composition on that action.',
    anchors.length
      ? `EXACT character traits, the same on every page: ${anchors.join('. ')}`
      : '',
    'Do not invent a new character design.',
    JOURNEY_SENSORY_STYLE_ANCHOR,
    ART_STYLE_SUFFIX,
  ]
    .filter(Boolean)
    .join(', ');
}
