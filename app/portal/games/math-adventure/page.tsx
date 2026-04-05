"use client";

import MathAdventure from '@/components/games/MathAdventure';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function MathAdventurePage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'math-adventure',
                score,
                0,
                { title: 'Math Adventure' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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