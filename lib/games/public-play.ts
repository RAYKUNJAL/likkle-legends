import { QUIZ_ROUNDS } from '@/lib/games/island-quiz-data';
import { MAX_REEF_LEVEL } from '@/lib/games/reef-rescue-rules';

/** Guest sittings on the public hub. Matches the example hub's first three levels. */
export const PUBLIC_GUEST_LEVELS = 3;

export const CARNIVAL_ISLAND_COUNT = 6;

export type LegendsLeadGameId = 'reef-rescue' | 'block-carnival' | 'island-quiz';

export type LegendsLeadGame = {
    id: LegendsLeadGameId;
    title: string;
    description: string;
    publicHref: string;
    portalHref: string;
    emoji: string;
    char: string;
    charEmoji: string;
    tags: string[];
    theme: 'reef' | 'carnival' | 'quiz';
};

export const LEGENDS_LEAD_GAMES: LegendsLeadGame[] = [
    {
        id: 'reef-rescue',
        title: 'Reef Rescue',
        description: 'Clear ocean litter, protect sea life and restore colorful Caribbean reefs.',
        publicHref: '/games/reef-rescue',
        portalHref: '/portal/games/reef-rescue',
        emoji: '🪸',
        char: 'Tali the Turtle',
        charEmoji: '🐢',
        tags: ['Ocean care', 'Arcade', 'Ages 4-8'],
        theme: 'reef',
    },
    {
        id: 'block-carnival',
        title: 'Caribbean Block Carnival',
        description: 'Place vibrant blocks, clear lines, and fill the Carnival Fever meter.',
        publicHref: '/games/block-carnival',
        portalHref: '/portal/games/block-carnival',
        emoji: '🎉',
        char: 'Carnival Crew',
        charEmoji: '🥁',
        tags: ['Puzzle', 'Planning', 'Ages 4-8'],
        theme: 'carnival',
    },
    {
        id: 'island-quiz',
        title: 'Island Quiz Quest',
        description: 'Match each island with its foods, wildlife, flags and cultural treasures.',
        publicHref: '/games/island-quiz',
        portalHref: '/portal/games/island-quiz',
        emoji: '🏝️',
        char: 'Island Guide',
        charEmoji: '🗺️',
        tags: ['Trivia', 'Culture', 'Ages 5-8'],
        theme: 'quiz',
    },
];

export function reefLevelLimit(member: boolean) {
    return member ? MAX_REEF_LEVEL : PUBLIC_GUEST_LEVELS;
}

export function carnivalIslandLimit(member: boolean) {
    return member ? CARNIVAL_ISLAND_COUNT : PUBLIC_GUEST_LEVELS;
}

/** Guests play the opening Harbor round. Members play the full three-round quest. */
export function quizRoundLimit(member: boolean) {
    return member ? QUIZ_ROUNDS.length : 1;
}
