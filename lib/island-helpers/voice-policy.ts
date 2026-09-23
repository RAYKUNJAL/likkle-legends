/**
 * Island Helpers / character voice lock map.
 *
 * Only voices that Ray has explicitly supplied may be selected here.
 * Unknown characters fail closed (null) — never fall back to Tanty.
 */
import type { IslandHelpersCharacterId } from './types';
import { warmStoryVoiceId } from '@/lib/story-narration-policy';

/** Tanty Spice — warm story / Island Helpers (locked). */
export const DEFAULT_TANTY_VOICE_ID = 'RdKVaQgg8n1rUzICELn1';

/** R.O.T.I. — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_ROTI_VOICE_ID = 'fBD19tfE58bkETeiwUoC';

/** Steelpan Sam — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_STEELPAN_SAM_VOICE_ID = 'e9TfM9r08DRqEMm6E3rZ';

/** Mango Moko — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_MANGO_MOKO_VOICE_ID = 'U2cXNcAbNVx97nQxgc8l';

/** Dilly Doubles — Ray-supplied ElevenLabs voice (locked). */
export const DEFAULT_DILLY_DOUBLES_VOICE_ID = 'JtTKpzbNe4HudVAZtxZp';

/** Canonical lock map for all Ray-supplied character voices (distinct IDs). */
export const LOCKED_CHARACTER_VOICE_IDS = {
  tanty_spice: DEFAULT_TANTY_VOICE_ID,
  roti: DEFAULT_ROTI_VOICE_ID,
  steelpan_sam: DEFAULT_STEELPAN_SAM_VOICE_ID,
  mango_moko: DEFAULT_MANGO_MOKO_VOICE_ID,
  dilly_doubles: DEFAULT_DILLY_DOUBLES_VOICE_ID,
} as const;

export type LockedCharacterVoiceId = keyof typeof LOCKED_CHARACTER_VOICE_IDS;

export function islandHelpersVoiceId(
  characterId: IslandHelpersCharacterId,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  switch (characterId) {
    case 'roti':
      return env.ELEVENLABS_ROTI_VOICE_ID?.trim() || DEFAULT_ROTI_VOICE_ID;
    case 'tanty_spice': {
      // Prefer warm story voice; still fail closed if it somehow returned empty.
      const warm = warmStoryVoiceId(env)?.trim();
      return warm || DEFAULT_TANTY_VOICE_ID;
    }
    case 'steelpan_sam':
      return env.ELEVENLABS_STEELPAN_SAM_VOICE_ID?.trim() || DEFAULT_STEELPAN_SAM_VOICE_ID;
    case 'mango_moko':
      return env.ELEVENLABS_MANGO_MOKO_VOICE_ID?.trim() || DEFAULT_MANGO_MOKO_VOICE_ID;
    default:
      // Fail closed: never fall back to Tanty for unknown characters.
      return null;
  }
}

/** Resolve any locked character voice (including Dilly, who is not on the Island Helpers board). */
export function lockedCharacterVoiceId(
  characterId: LockedCharacterVoiceId,
  env: NodeJS.ProcessEnv = process.env,
): string {
  switch (characterId) {
    case 'roti':
      return env.ELEVENLABS_ROTI_VOICE_ID?.trim() || DEFAULT_ROTI_VOICE_ID;
    case 'tanty_spice':
      return env.ELEVENLABS_TANTY_VOICE_ID?.trim()
        || env.ELEVENLABS_STORY_VOICE_ID?.trim()
        || DEFAULT_TANTY_VOICE_ID;
    case 'steelpan_sam':
      return env.ELEVENLABS_STEELPAN_SAM_VOICE_ID?.trim() || DEFAULT_STEELPAN_SAM_VOICE_ID;
    case 'mango_moko':
      return env.ELEVENLABS_MANGO_MOKO_VOICE_ID?.trim() || DEFAULT_MANGO_MOKO_VOICE_ID;
    case 'dilly_doubles':
      return env.ELEVENLABS_DILLY_VOICE_ID?.trim() || DEFAULT_DILLY_DOUBLES_VOICE_ID;
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
