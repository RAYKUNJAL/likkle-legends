"use client";

import IslandQuizQuest from '@/components/games/IslandQuizQuest';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function IslandQuizPage() {
    const awardGameXp = useAwardPortalGameXp(
        'island-quiz',
        'Island Quiz Quest',
        PORTAL_GAME_CONTENT_IDS['island-quiz'],
    );

    return (
        <GameLayoutWrapper
            gameId="island-quiz"
            title="Island Quiz Quest"
            description="Match each island with its foods, wildlife, flags and cultural treasures."
            learningFocus="Caribbean geography, food, wildlife, and flags"
            characterBadge={{ emoji: '🏝️', name: 'Island Guide', color: '#7C6CFF' }}
            xpReward={200}
            gradient="from-indigo-400 via-violet-500 to-fuchsia-500"
        >
            <IslandQuizQuest onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </GameLayoutWrapper>
    );
}
