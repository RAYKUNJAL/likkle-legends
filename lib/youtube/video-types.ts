export type LikkleVideoAsset = {
  id: string;
  label: string;
  type: 'character' | 'music' | 'background';
  publicPath: string;
  rights: 'owned' | 'licensed' | 'needs_review';
};

export type LikkleVideoScene = {
  title: string;
  narration: string;
  caption: string;
  visualPrompt: string;
  characterAssetIds: string[];
  durationSeconds: number;
};

export type LikkleVideoPlan = {
  id: string;
  title: string;
  island: string;
  ageBand: '3-5' | '6-7' | '8-9';
  learningGoal: string;
  hook: string;
  musicAssetId?: string;
  characterAssetIds: string[];
  scenes: LikkleVideoScene[];
  youtube: {
    title: string;
    description: string;
    tags: string[];
    madeForKids: true;
    privacyStatus: 'private' | 'unlisted' | 'public';
  };
  safety: {
    coppaSafe: boolean;
    noPersonalData: boolean;
    noRealChildVoiceClone: boolean;
    needsHumanApproval: boolean;
  };
  distribution?: {
    primaryChannel: 'youtube';
    crossPostChannels: Array<'instagram' | 'facebook' | 'tiktok'>;
    parentSafeCta: string;
    childSafeCta: string;
  };
};

export const YOUTUBE_ASSETS: LikkleVideoAsset[] = [
  {
    id: 'likkle-legends-group',
    label: 'Likkle Legends group hero',
    type: 'character',
    publicPath: '/assets/youtube/characters/likkle-legends-group.png',
    rights: 'owned',
  },
  {
    id: 'pepper-character',
    label: 'Pepper character',
    type: 'character',
    publicPath: '/assets/youtube/characters/pepper-character.png',
    rights: 'owned',
  },
  {
    id: 'tanty-spice',
    label: 'Tanty Spice',
    type: 'character',
    publicPath: '/assets/youtube/characters/tanty-spice.png',
    rights: 'owned',
  },
  {
    id: 'doubles-character',
    label: 'Doubles character',
    type: 'character',
    publicPath: '/assets/youtube/characters/doubles-character.png',
    rights: 'owned',
  },
  {
    id: 'saving-money',
    label: 'Saving money nursery rhyme',
    type: 'music',
    publicPath: '/assets/youtube/music/saving-money.mp3',
    rights: 'owned',
  },
  {
    id: 'drinking-water',
    label: 'Drinking water nursery rhyme',
    type: 'music',
    publicPath: '/assets/youtube/music/drinking-water.mp3',
    rights: 'owned',
  },
];
