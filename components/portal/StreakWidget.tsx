"use client";

import { useState } from 'react';
import { Flame, Snowflake, ChevronRight, Lock, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buyStreakFreeze } from '@/app/actions/retention';
import toast from 'react-hot-toast';

interface StreakWidgetProps {
    streakDay: number;
    freezeCount: number;
    childId: string;
    onFreezeUsed?: () => void;
    onShare?: () => void;
}

const MILESTONE_DAYS = [1, 3, 7, 14, 30];
const MILESTONE_LABELS: Record<number, string> = {
    7: 'Week Warrior 🔥',
    14: 'Fortnight Fire 🌋',
    30: 'Island Legend 👑',
};

export default function StreakWidget({ streakDay, freezeCount, childId, onFreezeUsed, onShare }: StreakWidgetProps) {
    const [currentFreezes, setCurrentFreezes] = useState(freezeCount);
    const [isFreezing, setIsFreezing] = useState(false);

    // Find next milestone
    const nextMilestone = MILESTONE_DAYS.find(d => d > streakDay);
    const daysToMilestone = nextMilestone ? nextMilestone - streakDay : null;
    const milestoneLabel = nextMilestone ? MILESTONE_LABELS[nextMilestone] : null;

    const handleFreeze = async () => {
        if (isFreezing) return;
        setIsFreezing(true);
        try {
            const result = await buyStreakFreeze(childId);
            if (result.success) {
                setCurrentFreezes(result.remainingFreezes);
                toast.success('❄️ Streak Freeze used! Your streak is safe.');
                onFreezeUsed?.();
            } else if (result.error === 'no_freezes_available') {
                toast.error('No freezes left! Earn more by completing missions.', { icon: '🧊' });
            }
        } catch {
            toast.error('Something went wrong. Try again.');
        } finally {
            setIsFreezing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-5 shadow-xl shadow-orange-500/20 overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4">
                {/* Left: Flame + Count */}
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl leading-none select-none"
                    >
                        🔥
                    </motion.div>
                    <div>
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            Day Streak
                        </p>
                        <p className="text-white font-black text-3xl leading-none">
                            {streakDay}
                        </p>
                    </div>
                </div>

                {/* Center: 7-dot week progress */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex gap-1.5">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const dayOfWeek = (streakDay - 1) % 7;
                            const isActive = i <= dayOfWeek;
                            const isToday = i === dayOfWeek;
                            return (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full border-2 transition-all ${isToday
                                        ? 'bg-yellow-300 border-yellow-100 scale-125 shadow-lg shadow-yellow-300/50'
                                        : isActive
                                            ? 'bg-white border-white'
                                            : 'bg-white/20 border-white/30'
                                        }`}
                                />
                            );
                        })}
                    </div>
                    {milestoneLabel && daysToMilestone && (
                        <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest text-center">
                            {daysToMilestone} day{daysToMilestone !== 1 ? 's' : ''} to {milestoneLabel}
                        </p>
                    )}
                    {!daysToMilestone && (
                        <p className="text-yellow-200 text-[9px] font-black uppercase tracking-widest">
                            🏆 All milestones unlocked!
                        </p>
                    )}
                </div>

                {/* Right: Share + Freeze buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onShare}
                        className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl px-3 py-2.5 border border-white/20"
                        title="Share your streak"
                    >
                        <Share2 size={18} className="text-yellow-200" />
                        <span className="text-white/50 text-[8px] uppercase tracking-widest">Share</span>
                    </button>
                    <button
                        onClick={handleFreeze}
                        disabled={isFreezing}
                        className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl px-3 py-2.5 border border-white/20"
                        title="Use a streak freeze to protect your streak"
                    >
                        <Snowflake size={18} className="text-blue-200" />
                        <span className="text-white font-black text-sm leading-none">{currentFreezes}</span>
                        <span className="text-white/50 text-[8px] uppercase tracking-widest">Freeze</span>
                    </button>
                </div>
            </div>

            {/* Freeze count zero nudge */}
            <AnimatePresence>
                {currentFreezes === 0 && streakDay > 3 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2"
                    >
                        <Lock size={12} className="text-white/60" />
                        <p className="text-white/70 text-[10px] font-bold">
                            No freezes! Complete a mission to earn one free.
                        </p>
                        <ChevronRight size={12} className="text-white/40 ml-auto" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
