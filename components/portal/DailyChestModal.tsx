"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Star, Lock } from 'lucide-react';
import { openDailyChest } from '@/app/actions/retention';
import toast from 'react-hot-toast';

interface DailyChestModalProps {
    childId: string;
    chestReady: boolean;        // true = can open, false = already opened or no chest
    onClose: () => void;
    onRewardClaimed?: (type: string, value: string) => void;
}

type RewardType = 'xp' | 'badge' | 'cosmetic' | null;

const REWARD_DISPLAY: Record<string, { emoji: string; label: string; color: string }> = {
    // XP amounts
    '5': { emoji: '⚡', label: '+5 XP', color: 'from-yellow-400 to-orange-400' },
    '10': { emoji: '⚡', label: '+10 XP', color: 'from-yellow-400 to-orange-400' },
    '15': { emoji: '⚡', label: '+15 XP', color: 'from-yellow-400 to-orange-400' },
    '20': { emoji: '⚡', label: '+20 XP', color: 'from-yellow-400 to-orange-400' },
    '25': { emoji: '⚡', label: '+25 XP', color: 'from-yellow-400 to-orange-400' },
    // Badges
    'first_story': { emoji: '📖', label: 'First Adventure Badge', color: 'from-blue-400 to-indigo-500' },
    'first_song': { emoji: '🎵', label: 'First Vibes Badge', color: 'from-purple-400 to-pink-500' },
    'patois_starter': { emoji: '🗣️', label: 'Patois Pickney Badge', color: 'from-green-400 to-emerald-500' },
    // Cosmetics
    'tanty_spice_hat': { emoji: '🎩', label: 'Tanty Spice Hat', color: 'from-red-400 to-rose-500' },
};

export default function DailyChestModal({ childId, chestReady, onClose, onRewardClaimed }: DailyChestModalProps) {
    const [phase, setPhase] = useState<'idle' | 'opening' | 'revealed' | 'alreadyOpen'>(
        chestReady ? 'idle' : 'alreadyOpen'
    );
    const [reward, setReward] = useState<{ type: RewardType; value: string | null }>({ type: null, value: null });

    const handleOpen = async () => {
        if (phase !== 'idle') return;
        setPhase('opening');

        try {
            const result = await openDailyChest(childId);
            if (result.success && result.rewardType && result.rewardValue) {
                await new Promise(r => setTimeout(r, 900)); // dramatic pause
                setReward({ type: result.rewardType, value: result.rewardValue });
                setPhase('revealed');
                onRewardClaimed?.(result.rewardType, result.rewardValue);
            } else {
                toast.error(result.error || 'Could not open chest.');
                setPhase('alreadyOpen');
            }
        } catch {
            toast.error('Something went wrong!');
            setPhase('idle');
        }
    };

    const rewardInfo = reward.value ? REWARD_DISPLAY[reward.value] : null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        title="Close Modal"
                        aria-label="Close Modal"
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-400"
                    >
                        <X size={16} />
                    </button>

                    {/* ---- IDLE: Show chest to open ---- */}
                    {phase === 'idle' && (
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Daily Reward</p>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Your Chest is Ready!</h2>
                            </div>

                            <motion.button
                                onClick={handleOpen}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className="mx-auto block text-7xl cursor-pointer select-none"
                            >
                                🎁
                            </motion.button>

                            <p className="text-zinc-400 text-sm font-medium">
                                Tap to reveal your daily reward — XP, badge, or a surprise!
                            </p>

                            <button
                                onClick={handleOpen}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Gift size={18} />
                                Open Chest
                            </button>
                        </div>
                    )}

                    {/* ---- OPENING: Loading animation ---- */}
                    {phase === 'opening' && (
                        <div className="space-y-6 py-4">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1.2, 1.2, 1] }}
                                transition={{ duration: 0.8, repeat: 1 }}
                                className="text-7xl mx-auto block"
                            >
                                🎁
                            </motion.div>
                            <div className="flex justify-center gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.3 }}
                                        className="w-2 h-2 bg-orange-400 rounded-full"
                                    />
                                ))}
                            </div>
                            <p className="text-zinc-400 text-sm font-bold">Opening...</p>
                        </div>
                    )}

                    {/* ---- REVEALED: Show the reward ---- */}
                    {phase === 'revealed' && rewardInfo && (
                        <div className="space-y-6">
                            {/* Confetti stars */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 1, y: 0, x: '50%', scale: 0 }}
                                        animate={{
                                            opacity: 0,
                                            y: -120 - Math.random() * 80,
                                            x: `${30 + Math.random() * 40}%`,
                                            scale: 1,
                                            rotate: Math.random() * 360,
                                        }}
                                        transition={{ duration: 1.2, delay: i * 0.08 }}
                                        className="absolute bottom-1/2 text-lg"
                                    >
                                        {['⭐', '✨', '🌟', '💫'][i % 4]}
                                    </motion.div>
                                ))}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">You received</p>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    {reward.type === 'xp' ? 'XP Boost!' : reward.type === 'badge' ? 'New Badge!' : 'Cosmetic Unlocked!'}
                                </h2>
                            </div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                                className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${rewardInfo.color} flex items-center justify-center shadow-2xl`}
                            >
                                <span className="text-5xl">{rewardInfo.emoji}</span>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl font-black text-zinc-900"
                            >
                                {rewardInfo.label}
                            </motion.p>

                            <div className="flex items-center gap-2 justify-center text-zinc-400">
                                <Sparkles size={14} />
                                <span className="text-xs font-bold">Come back tomorrow for another chest!</span>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Awesome! 🎉
                            </button>
                        </div>
                    )}

                    {/* ---- ALREADY OPEN: Show time-gate ---- */}
                    {phase === 'alreadyOpen' && (
                        <div className="space-y-6 py-4">
                            <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center">
                                <Lock size={28} className="text-zinc-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900">Already opened!</h2>
                                <p className="text-zinc-400 text-sm font-medium mt-2">
                                    Your next chest unlocks tomorrow. Keep your streak going! 🔥
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
