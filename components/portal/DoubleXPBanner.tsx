'use client';

import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoubleXPBannerProps {
    multiplier: number;
    isVisible: boolean;
}

const DoubleXPBanner: React.FC<DoubleXPBannerProps> = ({ multiplier, isVisible }) => {
    if (!isVisible || multiplier <= 1) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
            >
                <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-[length:200%_auto] animate-gradient-x p-[2px] rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-[14px] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-2xl animate-pulse">
                                ⚡
                            </div>
                            <div>
                                <h3 className="text-amber-600 font-extrabold text-sm leading-tight uppercase tracking-wider">
                                    Bonus Active!
                                </h3>
                                <p className="text-slate-800 font-black text-lg leading-tight">
                                    {multiplier}X XP EVENT
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-amber-500"
                        >
                            <Sparkles className="w-6 h-6 fill-current" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DoubleXPBanner;
