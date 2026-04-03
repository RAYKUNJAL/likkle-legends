"use client";

import IslandTrivia from '@/components/games/IslandTrivia';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function IslandTriviaPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            const xp = Math.min(Math.floor(score / 10), 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'island-trivia',
                xp,
                0,
                { title: 'Island Trivia Quest' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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