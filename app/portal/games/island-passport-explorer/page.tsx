"use client";

import IslandPassportExplorer from '@/components/games/IslandPassportExplorer';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function IslandPassportExplorerPage() {
    const awardGameXp = useAwardPortalGameXp('island-passport-explorer', 'Island Passport Explorer');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
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