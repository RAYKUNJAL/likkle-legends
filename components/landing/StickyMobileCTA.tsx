'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StickyMobileCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 600px (past the hero)
            setIsVisible(window.scrollY > 600);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
            <div className="bg-white/95 backdrop-blur-xl border-t border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-3 safe-area-bottom">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <Link
                        href="/signup?plan=starter_mailer"
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all"
                    >
                        Start for $10
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/signup?plan=free"
                        className="text-deep/50 font-bold text-sm hover:text-deep transition-colors whitespace-nowrap"
                    >
                        Free plan
                    </Link>
                </div>
            </div>
        </div>
    );
}
