'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StickyMobileCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past hero (approximately 500px)
            setIsVisible(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-zinc-200 p-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex gap-2">
                <Link
                    href="/get-started"
                    className="flex-1 flex items-center justify-center gap-1 bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg"
                >
                    Try $10 Intro
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                    href="/get-started"
                    className="flex items-center justify-center gap-1 bg-zinc-100 text-deep py-3 px-4 rounded-xl font-bold text-sm"
                >
                    Free Trial
                </Link>
            </div>
        </div>
    );
}
