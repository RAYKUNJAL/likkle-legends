"use client";

import SteelpanSimon from '@/components/games/SteelpanSimon';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

export default function SteelpanSimonPage() {
    const { user, activeChild } = useUser();

    const handleComplete = async (score: number) => {
        if (!user || !activeChild) return;
        try {
            // Log the game activity with capped XP
            const xp = Math.min(score, 200);
            await logActivity(
                user.id,
                activeChild.id,
                'game',
                'steelpan-simon',
                xp,
                0,
                { title: 'Steelpan Simon Says' }
            );
        } catch (error) {
            console.error('Failed to log game activity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-100 p-4 md:p-8 flex flex-col">
            <header className="max-w-7xl mx-auto w-full mb-8">
                <Link
                    href="/portal/games"
                    className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-600 transition-colors font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Games
                </Link>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full">
                <SteelpanSimon onComplete={handleComplete} />
            </div>
        </div>
    );
}
