"use client";

import WordBuilder from '@/components/games/WordBuilder';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function WordBuilderPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'word-builder',
                score,
                0,
                { title: 'Word Builder' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <GameLayoutWrapper
            gameId="word-builder"
            title="Word Builder"
            description="Build words from scrambled letters! Find Caribbean fruit and food words. Each round, find 3 words to advance."
            learningFocus="Spelling, word recognition, vocabulary building, Caribbean island knowledge"
            characterBadge={{ emoji: '🔵', name: 'Alphabet Andy', color: '#4A90E2' }}
            xpReward={120}
            gradient="from-blue-400 via-cyan-500 to-teal-600"
        >
            <WordBuilder onComplete={handleComplete} />
        </GameLayoutWrapper>
    );
}