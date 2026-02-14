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
                    className="flex-1 flex items-center justify-center gap-2 bg-deep text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
                >
                    Start Free Forever
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
