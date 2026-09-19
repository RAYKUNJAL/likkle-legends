/**
 * Games we have verified have a real playable route in this repo.
 * Catalogs should list only these (plus DB extras that map to a working route).
 */

export type WorkingGameKind = 'portal' | 'arcade';

export type WorkingGame = {
  id: string;
  title: string;
  href: string;
  kind: WorkingGameKind;
};

export const WORKING_PORTAL_GAMES: WorkingGame[] = [
  { id: 'island-memory', title: 'Island Memory Match', href: '/portal/games/island-memory', kind: 'portal' },
  { id: 'patois-wizard', title: 'Patois Word Wizard', href: '/portal/games/patois-wizard', kind: 'portal' },
  { id: 'island-trivia', title: 'Island Trivia Quest', href: '/portal/games/island-trivia', kind: 'portal' },
  { id: 'color-match', title: 'Island Color Match', href: '/portal/games/color-match', kind: 'portal' },
  { id: 'flag-match', title: 'Caribbean Flag Match', href: '/portal/games/flag-match', kind: 'portal' },
  { id: 'counting-market', title: 'Caribbean Market Counting', href: '/portal/games/counting-market', kind: 'portal' },
  { id: 'math-adventure', title: "R.O.T.I.'s Math Adventure", href: '/portal/games/math-adventure', kind: 'portal' },
  { id: 'speed-shapes', title: 'Speed Shapes', href: '/portal/games/speed-shapes', kind: 'portal' },
  { id: 'word-builder', title: 'Island Word Builder', href: '/portal/games/word-builder', kind: 'portal' },
  { id: 'recipe-scramble', title: 'Recipe Scramble', href: '/portal/games/recipe-scramble', kind: 'portal' },
  { id: 'ingredient-sort', title: 'Ingredient Sort', href: '/portal/games/ingredient-sort', kind: 'portal' },
  { id: 'rhythm-matcher', title: 'Rhythm Matcher', href: '/portal/games/rhythm-matcher', kind: 'portal' },
  { id: 'island-passport-explorer', title: 'Island Passport Explorer', href: '/portal/games/island-passport-explorer', kind: 'portal' },
];

export const WORKING_ARCADE_GAMES: WorkingGame[] = [
  { id: 'island-hop', title: "Mango's Island Hop", href: '/games/island-hop', kind: 'arcade' },
  { id: 'tantys-kitchen', title: "Tanty's Kitchen", href: '/games/tantys-kitchen', kind: 'arcade' },
  { id: 'math-market', title: "R.O.T.I.'s Math Market", href: '/games/math-market', kind: 'arcade' },
  { id: 'spelling-blaze', title: "Scorcha's Spelling Blaze", href: '/games/spelling-blaze', kind: 'arcade' },
  { id: 'doubles-dash', title: 'Doubles Dash', href: '/games/doubles-dash', kind: 'arcade' },
];

export const WORKING_GAME_IDS = new Set([
  ...WORKING_PORTAL_GAMES.map((game) => game.id),
  ...WORKING_ARCADE_GAMES.map((game) => game.id),
]);

/** Duplicate / story cards that were listed as games but are not unique playable titles. */
export const HIDDEN_GAME_IDS = new Set([
  'story-library',
  'cultural-quiz',
  'island-explorer',
]);

export function isWorkingGameId(id: string) {
  return WORKING_GAME_IDS.has(id);
}

export function arcadeHrefFor(id: string) {
  const match = WORKING_ARCADE_GAMES.find((game) => game.id === id);
  return match?.href;
}
