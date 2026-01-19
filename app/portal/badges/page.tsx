"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Lock, Sparkles, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { BADGES_LIST, LEVELS, calculateLevel, getChildBadges } from '@/lib/database';

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
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');

    useEffect(() => {
        if (activeChild?.id) {
            loadBadges(activeChild.id);
        } else {
            // If no child selected (guest/parent only), show mock/static badges as locked
            const mapped = BADGES_LIST.map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                icon: b.icon,
                category: b.category as string,
                rarity: b.rarity as any,
                earned: false
            }));
            setBadges(mapped);
            setIsLoading(false);
        }
    }, [activeChild]);

    const loadBadges = async (childId: string) => {
        setIsLoading(true);
        try {
            const earnings = await getChildBadges(childId);
            const earnedIds = new Set(earnings.map((e: any) => e.badge_id));

            const mapped = BADGES_LIST.map(b => {
                const earning = earnings.find((e: any) => e.badge_id === b.id);
                return {
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    icon: b.icon,
                    category: b.category as string,
                    rarity: earning?.rarity || b.rarity as any,
                    earned: earnedIds.has(b.id),
                    earnedAt: earning?.earned_at
                };
            });
            setBadges(mapped);
        } catch (error) {
            console.error('Failed to load badges:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalXP = activeChild?.total_xp || 0;
    const level = calculateLevel(totalXP);

    const earnedCount = badges.filter(b => b.earned).length;
    const totalCount = badges.length;

    const filteredBadges = badges.filter(badge => {
        const matchesCategory = activeCategory === 'all' || badge.category === activeCategory;
        const matchesEarned = showEarned === 'all' ||
            (showEarned === 'earned' && badge.earned) ||
            (showEarned === 'locked' && !badge.earned);
        return matchesCategory && matchesEarned;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-6 mb-8">
                        <Link href="/portal" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 shadow-lg">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Achievement Badges</h1>
                            <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">Collect them all to become a Legend!</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
                            <div className="text-4xl font-black">{earnedCount}/{totalCount}</div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-60">Badges Earned</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl flex items-center gap-4">
                            <div className="text-5xl">{level.icon}</div>
                            <div>
                                <div className="text-xl font-black leading-none">{level.name}</div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-60 mt-1">Current Grade</p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
                            <div className="text-4xl font-black">{totalXP.toLocaleString()}</div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-60">Total XP</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters Section */}
            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-50">
                    <div className="flex flex-wrap gap-3 mb-6">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeCategory === cat.id
                                    ? 'bg-primary text-white shadow-xl scale-105'
                                    : 'bg-zinc-50 text-deep/40 hover:bg-zinc-100'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-zinc-50 rounded-xl inline-flex">
                        {[
                            { id: 'all', label: 'All Badges' },
                            { id: 'earned', label: 'Earned' },
                            { id: 'locked', label: 'Locked' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setShowEarned(filter.id as typeof showEarned)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${showEarned === filter.id
                                    ? 'bg-white text-deep shadow-md'
                                    : 'text-deep/30 hover:text-deep/50'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Badges Display */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-primary mb-4" size={48} />
                        <p className="font-black text-deep/20 uppercase tracking-widest">Polishing your medals...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredBadges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`group relative rounded-[2.5rem] p-8 border-2 transition-all duration-300 ${badge.earned
                                    ? `${RARITY_BG[badge.rarity]} shadow-xl hover:shadow-2xl hover:-translate-y-2`
                                    : 'bg-zinc-50 border-zinc-100 opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                {/* Badge Icon Area */}
                                <div className="relative mb-6">
                                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl transition-transform duration-500 group-hover:rotate-12 ${badge.earned
                                        ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} shadow-2xl ring-4 ring-white`
                                        : 'bg-zinc-200'
                                        }`}>
                                        {badge.earned ? badge.icon : <Lock size={40} className="text-zinc-400" />}
                                    </div>

                                    {badge.earned && (
                                        <div className="absolute -bottom-2 right-1/2 translate-x-12 bg-green-500 text-white p-2 rounded-full shadow-lg ring-4 ring-white">
                                            <CheckCircle size={20} />
                                        </div>
                                    )}
                                </div>

                                {/* Text Content */}
                                <div className="text-center">
                                    <h3 className={`text-xl font-black mb-2 leading-tight ${badge.earned ? 'text-deep' : 'text-deep/40'}`}>
                                        {badge.name}
                                    </h3>
                                    <p className="text-xs font-medium text-deep/40 mb-4 h-8 overflow-hidden line-clamp-2">
                                        {badge.description}
                                    </p>

                                    {/* Rarity/Category Tag */}
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.rarity === 'common' ? 'bg-zinc-200 text-zinc-600' :
                                        badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                                                'bg-amber-100 text-amber-700 shadow-sm'
                                        }`}>
                                        {badge.rarity}
                                    </span>

                                    {badge.earned && badge.earnedAt && (
                                        <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-[10px] font-black text-deep/20 uppercase tracking-tighter">
                                            <Clock size={12} /> {new Date(badge.earnedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredBadges.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200">
                            <Star size={48} />
                        </div>
                        <p className="text-xl font-black text-deep/20">NO BADGES FOUND IN THIS CATEGORY</p>
                    </div>
                )}
            </main>

            {/* Newsletter/Next Step */}
            <div className="max-w-6xl mx-auto px-4 pb-24">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[3rem] p-12 text-white text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
                    <div className="relative z-10">
                        <Sparkles className="mx-auto mb-6 text-yellow-300" size={60} />
                        <h3 className="text-4xl font-black mb-4 tracking-tighter">The Legend Treasury is Expanding!</h3>
                        <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
                            Our archivists are busy crafting new legendary achievements for the upcoming festivals.
                            Keep exploring the islands to be the first to claim them!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
