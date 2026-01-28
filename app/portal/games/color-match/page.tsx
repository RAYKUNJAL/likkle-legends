"use client";

import ColorMatch from '@/components/games/ColorMatch';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function ColorMatchPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            // Log the game activity with the score as XP
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'color-match',
                score,
                0,
                { title: 'Island Color Match' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50/30 p-4 md:p-8 flex flex-col">
            <header className="max-w-7xl mx-auto w-full mb-8">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-600 transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <ColorMatch onComplete={handleComplete} />
            </div>
        </div>
    );
}
