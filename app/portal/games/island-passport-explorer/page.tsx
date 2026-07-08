"use client";

import IslandPassportExplorer from '@/components/games/IslandPassportExplorer';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function IslandPassportExplorerPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'island-passport-explorer',
                score,
                0,
                { title: 'Island Passport Explorer' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="island-passport-explorer"
            title="Island Passport Explorer"
            description="Travel the Caribbean! Answer trivia questions about Caribbean islands to collect passport stamps. Explore Jamaica, Trinidad, Barbados, and more!"
            learningFocus="Geography, island knowledge, flag and culture recognition, facts and history, cultural diversity"
            characterBadge={{ emoji: '🌴', name: 'Explorer Elena', color: '#3FA9F5' }}
            xpReward={140}
            gradient="from-cyan-400 via-blue-500 to-indigo-600"
        >
            <IslandPassportExplorer onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}