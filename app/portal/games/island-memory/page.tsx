"use client";

import IslandMemory from '@/components/games/IslandMemory';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';
import { recordGameResult } from '@/lib/game-progress';

export default function IslandMemoryPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        recordGameResult('island-memory', score);

        if (!user || !activeChild) return;
        try {
            // Log the game activity with the score as XP (capped at 200)
            const xp = Math.min(score, 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'island-memory',
                xp,
                0,
                { title: 'Island Memory Match' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 p-4 md:p-8 flex flex-col">
            <header className="max-w-7xl mx-auto w-full mb-8">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-600 transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <IslandMemory onComplete={handleComplete} />
            </div>
        </div>
    );
}
