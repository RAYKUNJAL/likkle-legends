"use client";

import ColorMatch from '@/components/games/ColorMatch';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function ColorMatchPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'color-match',
                score,
                0,
                { title: 'Island Color Match' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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