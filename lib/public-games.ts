import type { Metadata } from 'next';
import { getPublicSiteUrl } from '@/lib/blog/site-url';

/**
 * Stable public game paths on likklelegends.com.
 * Sibling play-route work should keep these hrefs:
 * /games, /games/reef-rescue, /games/block-carnival, /games/island-quiz.
 */
export const FEATURED_PUBLIC_GAMES = [
    {
        id: 'reef-rescue',
        href: '/games/reef-rescue',
        title: 'Reef Rescue',
        ages: 'Ages 4–8',
        skills: ['Ocean care', 'Focus', 'Caribbean reefs'],
        summary: 'Clear litter, protect sea life, and restore reefs from Belize to the Bahamas with Tali the Turtle.',
        parentNote: 'A short tapping game that gives families a reason to talk about caring for the sea.',
        emoji: '🐢',
        wash: '#e7f6fb',
        ink: '#0e7490',
    },
    {
        id: 'block-carnival',
        href: '/games/block-carnival',
        title: 'Block Carnival',
        ages: 'Ages 5–9',
        skills: ['Patterns', 'Planning', 'Island treasures'],
        summary: 'Place bright blocks, clear lines, and fill the Carnival Fever meter with treasures from across the islands.',
        parentNote: 'Spatial play that asks kids to plan a move before they drop the next piece.',
        emoji: '🎉',
        wash: '#fff1e8',
        ink: '#c2410c',
    },
    {
        id: 'island-quiz',
        href: '/games/island-quiz',
        title: 'Island Quiz',
        ages: 'Ages 6–9',
        skills: ['Geography', 'Food', 'Flags'],
        summary: 'Match each island with its foods, wildlife, flags, and cultural treasures.',
        parentNote: 'A culture quiz families can play together and then keep talking about at dinner.',
        emoji: '🏝️',
        wash: '#f3eefe',
        ink: '#6d28d9',
    },
] as const;

/** Extra playable routes that already live on this domain. */
export const MORE_PUBLIC_GAMES = [
    {
        id: 'island-hop',
        href: '/games/island-hop',
        title: "Mango's Island Hop",
        summary: 'Hop between islands and answer trivia about flags, capitals, and fun facts.',
        emoji: '🦋',
    },
    {
        id: 'tantys-kitchen',
        href: '/games/tantys-kitchen',
        title: "Tanty's Kitchen",
        summary: 'Sort ingredients and cook real Caribbean dishes with Tanty Spice.',
        emoji: '🍲',
    },
    {
        id: 'math-market',
        href: '/games/math-market',
        title: "R.O.T.I.'s Math Market",
        summary: 'Count fruit, add prices, and make change at a Caribbean market stall.',
        emoji: '🧮',
    },
    {
        id: 'spelling-blaze',
        href: '/games/spelling-blaze',
        title: "Scorcha's Spelling Blaze",
        summary: 'Spell Caribbean words before the fire timer runs out.',
        emoji: '🌶️',
    },
] as const;

export const GAMES_LANDING_PATH = '/games';

export const GAMES_LANDING_TITLE = 'Caribbean Learning Games for Kids';

export const GAMES_LANDING_DESCRIPTION =
    'Free Caribbean learning games for kids 3–9 on Likkle Legends. Play Reef Rescue, Block Carnival, and Island Quiz, then start a free trial for stories, songs, and the parent club.';

export function publicGameMetadata(title: string, description: string, path: string): Metadata {
    const url = `${getPublicSiteUrl()}${path}`;
    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: `${title} | Likkle Legends`,
            description,
            url,
            siteName: 'Likkle Legends',
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: `${title} | Likkle Legends`,
            description,
        },
    };
}
