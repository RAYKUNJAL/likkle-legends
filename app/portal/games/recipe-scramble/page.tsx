"use client";

import RecipeScramble from '@/components/games/RecipeScramble';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function RecipeScramblePage() {
    const awardGameXp = useAwardPortalGameXp('recipe-scramble', 'Recipe Scramble');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
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