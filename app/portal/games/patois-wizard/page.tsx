"use client";

import PatoisWizard from '@/components/games/PatoisWizard';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function PatoisWizardPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            const xp = Math.min(score, 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'patois-wizard',
                xp,
                0,
                { title: 'Patois Word Wizard' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="patois-wizard"
            title="Patois Word Wizard"
            description="Master Jamaican Patois by learning words and their meanings!"
            learningFocus="Jamaican Patois vocabulary, reading comprehension, cultural identity"
            characterBadge={{ emoji: '👵🏾', name: 'Tanty Spice', color: '#FF8FCC' }}
            xpReward={200}
            gradient="from-blue-400 via-indigo-500 to-purple-600"
        >
            <PatoisWizard onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}