"use client";

import IslandMemory from '@/components/games/IslandMemory';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function IslandMemoryPage() {
    const awardGameXp = useAwardPortalGameXp('island-memory', 'Island Memory Match');

    const handleComplete = (score: number) => {
        void awardGameXp(Math.min(score, 200), score);
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