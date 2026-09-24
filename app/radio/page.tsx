import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LikkleRadioPlayer from '@/components/radio/LikkleRadioPlayer';

export const metadata: Metadata = {
    title: 'Likkle Radio',
    description: 'Recorded Caribbean kids songs hosted by Likkle Legends characters. Listening is free.',
};

export default function LikkleRadioPage() {
    return (
        <main className="min-h-screen bg-[#fffaf0] px-4 py-8 text-[#102543] sm:px-6 sm:py-12">
            <div className="mx-auto max-w-3xl">
                <Link href="/" className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-[#51617b]">
                    <ArrowLeft size={16} aria-hidden="true" /> Back home
                </Link>
                <h1 className="mt-6 font-heading text-4xl font-black tracking-tight">Likkle Radio</h1>
                <p className="mt-3 max-w-xl text-[#51617b]">
                    Listening is free. These are recorded songs from our library. No account needed.
                </p>
                <div className="mt-8">
                    <LikkleRadioPlayer />
                </div>
            </div>
        </main>
    );
}
