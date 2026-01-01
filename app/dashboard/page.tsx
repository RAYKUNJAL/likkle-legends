"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles, Calendar, Settings, Bell, MessageSquare, Users,
    BookOpen, Music, Trophy, Target, ChevronRight, Play, Star,
    TrendingUp, Gift, Share2, Flame, Award, Crown
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getRecentActivities, getMissions } from '@/lib/database';
import { getNotifications } from '@/lib/messaging';
import { calculateLevel, getNextLevel, getProgressToNextLevel, BADGES } from '@/lib/gamification';

interface Activity {
    id: string;
    activity_type: string;
    xp_earned: number;
    created_at: string;
    metadata: Record<string, unknown>;
}

interface Mission {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    mission_type: string;
    estimated_minutes: number;
}

interface Notification {
    id: string;
    title: string;
    body: string;
    notification_type: string;
    is_read: boolean;
    created_at: string;
}

export default function ParentDashboardPage() {
    const { user, children, activeChild, setActiveChild, isSubscribed, canAccess } = useUser();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activeChild) {
            loadDashboardData();
        }
    }, [activeChild]);

    const loadDashboardData = async () => {
        if (!activeChild || !user) return;

        setIsLoading(true);
        try {
            const [activitiesData, missionsData, notificationsData] = await Promise.all([
                getRecentActivities(activeChild.id, 10),
                getMissions(activeChild.age_track),
                getNotifications(user.id, 5),
            ]);

            setActivities(activitiesData as Activity[]);
            setMissions(missionsData as Mission[]);
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
                    <Link href="/login" className="text-primary font-bold">Sign In →</Link>
                </div>
            </div>
        );
    }

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : null;
    const nextLevel = activeChild ? getNextLevel(activeChild.total_xp) : null;
    const progressPercent = activeChild ? getProgressToNextLevel(activeChild.total_xp) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-2xl font-black text-primary">
                                Likkle Legends
                            </Link>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 font-medium">Parent Dashboard</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Notifications">
                                <Bell size={22} className="text-gray-600" />
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </button>

                            {/* Child Switcher */}
                            {children.length > 1 && (
                                <div className="relative">
                                    <select
                                        value={activeChild?.id || ''}
                                        onChange={(e) => setActiveChild(e.target.value)}
                                        className="appearance-none bg-gray-100 px-4 py-2 pr-8 rounded-xl font-medium cursor-pointer"
                                        aria-label="Select Child"
                                    >
                                        {children.map((child) => (
                                            <option key={child.id} value={child.id}>
                                                {child.first_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Settings */}
                            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Account Settings">
                                <Settings size={22} className="text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        Welcome back, {user.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Here's how {activeChild?.first_name || 'your little legend'} is doing this week.
                    </p>
                </div>

                {!activeChild ? (
                    /* No Children - Add Child Prompt */
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Add Your First Legend</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Create a profile for your child to start tracking their learning journey and unlock personalized content.
                        </p>
                        <Link
                            href="/onboarding/child"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            <Sparkles size={20} />
                            Add Child Profile
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {/* XP & Level */}
                            <div className="bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                                <Crown size={24} className="mb-2 opacity-80" />
                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Level</p>
                                <p className="text-2xl font-black">{currentLevel?.name}</p>
                                <div className="mt-2 bg-white/20 rounded-full h-2">
                                    <div
                                        className="bg-white rounded-full h-2 transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-white/60 mt-1">
                                    {nextLevel ? `${nextLevel.xpNeeded} XP to ${nextLevel.level.name}` : 'Max Level!'}
                                </p>
                            </div>

                            {/* Streak */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <Flame size={24} className="text-orange-500 mb-2" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Streak</p>
                                <p className="text-2xl font-black text-gray-900">{activeChild.current_streak} Days</p>
                                <p className="text-xs text-gray-400">Best: {activeChild.longest_streak} days</p>
                            </div>

                            {/* Stories */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <BookOpen size={24} className="text-blue-500 mb-2" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Stories</p>
                                <p className="text-2xl font-black text-gray-900">{activeChild.stories_completed}</p>
                                <p className="text-xs text-gray-400">Completed</p>
                            </div>

                            {/* Songs */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <Music size={24} className="text-purple-500 mb-2" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Songs</p>
                                <p className="text-2xl font-black text-gray-900">{activeChild.songs_listened}</p>
                                <p className="text-xs text-gray-400">Listened</p>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column - Activity Feed */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Weekly Missions */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                            <Target className="text-primary" size={24} />
                                            Weekly Missions
                                        </h2>
                                        <Link href="/portal/missions" className="text-primary font-bold text-sm hover:underline">
                                            View All →
                                        </Link>
                                    </div>

                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : missions.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">No active missions this week</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {missions.slice(0, 3).map((mission) => (
                                                <div
                                                    key={mission.id}
                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                                                >
                                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                                        <Target className="text-primary" size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900">{mission.title}</h4>
                                                        <p className="text-sm text-gray-500 truncate">{mission.description}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="font-bold text-primary">+{mission.xp_reward} XP</p>
                                                        <p className="text-xs text-gray-400">{mission.estimated_minutes} min</p>
                                                    </div>
                                                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6">
                                        <TrendingUp className="text-green-500" size={24} />
                                        Recent Activity
                                    </h2>

                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : activities.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">No recent activity yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {activities.map((activity) => (
                                                <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <Star className="text-green-600" size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 capitalize">
                                                            {activity.activity_type.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(activity.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {activity.xp_earned > 0 && (
                                                        <span className="font-bold text-green-600">+{activity.xp_earned} XP</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cultural Progress */}
                                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-6">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
                                        🌴 Cultural Journey
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/60 backdrop-blur rounded-xl p-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Patois Words</p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {activeChild.patois_words_learned?.length || 0}
                                            </p>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur rounded-xl p-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Milestones</p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {activeChild.cultural_milestones?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Child Card */}
                                <div className="bg-deep text-white rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                                                {currentLevel?.icon || '🌱'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black">{activeChild.first_name}</h3>
                                                <p className="text-white/60 text-sm capitalize">{activeChild.age_track} Legend • Age {activeChild.age}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/60">Total XP</span>
                                                <span className="font-bold">{activeChild.total_xp.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/60">Island</span>
                                                <span className="font-bold">{activeChild.primary_island}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/60">Badges</span>
                                                <span className="font-bold">{activeChild.earned_badges?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="text-amber-500" size={20} />
                                        Recent Badges
                                    </h3>

                                    {activeChild.earned_badges && activeChild.earned_badges.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {activeChild.earned_badges.slice(0, 6).map((badgeId) => {
                                                const badge = BADGES[badgeId as keyof typeof BADGES];
                                                if (!badge) return null;
                                                return (
                                                    <div
                                                        key={badgeId}
                                                        className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl"
                                                        title={badge.name}
                                                    >
                                                        {badge.icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No badges earned yet</p>
                                    )}

                                    <Link href="/portal/badges" className="block mt-4 text-center text-primary font-bold text-sm hover:underline">
                                        View All Badges →
                                    </Link>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="font-black text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Link
                                            href="/portal"
                                            className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
                                        >
                                            <Play className="text-primary" size={20} />
                                            <span className="font-medium">Open Child Portal</span>
                                        </Link>
                                        <Link
                                            href="/portal/stories"
                                            className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                        >
                                            <BookOpen className="text-blue-600" size={20} />
                                            <span className="font-medium">Read a Story</span>
                                        </Link>
                                        <Link
                                            href="/portal/songs"
                                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                                        >
                                            <Music className="text-purple-600" size={20} />
                                            <span className="font-medium">Play Songs</span>
                                        </Link>
                                        <button
                                            className="w-full flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                                        >
                                            <Share2 className="text-amber-600" size={20} />
                                            <span className="font-medium">Share Progress</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Next Box */}
                                {isSubscribed && (
                                    <div className="bg-gradient-to-br from-secondary to-primary rounded-3xl p-6 text-white">
                                        <h3 className="font-black mb-3 flex items-center gap-2">
                                            <Gift size={20} />
                                            Next Mail Box
                                        </h3>
                                        <div className="bg-white/10 rounded-xl p-4 mb-3">
                                            <p className="text-xs text-white/60 uppercase tracking-wider">Theme</p>
                                            <p className="font-bold text-lg">Carnival Colors 🎭</p>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Shipping</span>
                                            <span className="font-bold">In 5 Days</span>
                                        </div>
                                    </div>
                                )}

                                {/* Upgrade Banner */}
                                {!canAccess('legends_plus') && (
                                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white">
                                        <Sparkles size={24} className="mb-3" />
                                        <h3 className="font-black text-lg mb-2">Unlock More Features</h3>
                                        <p className="text-white/80 text-sm mb-4">
                                            Get AI Reading Buddy, unlimited stories, and parent co-pilot with Legends Plus.
                                        </p>
                                        <Link
                                            href="/#pricing"
                                            className="block w-full py-3 bg-white text-purple-600 rounded-xl text-center font-bold hover:bg-white/90 transition-colors"
                                        >
                                            Upgrade Now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
