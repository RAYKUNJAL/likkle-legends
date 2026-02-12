"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, X, Trophy, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeUnlockModalProps {
    badge: {
        id: string;
        name: string;
        description: string;
        icon: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
    } | null;
    onClose: () => void;
}

const RARITY_COLORS = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-800',
    legendary: 'from-amber-400 to-orange-600',
};

export default function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps) {
    useEffect(() => {
        if (badge) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [badge]);

    if (!badge) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.5, y: 100, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-full max-w-md bg-white rounded-[4rem] shadow-2xl overflow-hidden border-8 border-white"
                >
                    {/* Header Banner */}
                    <div className={`h-40 bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full flex items-center justify-center text-white scale-[3]"
                            >
                                <Sparkles size={100} />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="bg-white/20 backdrop-blur-md w-28 h-28 rounded-full flex items-center justify-center text-7xl shadow-2xl ring-4 ring-white/30"
                        >
                            {badge.icon}
                        </motion.div>
                    </div>

                    <div className="p-10 text-center bg-white relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
                                Achievement Unlocked!
                            </span>
                            <h2 className="text-4xl font-black text-deep mb-3 tracking-tight">
                                {badge.name}
                            </h2>
                            <p className="text-lg text-deep/40 font-bold mb-8 leading-relaxed">
                                {badge.description}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Nice! 🎉
                            </button>
                            <button
                                className="w-full py-4 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `I just earned the ${badge.name} badge!`,
                                            text: `Check out my legend status on Likkle Legends!`,
                                            url: window.location.href
                                        });
                                    }
                                }}
                            >
                                <Share2 size={20} />
                                Share
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Rarity Label overlay */}
                    <div className="absolute top-36 right-10 translate-y-1/2">
                        <span className={`px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg bg-gradient-to-r ${RARITY_COLORS[badge.rarity]}`}>
                            {badge.rarity}
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
