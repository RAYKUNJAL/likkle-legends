"use client";

import FlagMatch from '@/components/games/FlagMatch';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function FlagMatchPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            const xp = Math.min(score, 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'flag-match',
                xp,
                0,
                { title: 'Caribbean Flag Match' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="flag-match"
            title="Caribbean Flag Match"
            description="Match flags with Caribbean countries and territories! Learn geography while having fun!"
            learningFocus="Caribbean geography, flag recognition, cultural identification, spatial memory"
            characterBadge={{ emoji: '🚩', name: 'Flag Runner', color: '#FF4757' }}
            xpReward={200}
            gradient="from-red-400 via-pink-500 to-rose-600"
        >
            <FlagMatch onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}