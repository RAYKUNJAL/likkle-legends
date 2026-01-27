"use client";

import ColorMatch from '@/components/games/ColorMatch';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ColorMatchPage() {
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
                <ColorMatch />
            </div>
        </div>
    );
}
