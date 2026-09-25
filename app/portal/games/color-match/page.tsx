"use client";

import ColorMatch from '@/components/games/ColorMatch';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function ColorMatchPage() {
    const awardGameXp = useAwardPortalGameXp('color-match', 'Island Color Match');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
    };

    return (
        <GameLayoutWrapper
            gameId="color-match"
            title="Island Color Match"
            description="Match colors and test your visual discrimination skills!"
            learningFocus="Color recognition, visual discrimination, pattern matching"
            characterBadge={{ emoji: '🌶️', name: 'Scorcha Pepper', color: '#FF5252' }}
            xpReward={150}
            gradient="from-pink-400 via-purple-500 to-indigo-600"
        >
            <ColorMatch onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}