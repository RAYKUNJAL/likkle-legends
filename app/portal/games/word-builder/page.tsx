"use client";

import WordBuilder from '@/components/games/WordBuilder';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';

export default function WordBuilderPage() {
    const awardGameXp = useAwardPortalGameXp('word-builder', 'Word Builder');

    const handleComplete = (score: number) => {
        void awardGameXp(score, score);
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