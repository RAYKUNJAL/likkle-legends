"use client";

import IslandMemory from '@/components/games/IslandMemory';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';
import { recordGameResult } from '@/lib/game-progress';

export default function IslandMemoryPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        recordGameResult('island-memory', score);

        if (!user || !activeChild) return;
        try {
            const xp = Math.min(score, 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'island-memory',
                xp,
                0,
                { title: 'Island Memory Match' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="island-memory"
            title="Island Memory Match"
            description="Flip cards and match Caribbean fruits, animals, and landmarks to test your memory!"
            learningFocus="Visual memory, concentration, island vocabulary"
            characterBadge={{ emoji: '🦋', name: 'Mango Moko', color: '#69F0AE' }}
            xpReward={200}
            gradient="from-emerald-400 via-green-500 to-teal-600"
        >
            <IslandMemory onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}