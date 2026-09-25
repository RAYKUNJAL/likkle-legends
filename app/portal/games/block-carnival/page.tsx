"use client";

import BlockCarnival from '@/components/games/BlockCarnival';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function BlockCarnivalPage() {
    const awardGameXp = useAwardPortalGameXp(
        'block-carnival',
        'Caribbean Block Carnival',
        PORTAL_GAME_CONTENT_IDS['block-carnival'],
    );

    return (
        <GameLayoutWrapper
            gameId="block-carnival"
            title="Caribbean Block Carnival"
            description="Place vibrant blocks, clear lines, and fill the Carnival Fever meter."
            learningFocus="Spatial planning, patterns, and Caribbean island treasures"
            characterBadge={{ emoji: '🎉', name: 'Carnival Crew', color: '#FF6B35' }}
            xpReward={200}
            gradient="from-rose-400 via-orange-500 to-amber-400"
        >
            <BlockCarnival onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </GameLayoutWrapper>
    );
}
