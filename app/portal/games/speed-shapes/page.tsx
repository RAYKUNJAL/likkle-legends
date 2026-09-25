"use client";

import SpeedShapes from '@/components/games/SpeedShapes';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function SpeedShapesPage() {
    const awardGameXp = useAwardPortalGameXp('speed-shapes', 'Speed Shapes');

    const handleComplete = (score: number) => {
        void awardGameXp(Math.min(score, 150), score);
    };

    return (
        <GameLayoutWrapper
            gameId="speed-shapes"
            title="Speed Shapes"
            description="Test your visual perception! Watch the shape flash, then pick it from the options. Choose your difficulty and race against time!"
            learningFocus="Visual perception, fast pattern recognition, shape vocabulary, focus and concentration"
            characterBadge={{ emoji: '🟢', name: 'Zappy Geo', color: '#69F0AE' }}
            xpReward={150}
            gradient="from-green-400 via-emerald-500 to-teal-600"
        >
            <SpeedShapes onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}
