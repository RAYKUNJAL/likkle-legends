export type LikkleCharacterId =
  | 'tanty_spice'
  | 'tanty'
  | 'roti'
  | 'dilly_doubles'
  | 'dilly'
  | 'mango_moko'
  | 'scorcha_pepper';

export type VoiceProviderCharacter = 'tanty' | 'roti' | 'dilly' | 'mango' | 'scorcha';

export type CharacterVoiceProfile = {
  id: VoiceProviderCharacter;
  displayName: string;
  avatarUrl: string;
  googleCloud: {
    languageCode: string;
    voiceName: string;
    pitch: number;
    speakingRate: number;
    volumeGainDb: number;
  };
  gemini: {
    voiceName: string;
    direction: string;
  };
  safetyStyle: string;
};

export const CHARACTER_VOICE_PROFILES: Record<VoiceProviderCharacter, CharacterVoiceProfile> = {
  tanty: {
    id: 'tanty',
    displayName: 'Tanty Spice',
    avatarUrl: '/images/tanty_spice_avatar.jpg',
    googleCloud: {
      languageCode: 'en-GB',
      voiceName: 'en-GB-Neural2-C',
      pitch: -2,
      speakingRate: 0.88,
      volumeGainDb: 1,
    },
    gemini: {
      voiceName: 'Kore',
      direction:
        'Warm Caribbean grandmother, melodic island rhythm, gentle and funny. Very clear for children ages 3 to 9. Do not use heavy dialect that makes words hard to understand.',
    },
    safetyStyle: 'comforting storyteller and emotional safety guide',
  },
  roti: {
    id: 'roti',
    displayName: 'R.O.T.I.',
    avatarUrl: '/images/roti-new.jpg',
    googleCloud: {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-J',
      pitch: 1.5,
      speakingRate: 1.04,
      volumeGainDb: 1,
    },
    gemini: {
      voiceName: 'Puck',
      direction:
        'Friendly island robot teacher, bright and clear, playful but calm. Breaks learning into small steps for young children.',
    },
    safetyStyle: 'curriculum coach and step-by-step helper',
  },
  dilly: {
    id: 'dilly',
    displayName: 'Dilly Doubles',
    avatarUrl: '/images/dilly-doubles.jpg',
    googleCloud: {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-I',
      pitch: 2,
      speakingRate: 1.08,
      volumeGainDb: 1,
    },
    gemini: {
      voiceName: 'Fenrir',
      direction:
        'Youthful, energetic Caribbean friend. Fun, encouraging, never rude, never chaotic. Great for games, rewards, and jokes.',
    },
    safetyStyle: 'joyful peer motivator',
  },
  mango: {
    id: 'mango',
    displayName: 'Mango Moko',
    avatarUrl: '/images/mango_moko.png',
    googleCloud: {
      languageCode: 'en-GB',
      voiceName: 'en-GB-Neural2-B',
      pitch: -0.5,
      speakingRate: 0.95,
      volumeGainDb: 1,
    },
    gemini: {
      voiceName: 'Leda',
      direction:
        'Steady, observant island guide. Calm stilt-walker energy. Helps children notice details, balance ideas, and see another perspective.',
    },
    safetyStyle: 'observation and balance teacher',
  },
  scorcha: {
    id: 'scorcha',
    displayName: 'Scorcha Pepper',
    avatarUrl: '/images/scorcha_pepper.jpg',
    googleCloud: {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-H',
      pitch: 1,
      speakingRate: 1.02,
      volumeGainDb: 1,
    },
    gemini: {
      voiceName: 'Charon',
      direction:
        'Spicy pepper character with big feelings, brave energy, and kind self-control lessons. Funny but always safe and gentle.',
    },
    safetyStyle: 'big-feelings coach and brave choices guide',
  },
};

export function normalizeCharacterVoiceId(voice?: string): VoiceProviderCharacter {
  switch ((voice || '').toLowerCase()) {
    case 'roti':
    case 'steelpan_sam':
      return 'roti';
    case 'dilly':
    case 'dilly_doubles':
      return 'dilly';
    case 'mango':
    case 'mango_moko':
      return 'mango';
    case 'scorcha':
    case 'scorcha_pepper':
      return 'scorcha';
    case 'tanty':
    case 'tanty_spice':
    default:
      return 'tanty';
  }
}

export function getCharacterVoiceProfile(voice?: string): CharacterVoiceProfile {
  return CHARACTER_VOICE_PROFILES[normalizeCharacterVoiceId(voice)];
}
