"use client";

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStars, STARS_UPDATED_EVENT } from '@/lib/services/user-progress';

export default function StarCounter() {
    const [stars, setStars] = useState<number | null>(null);
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        // Initial fetch
        getStars().then(setStars);

        // Listen for updates
        const handler = (e: any) => {
            const newCount = e.detail?.stars;
            if (typeof newCount === 'number') {
                setStars(newCount);
                setJustUpdated(true);
                setTimeout(() => setJustUpdated(false), 2000);
            }
        };

        window.addEventListener(STARS_UPDATED_EVENT, handler);
        return () => window.removeEventListener(STARS_UPDATED_EVENT, handler);
    }, []);

    if (stars === null) return null; // Loading state (invisible)

    return (
        <div className="relative group">
            <motion.div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${justUpdated
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-700 shadow-md scale-105'
                        : 'bg-white border-orange-100 text-orange-900 shadow-sm'
                    }`}
                animate={justUpdated ? { scale: [1, 1.2, 1] } : {}}
            >
                <motion.div
                    animate={justUpdated ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <Star size={16} className={`fill-yellow-400 text-yellow-500 ${justUpdated ? 'drop-shadow-md' : ''}`} />
                </motion.div>
                <span className="font-black text-sm tabular-nums">{stars}</span>
            </motion.div>

            {/* Tooltip on hover */}
            <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-800 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap z-50">
                Your Story Stars
            </div>
        </div>
    );
}
