"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Trophy, BookOpen, Music, Award, Zap, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getUserStats, UserProfileStats } from '@/lib/services/profile';

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const stats = await getUserStats();
                setProfile(stats);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-orange-500" />
            </div>
        );
    }

    if (!profile) return null;

    const progressPercent = Math.min(100, (profile.currentXP / profile.nextLevelXP) * 100) || 0;

    return (
        <div className="min-h-screen bg-[#FFFBF5] font-sans">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-5xl">

                {/* ═══ Header Section ═══ */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-12">
                    {/* Avatar Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-2 rounded-[2.5rem] shadow-xl border-4 border-orange-100 relative shrink-0"
                    >
                        <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2rem] overflow-hidden relative">
                            <Image src="/images/roti-new.jpg" alt="Profile" fill className="object-cover" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 border-4 border-white px-4 py-1 rounded-full font-black text-sm uppercase tracking-wider whitespace-nowrap shadow-lg flex items-center gap-1.5">
                            <Zap size={14} fill="currentColor" /> Level {profile.level}
                        </div>
                    </motion.div>

                    {/* Stats & Info */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-orange-950 mb-2">My Profile</h1>
                                <p className="text-orange-600 font-bold text-lg flex items-center gap-2 justify-center md:justify-start">
                                    <Trophy size={20} className="text-yellow-500" />
                                    {profile.levelName}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 flex flex-col items-center">
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Streak</span>
                                    <span className="text-2xl font-black text-orange-600 flex items-center gap-1">
                                        {profile.currentStreak} <span className="text-lg">🔥</span>
                                    </span>
                                </div>
                                <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 flex flex-col items-center">
                                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Stars</span>
                                    <span className="text-2xl font-black text-yellow-600 flex items-center gap-1">
                                        {profile.totalStars} <Star size={18} fill="currentColor" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm mb-6">
                            <div className="flex justify-between text-sm font-bold text-zinc-400 mb-2">
                                <span>XP: {profile.currentXP}</span>
                                <span>Target: {profile.nextLevelXP}</span>
                            </div>
                            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-center text-xs font-bold text-orange-400 mt-2">
                                Keep reading to reach {profile.nextLevelXP - profile.currentXP} more XP!
                            </p>
                        </div>

                        <div className="flex justify-center md:justify-start gap-3">
                            <Link href="/library" className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-lg">
                                Go to Library
                            </Link>
                            <button className="px-6 py-3 bg-white text-zinc-900 border-2 border-zinc-100 rounded-xl font-bold hover:bg-zinc-50 transition-colors opacity-50 cursor-not-allowed">
                                Edit Avatar (Soon)
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ Content Grid ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Badges Section */}
                    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                                <Award className="text-orange-500" />
                                My Badges
                            </h2>
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                                {profile.badges.length} Earned
                            </span>
                        </div>

                        {profile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {profile.badges.map((badge: any, i) => (
                                    <div key={i} className="aspect-square bg-zinc-50 rounded-2xl flex flex-col items-center justify-center p-3 text-center border border-zinc-100 group hover:border-orange-200 transition-colors cursor-default">
                                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{badge.icon || '🏅'}</div>
                                        <span className="text-xs font-bold text-zinc-700 leading-tight">{badge.name || 'Badge'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                                <div className="text-4xl mb-2 opacity-50">🔒</div>
                                <p className="text-sm text-zinc-400 font-bold">No badges yet. Start reading!</p>
                            </div>
                        )}
                    </section>

                    {/* Recent History */}
                    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                                <BookOpen className="text-blue-500" />
                                Recent Adventures
                            </h2>
                        </div>

                        {profile.recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {profile.recentActivity.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-colors border border-transparent hover:border-zinc-100">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'story' ? 'bg-orange-100 text-orange-500' : 'bg-purple-100 text-purple-500'}`}>
                                            {item.type === 'story' ? <BookOpen size={20} /> : <Music size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-zinc-800 truncate">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 font-medium">{item.date} • {item.result}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <span className="text-yellow-600 font-bold text-sm">+{item.stars}</span>
                                            <Star size={12} fill="#CA8A04" className="text-yellow-600" />
                                        </div>
                                    </div>
                                ))}

                                <Link href="/library" className="block text-center py-3 text-sm font-bold text-zinc-400 hover:text-orange-500 transition-colors border-t border-zinc-100 mt-4">
                                    View Full History
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                                <p className="text-sm text-zinc-400 font-bold">No history yet.</p>
                                <Link href="/library" className="text-orange-500 text-xs font-black mt-2 inline-block hover:underline">START ADVENTURE</Link>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
