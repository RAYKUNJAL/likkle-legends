"use client";

import RhythmMatcher from '@/components/games/RhythmMatcher';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function RhythmMatcherPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'rhythm-matcher',
                score,
                0,
                { title: 'Rhythm Matcher' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="rhythm-matcher"
            title="Rhythm Matcher"
            description="Listen to Caribbean rhythms and tap out the beat! Master steel drums, soca, reggae, and calypso patterns."
            learningFocus="Auditory memory, pattern recognition, rhythm awareness, Caribbean music culture, beat coordination"
            characterBadge={{ emoji: '🥁', name: 'Drummer Destiny', color: '#FF5296' }}
            xpReward={150}
            gradient="from-pink-400 via-rose-500 to-red-600"
        >
            <RhythmMatcher onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}
