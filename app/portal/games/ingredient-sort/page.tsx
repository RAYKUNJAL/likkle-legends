"use client";

import IngredientSort from '@/components/games/IngredientSort';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function IngredientSortPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'ingredient-sort',
                score,
                0,
                { title: 'Ingredient Sort' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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
