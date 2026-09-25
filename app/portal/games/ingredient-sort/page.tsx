"use client";

import IngredientSort from '@/components/games/IngredientSort';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function IngredientSortPage() {
    const awardGameXp = useAwardPortalGameXp('ingredient-sort', 'Ingredient Sort');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
    };

    return (
        <GameLayoutWrapper
            gameId="ingredient-sort"
            title="Ingredient Sort"
            description="Drag Caribbean ingredients into their correct baskets! Organize vegetables, fruits, spices, and grains."
            learningFocus="Classification, categorization, Caribbean food knowledge, fine motor skills"
            characterBadge={{ emoji: '🟡', name: 'Basket Benny', color: '#FFD23F' }}
            xpReward={110}
            gradient="from-yellow-400 via-amber-500 to-orange-600"
        >
            <IngredientSort onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}
