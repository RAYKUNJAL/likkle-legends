"use client";

import MangoCatch from '@/components/games/MangoCatch';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function MangoCatchPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            // Log the game activity with the score as XP (or a calculated amount)
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'mango-catch',
                score, // XP earned
                0,
                { title: 'Mango Catch Adventure' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-8 flex flex-col">
            <header className="max-w-7xl mx-auto w-full mb-8">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <MangoCatch onComplete={handleComplete} />
            </div>
        </div>
    );
}
