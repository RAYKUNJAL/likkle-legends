"use client";

import CountingMarket from '@/components/games/CountingMarket';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function CountingMarketPage() {
    const awardGameXp = useAwardPortalGameXp('counting-market', 'Counting Market');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
    };

    return (
        <GameLayoutWrapper
            gameId="counting-market"
            title="Counting Market"
            description="Shop at a Caribbean market with a budget! Add items to your cart and calculate the correct change at checkout."
            learningFocus="Arithmetic, currency recognition, budgeting, real-world math applications, money management"
            characterBadge={{ emoji: '🏪', name: 'Vendor Vanessa', color: '#20C997' }}
            xpReward={125}
            gradient="from-green-500 via-teal-500 to-cyan-600"
        >
            <CountingMarket onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}