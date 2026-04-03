export interface GameConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'free' | 'premium';
  ageBracket: string;
  duration: number;
  focus: string;
  image: string;
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  'island-hop': {
    id: 'island-hop',
    title: 'Island Hop Adventure',
    description: 'Explore Caribbean islands and learn cultural facts',
    icon: '🏝️',
    tier: 'free',
    ageBracket: '6-8 yrs',
    duration: 8,
    focus: 'Geography & Culture',
    image: '/games/island-hop-placeholder.svg',
  },
  'spelling-blaze': {
    id: 'spelling-blaze',
    title: 'Spelling Blaze',
    description: 'Race to spell Patois and English words',
    icon: '🔥',
    tier: 'free',
    ageBracket: '6-8 yrs',
    duration: 7,
    focus: 'Spelling & Language',
    image: '/games/spelling-blaze-placeholder.svg',
  },
  'tantys-kitchen': {
    id: 'tantys-kitchen',
    title: "Tanty's Kitchen",
    description: 'Help prepare Caribbean dishes and learn cooking',
    icon: '👩‍🍳',
    tier: 'premium',
    ageBracket: '3-5 yrs',
    duration: 6,
    focus: 'Food Culture & Measurements',
    image: '/games/tantys-kitchen-placeholder.svg',
  },
  'math-market': {
    id: 'math-market',
    title: 'Math Market',
    description: 'Practice math skills through Caribbean market shopping',
    icon: '🛒',
    tier: 'premium',
    ageBracket: '6-8 yrs',
    duration: 10,
    focus: 'Mathematics & Economics',
    image: '/games/math-market-placeholder.svg',
  },
};

// Helper function to get game config
export function getGameConfig(gameId: string): GameConfig | undefined {
  return GAME_CONFIGS[gameId];
}

// Helper function to check if game is accessible
export function isGameAccessible(gameId: string, userTier: 'free' | 'premium' | 'unlimited'): boolean {
  const config = getGameConfig(gameId);
  if (!config) return false;
  
  if (userTier === 'unlimited') return true;
  if (userTier === 'premium') return true;
  if (userTier === 'free') return config.tier === 'free';
  
  return false;
}
