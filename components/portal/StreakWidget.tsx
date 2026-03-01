"use client";

import { useState } from 'react';
import { Flame, Snowflake, ChevronRight, Lock, Share2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buyStreakFreeze } from '@/app/actions/retention';
import { useUser } from '@/components/UserContext';
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
    const { user } = useUser();
    const [currentFreezes, setCurrentFreezes] = useState(freezeCount);
    const [isFreezing, setIsFreezing] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
                // Show modal to buy freeze
                setShowBuyModal(true);
            }
        } catch {
            toast.error('Something went wrong. Try again.');
        } finally {
            setIsFreezing(false);
        }
    };

    const handleBuyStreakFreeze = async () => {
        if (isProcessing || !user) return;
        setIsProcessing(true);
        try {
            // Create PayPal order for streak freeze
            const authToken = await (user as any).getIdToken?.() || '';
            const orderResponse = await fetch('/api/payments/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    productId: 'streak_freeze',
                    metadata: { childId },
                }),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const { id: orderId } = await orderResponse.json();

            // Load PayPal SDK and open dialog (simplified — full implementation would use @paypal/checkout-server-sdk)
            // For now, redirect to a checkout page that handles PayPal button
            if (typeof window !== 'undefined' && (window as any).paypal) {
                // Use PayPal Buttons if SDK is loaded
                toast.success('Opening PayPal...');
            } else {
                // Fallback: open new window to PayPal sandbox
                window.open(
                    `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
                    'paypal',
                    'width=500,height=600'
                );
                setShowBuyModal(false);
                toast.success('Complete the payment in the PayPal window to add a freeze!');
            }
        } catch (error) {
            console.error('PayPal error:', error);
            toast.error('Failed to start payment. Please try again.');
        } finally {
            setIsProcessing(false);
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
                        className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl px-3 py-2 border border-blue-400/30"
                    >
                        <Lock size={14} className="text-blue-300 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-white/80 text-[10px] font-bold leading-tight">
                                Protect your streak with a freeze!
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all rounded-lg px-2 py-1 text-white text-[9px] font-black whitespace-nowrap flex-shrink-0"
                        >
                            <ShoppingCart size={12} />
                            $0.99
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buy Freeze Modal */}
            <AnimatePresence>
                {showBuyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-end z-50"
                        onClick={() => setShowBuyModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl"
                        >
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                                        <Snowflake size={32} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Add a Streak Freeze</h3>
                                    <p className="text-gray-600 text-sm">
                                        Protect your streak if you miss a day. One freeze = one protected day.
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg mt-1">❄️</span>
                                        <div>
                                            <p className="font-bold text-gray-900">How It Works</p>
                                            <p className="text-sm text-gray-600">Miss a day? Your freeze keeps your streak alive.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg mt-1">🔥</span>
                                        <div>
                                            <p className="font-bold text-gray-900">Keep Your Streak</p>
                                            <p className="text-sm text-gray-600">Earn medals and unlocks by staying consistent.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBuyStreakFreeze}
                                    disabled={isProcessing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl py-4 text-white font-black text-lg shadow-lg"
                                >
                                    {isProcessing ? 'Processing...' : 'Buy Freeze for $0.99'}
                                </button>

                                <button
                                    onClick={() => setShowBuyModal(false)}
                                    className="w-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all rounded-2xl py-3 text-gray-900 font-bold"
                                >
                                    Maybe Later
                                </button>

                                <p className="text-center text-[10px] text-gray-500">
                                    Secure payment via PayPal. Refund available within 30 days.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
