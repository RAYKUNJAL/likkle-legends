"use client";

import FlagMatch from '@/components/games/FlagMatch';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function FlagMatchPage() {
    const awardGameXp = useAwardPortalGameXp('flag-match', 'Caribbean Flag Match');

    const handleComplete = (score: number) => {
        void awardGameXp(Math.min(score, 200), score);
    };

    return (
        <GameLayoutWrapper
            gameId="flag-match"
            title="Caribbean Flag Match"
            description="Match flags with Caribbean countries and territories! Learn geography while having fun!"
            learningFocus="Caribbean geography, flag recognition, cultural identification, spatial memory"
            characterBadge={{ emoji: '🚩', name: 'Flag Runner', color: '#FF4757' }}
            xpReward={200}
            gradient="from-red-400 via-pink-500 to-rose-600"
        >
            <FlagMatch onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}