/**
 * Island Helpers voice policy.
 *
 * Only voices that Ray has explicitly supplied may be selected here.
 * Each Island Helpers character maps to its own ElevenLabs voice ID.
 * Unknown / unset character voices fail closed (null) — never fall back to Tanty.
 */
import type { IslandHelpersCharacterId } from './types';
import { warmStoryVoiceId } from '@/lib/story-narration-policy';

/** R.O.T.I. — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_ROTI_VOICE_ID = 'fBD19tfE58bkETeiwUoC';

/** Steelpan Sam — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_STEELPAN_SAM_VOICE_ID = 'e9TfM9r08DRqEMm6E3rZ';

/** Mango Moko — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_MANGO_MOKO_VOICE_ID = 'U2cXNcAbNVx97nQxgc8l';

export function islandHelpersVoiceId(
  characterId: IslandHelpersCharacterId,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  switch (characterId) {
    case 'roti':
      return env.ELEVENLABS_ROTI_VOICE_ID?.trim() || DEFAULT_ROTI_VOICE_ID;
    case 'tanty_spice':
      // Tanty stays on the warm story voice (RdKVa… / ELEVENLABS_STORY_VOICE_ID).
      return warmStoryVoiceId(env);
    case 'steelpan_sam':
      return env.ELEVENLABS_STEELPAN_SAM_VOICE_ID?.trim() || DEFAULT_STEELPAN_SAM_VOICE_ID;
    case 'mango_moko':
      return env.ELEVENLABS_MANGO_MOKO_VOICE_ID?.trim() || DEFAULT_MANGO_MOKO_VOICE_ID;
    default:
      // Fail closed: never fall back to Tanty for unknown characters.
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
    default:
      return 'Unknown helper';
  }
}
