"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Star, Lock, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { BADGES, LEVELS, calculateLevel } from '@/lib/gamification';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earned: boolean;
    earnedAt?: string;
    progress?: number;
    target?: number;
}

const USER_BADGES: Badge[] = [
    { id: 'first_story', name: 'Story Starter', description: 'Read your first story', icon: '📖', category: 'stories', rarity: 'common', earned: true, earnedAt: '2025-12-20' },
    { id: 'bookworm', name: 'Bookworm', description: 'Read 10 stories', icon: '📚', category: 'stories', rarity: 'rare', earned: true, earnedAt: '2025-12-28' },
    { id: 'story_master', name: 'Story Master', description: 'Read 50 stories', icon: '🏆', category: 'stories', rarity: 'epic', earned: false, progress: 15, target: 50 },
    { id: 'first_song', name: 'Music Fan', description: 'Listen to your first song', icon: '🎵', category: 'music', rarity: 'common', earned: true, earnedAt: '2025-12-20' },
    { id: 'melody_maker', name: 'Melody Maker', description: 'Listen to 20 songs', icon: '🎶', category: 'music', rarity: 'rare', earned: true, earnedAt: '2025-12-30' },
    { id: 'week_warrior', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streaks', rarity: 'rare', earned: false, progress: 5, target: 7 },
    { id: 'month_master', name: 'Month Master', description: '30-day learning streak', icon: '⭐', category: 'streaks', rarity: 'legendary', earned: false, progress: 5, target: 30 },
    { id: 'jamaica_explorer', name: 'Jamaica Explorer', description: 'Complete all Jamaica content', icon: '🇯🇲', category: 'islands', rarity: 'epic', earned: false, progress: 7, target: 10 },
    { id: 'trinidad_explorer', name: 'Trinidad Explorer', description: 'Complete all Trinidad content', icon: '🇹🇹', category: 'islands', rarity: 'epic', earned: false, progress: 3, target: 10 },
    { id: 'word_wizard', name: 'Word Wizard', description: 'Learn 25 Patois words', icon: '🗣️', category: 'language', rarity: 'rare', earned: false, progress: 18, target: 25 },
    { id: 'cultural_champion', name: 'Cultural Champion', description: 'Complete a heritage journey', icon: '👑', category: 'cultural', rarity: 'legendary', earned: false, progress: 4, target: 10 },
    { id: 'first_mission', name: 'Mission Ace', description: 'Complete your first mission', icon: '🎯', category: 'missions', rarity: 'common', earned: true, earnedAt: '2025-12-21' },
];

const CATEGORIES = [
    { id: 'all', label: 'All Badges' },
    { id: 'stories', label: 'Stories' },
    { id: 'music', label: 'Music' },
    { id: 'streaks', label: 'Streaks' },
    { id: 'islands', label: 'Islands' },
    { id: 'language', label: 'Language' },
    { id: 'cultural', label: 'Cultural' },
];

const RARITY_COLORS = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BG = {
    common: 'bg-gray-100 border-gray-200',
    rare: 'bg-blue-50 border-blue-200',
    epic: 'bg-purple-50 border-purple-200',
    legendary: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
};

export default function BadgesPage() {
    const { activeChild } = useUser();
    const [activeCategory, setActiveCategory] = useState('all');
    const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');

    const totalXP = activeChild?.total_xp || 1250;
    const level = calculateLevel(totalXP);

    const earnedCount = USER_BADGES.filter(b => b.earned).length;
    const totalCount = USER_BADGES.length;

    const filteredBadges = USER_BADGES.filter(badge => {
        const matchesCategory = activeCategory === 'all' || badge.category === activeCategory;
        const matchesEarned = showEarned === 'all' ||
            (showEarned === 'earned' && badge.earned) ||
            (showEarned === 'locked' && !badge.earned);
        return matchesCategory && matchesEarned;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/portal" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">Achievement Badges</h1>
                            <p className="text-white/70 text-sm">Collect badges and show your progress!</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black">{earnedCount}/{totalCount}</div>
                            <p className="text-xs text-white/70">Badges Earned</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl">{level.icon}</div>
                            <p className="text-xs text-white/70">{level.name}</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black">{totalXP.toLocaleString()}</div>
                            <p className="text-xs text-white/70">Total XP</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${activeCategory === cat.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'earned', label: 'Earned' },
                            { id: 'locked', label: 'Locked' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setShowEarned(filter.id as typeof showEarned)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${showEarned === filter.id
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Badges Grid */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBadges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`rounded-2xl p-6 border-2 transition-all hover:scale-105 ${badge.earned
                                    ? RARITY_BG[badge.rarity]
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                        >
                            {/* Badge Icon */}
                            <div className="relative mb-4">
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${badge.earned
                                        ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} shadow-lg`
                                        : 'bg-gray-200'
                                    }`}>
                                    {badge.earned ? badge.icon : <Lock size={32} className="text-gray-400" />}
                                </div>

                                {badge.earned && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white p-1 rounded-full">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                            </div>

                            {/* Badge Info */}
                            <div className="text-center">
                                <h3 className={`font-bold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {badge.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-3">{badge.description}</p>

                                {/* Rarity Tag */}
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.rarity === 'common' ? 'bg-gray-200 text-gray-600' :
                                        badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                                                'bg-amber-100 text-amber-700'
                                    }`}>
                                    {badge.rarity}
                                </span>

                                {/* Progress or Date */}
                                {badge.earned && badge.earnedAt && (
                                    <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                                        <Clock size={12} /> {new Date(badge.earnedAt).toLocaleDateString()}
                                    </p>
                                )}

                                {!badge.earned && badge.progress !== undefined && (
                                    <div className="mt-3">
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(badge.progress / (badge.target || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{badge.progress}/{badge.target}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBadges.length === 0 && (
                    <div className="text-center py-16">
                        <Trophy className="text-gray-300 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">No badges in this category</p>
                    </div>
                )}
            </main>

            {/* Coming Soon Banner */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
                    <Sparkles className="mx-auto mb-4" size={40} />
                    <h3 className="text-2xl font-black mb-2">More Badges Coming!</h3>
                    <p className="text-white/80 max-w-md mx-auto">
                        Keep learning and exploring to unlock special seasonal badges and limited-edition achievements!
                    </p>
                </div>
            </div>
        </div>
    );
}
