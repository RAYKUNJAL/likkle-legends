"use client";

import RhythmMatcher from '@/components/games/RhythmMatcher';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function RhythmMatcherPage() {
    const awardGameXp = useAwardPortalGameXp('rhythm-matcher', 'Rhythm Matcher');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
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
