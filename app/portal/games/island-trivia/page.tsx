"use client";

import IslandTrivia from '@/components/games/IslandTrivia';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function IslandTriviaPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            // Log the game activity with normalized XP (capped at 200)
            const xp = Math.min(Math.floor(score / 10), 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'island-trivia',
                xp,
                0,
                { title: 'Island Trivia Quest' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-[#0D2137] to-[#134A6E] p-4 md:p-8 flex flex-col relative">
            <style jsx global>{`
                .game-page-header {
                    background: linear-gradient(135deg, rgba(255, 210, 63, 0.1), rgba(255, 107, 53, 0.1));
                    border-bottom: 2px solid rgba(255, 210, 63, 0.2);
                }
            `}</style>

            <header className="game-page-header max-w-7xl mx-auto w-full mb-8 pb-6 rounded-lg">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-[#FFD23F] hover:text-[#FF6B35] transition-colors font-bold text-lg"
                >
                    <ArrowLeft size={20} />
                    ← Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <IslandTrivia onComplete={handleComplete} />
            </div>
        </div>
    );
}