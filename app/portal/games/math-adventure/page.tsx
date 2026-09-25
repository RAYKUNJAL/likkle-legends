"use client";

import MathAdventure from '@/components/games/MathAdventure';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function MathAdventurePage() {
    const awardGameXp = useAwardPortalGameXp('math-adventure', 'Math Adventure');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
    };

    return (
        <GameLayoutWrapper
            gameId="math-adventure"
            title="Math Adventure"
            description="Join R.O.T.I. on a Caribbean mathematical quest! Solve addition, subtraction, multiplication, and division problems to help deliver goods across the islands."
            learningFocus="Arithmetic fluency, problem-solving, mathematical reasoning, real-world applications, progressive math skills"
            characterBadge={{ emoji: '🤖', name: 'R.O.T.I. Math Mode', color: '#2EC4B6' }}
            xpReward={160}
            gradient="from-cyan-500 via-teal-500 to-green-600"
        >
            <MathAdventure onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}