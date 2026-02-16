
"use client";

import { motion } from 'framer-motion';
import {
    BookOpen, Headphones, Trophy, Star, TrendingUp,
    Brain, MessageSquare, Award, Clock, Heart
} from 'lucide-react';

interface AssessmentData {
    storiesRead: number;
    phonicsMastered: string[];
    patoisWords: string[];
    averageScore: number;
    totalXP: number;
    streak: number;
    recentImprovement: number; // percentage
}

export function AssessmentDashboard({ data }: { data: AssessmentData }) {
    const stats = [
        { label: 'Stories Read', value: data.storiesRead, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Phonics Legend', value: data.phonicsMastered.length, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Patois Pro', value: data.patoisWords.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Avg. Score', value: `${Math.round(data.averageScore * 100)}%`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    return (
        <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-50/50 backdrop-blur-sm border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <span className="text-2xl font-black text-deep">{stat.value}</span>
                        <span className="text-xs font-bold text-deep/40 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Literacy Progress */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-deep">Literacy Growth</h3>
                            <p className="text-sm text-deep/40 font-bold">Phonics & Vocabulary Track</p>
                        </div>
                        <TrendingUp className="text-emerald-500" size={32} />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-black text-deep">
                                <span>Phonics Mastered</span>
                                <span>{data.phonicsMastered.length}/26</span>
                            </div>
                            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(data.phonicsMastered.length / 26) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-black text-deep">
                                <span>Caribbean Vocabulary</span>
                                <span>{data.patoisWords.length} Words</span>
                            </div>
                            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(data.patoisWords.length * 2, 100)}%` }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {data.phonicsMastered.map(sound => (
                            <span key={sound} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                                /{sound}/
                            </span>
                        ))}
                        {data.patoisWords.slice(0, 5).map(word => (
                            <span key={word} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest italic">
                                "{word}"
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Cultural Heritage Achievements */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-deep">Cultural Badges</h3>
                            <p className="text-sm text-deep/40 font-bold">Indigenous Stories & History</p>
                        </div>
                        <Award className="text-amber-500" size={32} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 1, name: 'Anansi Seeker', icon: '🕷️', unlocked: data.storiesRead >= 1 },
                            { id: 2, name: 'Island Guardian', icon: '🌿', unlocked: data.totalXP > 1000 },
                            { id: 3, name: 'Tanty\'s Helper', icon: '👵', unlocked: data.streak >= 3 },
                            { id: 4, name: 'Patois Hero', icon: '🗣️', unlocked: data.patoisWords.length >= 10 },
                            { id: 5, name: 'Phonics Pilot', icon: '✈️', unlocked: data.averageScore > 0.8 },
                            { id: 6, name: 'Likkle Legend', icon: '👑', unlocked: data.totalXP > 5000 }
                        ].map(badge => (
                            <div key={badge.id} className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${badge.unlocked ? 'border-amber-100 bg-amber-50/50' : 'border-dashed border-zinc-100 bg-zinc-50/10 grayscale'}`}>
                                <span className="text-3xl">{badge.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none text-deep/60">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
