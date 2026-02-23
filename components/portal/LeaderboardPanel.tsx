"use client";

import { useState, useEffect } from 'react';
import { Trophy, Medal, Users, Globe, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeaderboard, type LeaderboardEntry } from '@/app/actions/leaderboard';
import { useUser } from '@/components/UserContext';

export default function LeaderboardPanel() {
    const { user } = useUser();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [filter, setFilter] = useState<'global' | 'family'>('global');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setIsLoading(true);
            try {
                const data = await getLeaderboard(10, filter);
                setEntries(data);
            } catch (error) {
                console.error('Failed to load leaderboard', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLeaderboard();
    }, [filter]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="text-amber-400" size={20} />;
            case 2: return <Medal className="text-zinc-400" size={20} />;
            case 3: return <Medal className="text-orange-400" size={20} />;
            default: return <span className="text-deep/20 font-black w-5 text-center">{rank}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-deep flex items-center gap-2">
                    <Trophy className="text-amber-400" /> Community Leaderboard
                </h2>

                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('global')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === 'global' ? 'bg-white text-primary shadow-sm' : 'text-deep/40 hover:text-deep/60'}`}
                    >
                        <Globe size={14} /> Global
                    </button>
                    <button
                        onClick={() => setFilter('family')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === 'family' ? 'bg-white text-primary shadow-sm' : 'text-deep/40 hover:text-deep/60'}`}
                    >
                        <Users size={14} /> Family
                    </button>
                </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary/40" size={32} />
                        <p className="text-xs font-black text-deep/20 uppercase tracking-widest">Loading Rankings...</p>
                    </div>
                ) : entries.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                        <AnimatePresence mode="popLayout">
                            {entries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-4 p-4 transition-colors ${entry.isCurrentUser ? 'bg-primary/5' : 'hover:bg-white'}`}
                                >
                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    <div className="relative">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-lg shadow-inner overflow-hidden border-2 border-white">
                                            {entry.avatarUrl ? (
                                                <img src={entry.avatarUrl} alt={entry.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="opacity-40">👤</span>
                                            )}
                                        </div>
                                        {entry.isCurrentUser && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                                                <Star size={8} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black truncate ${entry.isCurrentUser ? 'text-primary' : 'text-deep'}`}>
                                            {entry.firstName}
                                            {entry.isCurrentUser && <span className="ml-2 text-[8px] bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>}
                                        </p>
                                        <p className="text-[10px] font-bold text-deep/30 uppercase tracking-widest">
                                            Level {entry.level}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-black text-deep leading-none">
                                            {entry.totalXp.toLocaleString()}
                                        </p>
                                        <p className="text-[8px] font-black text-deep/20 uppercase tracking-tighter mt-1">
                                            Total XP
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-sm font-bold text-deep/30">No legends found in this category yet!</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-4 border border-primary/10">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Star className="text-primary" fill="currentColor" size={20} />
                </div>
                <div>
                    <p className="text-xs font-black text-deep leading-tight">Climb the Ranks!</p>
                    <p className="text-[10px] font-bold text-deep/40 italic">Read stories and complete missions to earn XP.</p>
                </div>
            </div>
        </div>
    );
}
