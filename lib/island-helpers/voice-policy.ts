/**
 * Island Helpers voice policy.
 *
 * Only voices that Ray has explicitly supplied may be selected here. R.O.T.I.
 * is locked to the supplied ElevenLabs voice; Steelpan Sam and Mango Moko stay
 * fail-closed until their own voice IDs arrive.
 */
import type { IslandHelpersCharacterId } from './types';
import { warmStoryVoiceId } from '@/lib/story-narration-policy';

export const DEFAULT_ROTI_VOICE_ID = 'fBD19tfE58bkETeiwUoC';

export function islandHelpersVoiceId(
  characterId: IslandHelpersCharacterId,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  switch (characterId) {
    case 'roti':
      return env.ELEVENLABS_ROTI_VOICE_ID?.trim() || DEFAULT_ROTI_VOICE_ID;
    case 'tanty_spice':
      return warmStoryVoiceId(env);
    case 'steelpan_sam':
    case 'mango_moko':
      return null;
  }
}

export function islandHelpersCharacterLabel(characterId: IslandHelpersCharacterId): string {
  switch (characterId) {
    case 'roti':
      return 'R.O.T.I.';
    case 'tanty_spice':
      return 'Tanty Spice';
    case 'steelpan_sam':
      return 'Steelpan Sam';
    case 'mango_moko':
      return 'Mango Moko';
  }
}
