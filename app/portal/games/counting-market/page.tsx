"use client";

import CountingMarket from '@/components/games/CountingMarket';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function CountingMarketPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'counting-market',
                score,
                0,
                { title: 'Counting Market' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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