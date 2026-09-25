"use client";

import PatoisWizard from '@/components/games/PatoisWizard';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function PatoisWizardPage() {
    const awardGameXp = useAwardPortalGameXp('patois-wizard', 'Patois Word Wizard');

    const handleComplete = (score: number) => {
        void awardGameXp(Math.min(score, 200), score);
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