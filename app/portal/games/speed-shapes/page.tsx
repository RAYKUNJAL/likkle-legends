"use client";

import SpeedShapes from '@/components/games/SpeedShapes';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function SpeedShapesPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            const xp = Math.min(score, 150);
            await logActivity(user.id, activeChild.id, 'game', 'speed-shapes', xp, 0, { title: 'Speed Shapes' });
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
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
