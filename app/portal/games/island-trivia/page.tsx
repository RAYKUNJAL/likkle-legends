"use client";

import IslandTrivia from '@/components/games/IslandTrivia';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function IslandTriviaPage() {
    const awardGameXp = useAwardPortalGameXp('island-trivia', 'Island Trivia Quest');

    const handleComplete = (score: number) => {
        void awardGameXp(Math.min(Math.floor(score / 10), 200), score);
    };

    return (
        <GameLayoutWrapper
            gameId="island-trivia"
            title="Island Trivia Quest"
            description="Answer fun questions about Caribbean culture, geography, and fun facts!"
            learningFocus="Geography, cultural knowledge, recall, factual thinking"
            characterBadge={{ emoji: '🤖', name: 'R.O.T.I.', color: '#2EC4B6' }}
            xpReward={200}
            gradient="from-amber-400 via-orange-500 to-red-600"
        >
            <IslandTrivia onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}