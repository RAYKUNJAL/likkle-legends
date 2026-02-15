"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar, Star, Info } from 'lucide-react';
import { ContestEntryForm, ContestStatusCard } from '@/components/growth/ContestComponents';

interface ContestClientProps {
    contest: any;
    initialStats: any;
}

export default function ContestClient({ contest, initialStats }: ContestClientProps) {
    const [entry, setEntry] = useState<any>(null);
    const [stats, setStats] = useState(initialStats);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already entered (via localStorage/email)
        const savedEntryId = localStorage.getItem(`contest_entry_${contest.id}`);
        if (savedEntryId) {
            fetchStats(savedEntryId);
        } else {
            setIsLoading(false);
        }
    }, [contest.id]);

    const fetchStats = async (entryId: string) => {
        try {
            const { getContestStats } = await import('@/app/actions/growth');
            const data = await getContestStats(contest.slug, entryId);
            if (data?.userStats) {
                setEntry(data.userStats);
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch entry stats", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = (newEntry: any) => {
        setEntry(newEntry);
        localStorage.setItem(`contest_entry_${contest.id}`, newEntry.id);
        fetchStats(newEntry.id);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-pulse text-orange-200 font-black text-2xl italic">Summoning Giveaway...</div>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Hero & Info */}
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-xs font-black uppercase tracking-widest mb-6">
                        <Gift size={14} />
                        Active Giveaway
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-orange-950 leading-tight mb-6">
                        {contest.title}
                    </h1>
                    <p className="text-xl text-orange-900/60 leading-relaxed max-w-xl">
                        {contest.description}
                    </p>
                </motion.div>

                {/* Prize Pool */}
                <div className="bg-white rounded-[2.5rem] p-8 border-4 border-orange-50 shadow-sm">
                    <h3 className="text-xl font-black text-orange-950 mb-6 flex items-center gap-2">
                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        What You Can Win
                    </h3>
                    <div className="grid gap-4">
                        {contest.prizes?.map((prize: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/50">
                                <div className="text-2xl">{prize.emoji || '🎁'}</div>
                                <div>
                                    <div className="font-bold text-orange-950">{prize.name}</div>
                                    <div className="text-xs text-orange-900/40 font-bold uppercase">{prize.value} Value</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Dates */}
                <div className="flex gap-8 text-sm font-bold text-orange-900/40">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Ends {new Date(contest.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Info size={16} />
                        Open to All
                    </div>
                </div>
            </div>

            {/* Right Column: Interaction */}
            <div className="lg:sticky lg:top-32">
                <AnimatePresence mode="wait">
                    {!entry ? (
                        <motion.div
                            key="signup"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] p-10 border-8 border-orange-50 shadow-2xl"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-orange-950 mb-2">Enter to Win!</h2>
                                <p className="text-orange-900/40 font-bold uppercase text-xs tracking-widest">Takes only 5 seconds</p>
                            </div>
                            <ContestEntryForm
                                contestSlug={contest.slug}
                                onSuccess={handleSuccess}
                            />
                            <p className="text-center mt-8 text-[10px] text-zinc-400 font-medium">
                                By entering, you agree to our contest terms and privacy policy.
                                We promise no spam, just legends!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="bg-green-500 text-white p-6 rounded-[2.5rem] flex items-center gap-4 mb-4">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Gift size={24} />
                                </div>
                                <div>
                                    <div className="text-lg font-black leading-tight">You’re Entered!</div>
                                    <div className="text-xs font-bold opacity-80 uppercase tracking-widest">Good luck, Legend!</div>
                                </div>
                            </div>

                            <ContestStatusCard
                                entry={entry}
                                prizes={contest.prizes}
                                leaderboard={stats?.leaderboard}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
