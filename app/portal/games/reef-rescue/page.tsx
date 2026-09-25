"use client";

import ReefRescue from '@/components/games/ReefRescue';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function ReefRescuePage() {
    const awardGameXp = useAwardPortalGameXp(
        'reef-rescue',
        'Reef Rescue',
        PORTAL_GAME_CONTENT_IDS['reef-rescue'],
    );

    return (
        <GameLayoutWrapper
            gameId="reef-rescue"
            title="Reef Rescue"
            description="Clear ocean litter, protect sea life and restore colorful Caribbean reefs."
            learningFocus="Ocean care, careful tapping, and Caribbean reef life"
            characterBadge={{ emoji: '🐢', name: 'Tali the Turtle', color: '#2EC4B6' }}
            xpReward={200}
            gradient="from-cyan-400 via-teal-500 to-emerald-600"
        >
            <ReefRescue onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </GameLayoutWrapper>
    );
}
