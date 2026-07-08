"use client";

import RecipeScramble from '@/components/games/RecipeScramble';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function RecipeScramblePage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'recipe-scramble',
                score,
                0,
                { title: 'Recipe Scramble' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="recipe-scramble"
            title="Recipe Scramble"
            description="Unscramble ingredients to prepare authentic Caribbean dishes! Arrange each ingredient in the correct order."
            learningFocus="Sequencing, recipe comprehension, Caribbean cuisine knowledge, critical thinking"
            characterBadge={{ emoji: '🟠', name: 'Cooking Cassandra', color: '#FFB74D' }}
            xpReward={130}
            gradient="from-orange-400 via-red-500 to-rose-600"
        >
            <RecipeScramble onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}