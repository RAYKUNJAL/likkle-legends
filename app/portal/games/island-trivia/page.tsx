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
        <div className="min-h-screen bg-blue-50/30 p-4 md:p-8 flex flex-col">
            <header className="max-w-7xl mx-auto w-full mb-8">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-600 transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <IslandTrivia onComplete={handleComplete} />
            </div>
        </div>
    );
}
