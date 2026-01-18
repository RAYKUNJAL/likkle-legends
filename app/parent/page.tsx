"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Settings, BarChart3, Users, Sparkles, Plus, ArrowRight,
    Edit, BookOpen, Music, Trophy, Flame, Target, TrendingUp,
    ChevronRight, Star
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/components/UserContext';
import { calculateLevel } from '@/lib/gamification';
import { getRecentActivities, getMissions } from '@/lib/database';
import TantyRadio from '@/components/TantyRadio';

export default function ParentDashboard() {
    const { user, children, activeChild, isLoading, isSubscribed } = useUser();
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        if (activeChild) {
            loadDashboardData();
        }
    }, [activeChild]);

    const loadDashboardData = async () => {
        if (!activeChild || !user) return;
        setIsDataLoading(true);
        try {
            const [activitiesData, missionsData] = await Promise.all([
                getRecentActivities(activeChild.id, 5),
                getMissions(activeChild.age_track),
            ]);
            setActivities(activitiesData);
            setMissions(missionsData);
        } catch (error) {
            console.error('Failed to load portal data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    // If not logged in, show login prompt
    if (!isLoading && !user) {
        return (
            <div className="bg-[#FFFDF7] min-h-screen">
                <Navbar />
                <main className="container pt-32 pb-24 text-center">
                    <h1 className="text-4xl font-black text-deep mb-4">Parent Dashboard</h1>
                    <p className="text-xl text-deep/60 mb-8">Please log in to access your dashboard.</p>
                    <Link
                        href="/login?redirect=/parent"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        Sign In →
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : null;

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Navbar />
            <main className="container pt-32 pb-24">
                <header className="mb-16">
                    <span className="text-primary font-black uppercase tracking-widest text-sm mb-4 inline-block">Parent Portal</span>
                    <h1 className="text-5xl lg:text-7xl font-black text-deep mb-4">Parent Dashboard 🏠</h1>
                    <p className="text-xl text-deep/60">
                        {user ? `Welcome back, ${user.full_name?.split(' ')[0]}!` : 'Manage your little legend\'s cultural journey.'}
                    </p>
                </header>

                <div className="mb-12">
                    <TantyRadio isLite />
                </div>

                {isLoading ? (
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl animate-pulse h-40" />
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl animate-pulse h-40" />
                            </div>
                            <div className="bg-white p-12 rounded-[4rem] shadow-2xl animate-pulse h-64" />
                        </div>
                        <div className="space-y-10">
                            <div className="bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-12 rounded-[4rem] animate-pulse h-80" />
                        </div>
                    </div>
                ) : children.length === 0 ? (
                    // No children - prompt to add
                    <div className="bg-white rounded-[4rem] p-16 text-center shadow-xl max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Users size={48} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-deep mb-4">Add Your First Legend</h2>
                        <p className="text-deep/60 mb-8">
                            Create a profile for your child to start tracking their cultural learning journey.
                        </p>
                        <Link
                            href="/onboarding/child"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/30"
                        >
                            <Plus size={24} />
                            Add Child Profile
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Stats */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="grid sm:grid-cols-4 gap-6">
                                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 group hover:scale-[1.02] transition-transform">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                        <BookOpen size={28} />
                                    </div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Stories</p>
                                    <p className="text-3xl font-black text-deep tracking-tighter">{activeChild?.stories_completed || 0}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 group hover:scale-[1.02] transition-transform">
                                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <Music size={28} />
                                    </div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Songs</p>
                                    <p className="text-3xl font-black text-deep tracking-tighter">{activeChild?.songs_listened || 0}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 group hover:scale-[1.02] transition-transform">
                                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <Flame size={28} />
                                    </div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Streak</p>
                                    <p className="text-3xl font-black text-deep tracking-tighter">{activeChild?.current_streak || 0} Days</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 group hover:scale-[1.02] transition-transform">
                                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <Trophy size={28} />
                                    </div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Badges</p>
                                    <p className="text-3xl font-black text-deep tracking-tighter">{activeChild?.earned_badges?.length || 0}</p>
                                </div>
                            </div>

                            {/* Weekly Missions */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-deep flex items-center gap-3">
                                        <Target className="text-primary" />
                                        Weekly Missions
                                    </h3>
                                    <Link href="/portal" className="text-primary font-bold text-sm hover:underline">
                                        Open Portal →
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {isDataLoading ? (
                                        [1, 2].map(i => <div key={i} className="h-20 bg-zinc-50 rounded-2xl animate-pulse" />)
                                    ) : missions.length === 0 ? (
                                        <p className="text-zinc-400 font-bold text-center py-4">No active missions</p>
                                    ) : (
                                        missions.slice(0, 2).map((mission) => (
                                            <div key={mission.id} className="flex items-center gap-4 p-5 bg-zinc-50 rounded-[1.5rem] group hover:bg-zinc-100 transition-colors">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <Target className="text-primary" size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-deep">{mission.title}</h4>
                                                    <p className="text-sm text-deep/40">{mission.estimated_minutes} mins • +{mission.xp_reward} XP</p>
                                                </div>
                                                <ChevronRight className="text-zinc-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                                <h3 className="text-2xl font-black text-deep flex items-center gap-3 mb-8">
                                    <TrendingUp className="text-green-500" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {isDataLoading ? (
                                        [1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-50 rounded-2xl animate-pulse" />)
                                    ) : activities.length === 0 ? (
                                        <p className="text-zinc-400 font-bold text-center py-4">No recent activity</p>
                                    ) : (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-zinc-50 last:border-0">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                    <Star size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-deep capitalize text-sm">{activity.activity_type.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-deep/30">{new Date(activity.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-black text-green-600 text-sm">+{activity.xp_earned} XP</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Child Profiles */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black text-deep">Legend Profiles</h3>
                                    <Link
                                        href="/onboarding/child"
                                        className="flex items-center gap-3 text-primary font-black text-xs bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Plus size={16} /> Add Child
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {children.map((child) => {
                                        const level = calculateLevel(child.total_xp);
                                        return (
                                            <div
                                                key={child.id}
                                                className="p-6 rounded-[2rem] border-2 border-primary/10 bg-primary/5 flex items-center justify-between group hover:border-primary transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                                                        {child.first_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-deep">{child.first_name}</h4>
                                                        <p className="text-deep/40 text-xs font-bold">
                                                            Age {child.age} • {level.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/account/children/${child.id}`}
                                                    className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline flex items-center gap-1.5"
                                                >
                                                    <Edit size={12} /> Edit
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="grid sm:grid-cols-3 gap-6">
                                <Link
                                    href="/portal"
                                    className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 rounded-[2.5rem] text-white hover:scale-[1.02] transition-transform"
                                >
                                    <h4 className="text-xl font-black mb-2">Portal</h4>
                                    <p className="text-white/80 text-sm">Open Portal</p>
                                </Link>
                                <Link
                                    href="/messages"
                                    className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 rounded-[2.5rem] text-white hover:scale-[1.02] transition-transform"
                                >
                                    <h4 className="text-xl font-black mb-2">Chat</h4>
                                    <p className="text-white/80 text-sm">Messages</p>
                                </Link>
                                <Link
                                    href="/analytics"
                                    className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-[2.5rem] text-white hover:scale-[1.02] transition-transform"
                                >
                                    <h4 className="text-xl font-black mb-2">Stats</h4>
                                    <p className="text-white/80 text-sm">Progress</p>
                                </Link>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-10">
                            {/* Active Child Card */}
                            {activeChild && (
                                <div className="bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl">
                                                {currentLevel?.icon || '🌱'}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black">{activeChild.first_name}</h3>
                                                <p className="text-white/70">{currentLevel?.name || 'Seedling'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Total XP</span>
                                                <span className="font-bold">{activeChild.total_xp.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Island</span>
                                                <span className="font-bold">{activeChild.primary_island || 'Jamaica'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Missions Done</span>
                                                <span className="font-bold">{activeChild.missions_completed || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Settings */}
                            <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-zinc-100">
                                <h4 className="text-2xl font-black text-deep mb-8 flex items-center gap-2">
                                    <Settings className="text-zinc-400" />
                                    Account Settings
                                </h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-6 border-b border-zinc-50">
                                        <span className="text-deep/40 font-black uppercase tracking-widest text-xs">Current Plan</span>
                                        <span className="text-secondary font-black bg-secondary/10 px-4 py-1.5 rounded-full text-sm capitalize">
                                            {user?.subscription_tier?.replace(/_/g, ' ') || 'Free'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-zinc-50">
                                        <span className="text-deep/40 font-black uppercase tracking-widest text-xs">Status</span>
                                        <span className={`font-black px-4 py-1.5 rounded-full text-sm capitalize ${isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user?.subscription_status || 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/account"
                                    className="w-full mt-10 p-6 border-2 border-zinc-100 text-deep rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-50 hover:border-primary transition-all block text-center"
                                >
                                    Manage Account
                                </Link>
                            </div>

                            {/* Upgrade CTA */}
                            {!isSubscribed && (
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-10 rounded-[3rem] text-white">
                                    <Sparkles size={28} className="mb-4" />
                                    <h4 className="text-xl font-black mb-3">Unlock Full Experience</h4>
                                    <p className="text-white/80 text-sm mb-6">
                                        Get unlimited stories, songs, and monthly physical mail boxes!
                                    </p>
                                    <Link
                                        href="/#pricing"
                                        className="block w-full py-4 bg-white text-purple-700 rounded-2xl font-black text-center hover:bg-white/90 transition-colors"
                                    >
                                        View Plans
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
