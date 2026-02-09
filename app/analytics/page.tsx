"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, TrendingUp, Book, Music, Trophy, Clock,
    Calendar, ChevronDown, Download, Share2, Star, Flame,
    Target, Award, BarChart, LineChart, PieChart
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { LEVELS, calculateLevel } from '@/lib/gamification';

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface ProgressData {
    date: string;
    xp: number;
    stories: number;
    songs: number;
    missions: number;
}

export default function AnalyticsPage() {
    const { activeChild, children, setActiveChild } = useUser();
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [showChildSelector, setShowChildSelector] = useState(false);

    const [progressData, setProgressData] = useState<ProgressData[]>([]);
    const [recentAchievements, setRecentAchievements] = useState<any[]>([]);

    useEffect(() => {
        if (!activeChild) return;

        async function loadAnalytics() {
            try {
                const { getRecentActivities, getEarnedBadges } = await import('@/lib/database');

                // Fetch activities
                const activities = await getRecentActivities(activeChild!.id, 100);

                // Process into last 7 days chart data
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    days.push(d.toISOString().split('T')[0]);
                }

                const chartData = days.map(date => {
                    const dayActivities = activities.filter((a: any) =>
                        a.created_at.startsWith(date)
                    );

                    return {
                        date,
                        xp: dayActivities.reduce((sum: number, a: any) => sum + (a.xp_earned || 0), 0),
                        stories: dayActivities.filter((a: any) => a.activity_type === 'story_read').length,
                        songs: dayActivities.filter((a: any) => a.activity_type === 'song_listened').length,
                        missions: dayActivities.filter((a: any) => a.activity_type === 'mission_completed').length,
                    };
                });

                setProgressData(chartData);

                // Fetch badges
                const badges = await getEarnedBadges(activeChild!.id);
                setRecentAchievements(badges.map((b: any) => ({
                    id: b.id,
                    title: 'Badge Earned', // Ideally join with badge details
                    description: 'You earned a new badge!',
                    icon: '🏆',
                    unlocked: true,
                    progress: 100,
                    target: 100
                })));

            } catch (error) {
                console.error('Failed to load analytics:', error);
            }
        }

        loadAnalytics();
    }, [activeChild]);

    const child = activeChild || {
        first_name: 'Guest',
        total_xp: 0,
        current_streak: 0,
        stories_completed: 0,
        songs_listened: 0,
        missions_completed: 0
    };

    const level = calculateLevel(child.total_xp || 0);
    const nextLevel = LEVELS.find(l => l.minXP > (child.total_xp || 0));
    const xpToNext = nextLevel ? nextLevel.minXP - (child.total_xp || 0) : 0;
    const levelProgress = nextLevel
        ? ((child.total_xp || 0) - level.minXP) / (nextLevel.minXP - level.minXP) * 100
        : 100;

    const totalXPThisPeriod = progressData.reduce((sum, d) => sum + d.xp, 0);
    const avgDailyXP = progressData.length > 0 ? Math.round(totalXPThisPeriod / progressData.length) : 0;
    const maxXPDay = progressData.reduce((max, d) => d.xp > max.xp ? d : max, progressData[0] || { xp: 0 });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Back to dashboard">
                                <ArrowLeft size={24} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900">Progress Analytics</h1>
                                <p className="text-gray-500 text-sm">Track {child.first_name}'s learning journey</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Child Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowChildSelector(!showChildSelector)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {child.first_name?.charAt(0)}
                                    </div>
                                    <span className="font-medium">{child.first_name}</span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Time Range */}
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                className="px-4 py-2 bg-gray-100 rounded-xl border-0 font-medium"
                                aria-label="Time range"
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="all">All time</option>
                            </select>

                            {/* Actions */}
                            <button
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                                aria-label="Download report"
                            >
                                <Download size={20} />
                            </button>
                            <button
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                                aria-label="Share report"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Level Progress */}
                <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-8 text-white mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-white/70 text-sm mb-1">Current Level</p>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{level.icon}</span>
                                <div>
                                    <h2 className="text-2xl font-black">{level.name}</h2>
                                    <p className="text-white/70 text-sm">Level {level.level}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black">{(child.total_xp || 1250).toLocaleString()}</p>
                            <p className="text-white/70">Total XP Earned</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Progress to {nextLevel?.name || 'Max Level'}</span>
                            <span>{xpToNext > 0 ? `${xpToNext} XP to go` : 'Max level reached!'}</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Star, label: 'XP This Week', value: totalXPThisPeriod, color: 'amber', trend: '+15%' },
                        { icon: Book, label: 'Stories Read', value: child.stories_completed || 15, color: 'blue', trend: '+3' },
                        { icon: Music, label: 'Songs Listened', value: child.songs_listened || 28, color: 'purple', trend: '+5' },
                        { icon: Flame, label: 'Day Streak', value: child.current_streak || 5, color: 'orange', trend: 'Best: 12' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Activity Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Daily Activity</h3>
                            <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary rounded-full" /> XP Earned
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-accent rounded-full" /> Activities
                                </span>
                            </div>
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="flex items-end justify-between h-48 gap-2 px-4">
                            {progressData.map((day, i) => {
                                const maxXP = Math.max(...progressData.map(d => d.xp), 100);
                                const height = (day.xp / maxXP) * 100;
                                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-gray-900">{day.xp}</span>
                                            <div
                                                className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all hover:opacity-80"
                                                style={{ height: `${height}%`, minHeight: '20px' }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{dayName}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-black text-gray-900">{totalXPThisPeriod}</p>
                                <p className="text-xs text-gray-500">Total XP</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{avgDailyXP}</p>
                                <p className="text-xs text-gray-500">Avg Daily XP</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{maxXPDay.xp}</p>
                                <p className="text-xs text-gray-500">Best Day</p>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Achievements</h3>

                        <div className="space-y-3">
                            {recentAchievements.slice(0, 5).map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-3 rounded-xl border ${achievement.unlocked
                                        ? 'bg-green-50 border-green-200'
                                        : 'border-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-bold text-sm ${achievement.unlocked ? 'text-green-700' : 'text-gray-900'}`}>
                                                    {achievement.title}
                                                </h4>
                                                {achievement.unlocked && <Trophy size={14} className="text-green-600" />}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
                                        </div>
                                    </div>

                                    {!achievement.unlocked && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>{achievement.progress}/{achievement.target}</span>
                                                <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/portal/badges"
                            className="mt-4 block text-center text-primary font-medium text-sm hover:underline"
                        >
                            View All Achievements →
                        </Link>
                    </div>
                </div>

                {/* Content Breakdown */}
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Stories', icon: Book, items: [
                                { name: 'Completed', value: 15, color: 'bg-blue-500' },
                                { name: 'In Progress', value: 3, color: 'bg-blue-300' },
                                { name: 'Not Started', value: 12, color: 'bg-gray-200' },
                            ]
                        },
                        {
                            title: 'Islands Explored', icon: Target, items: [
                                { name: 'Jamaica', value: 8, color: 'bg-green-500' },
                                { name: 'Trinidad', value: 5, color: 'bg-yellow-500' },
                                { name: 'Barbados', value: 3, color: 'bg-pink-500' },
                            ]
                        },
                        {
                            title: 'Skills Developed', icon: Award, items: [
                                { name: 'Language', value: 65, color: 'bg-purple-500' },
                                { name: 'Culture', value: 45, color: 'bg-orange-500' },
                                { name: 'Music', value: 80, color: 'bg-cyan-500' },
                            ]
                        },
                    ].map((section) => (
                        <div key={section.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <section.icon size={20} className="text-gray-400" />
                                <h3 className="font-bold text-gray-900">{section.title}</h3>
                            </div>

                            <div className="space-y-3">
                                {section.items.map((item) => (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">{item.name}</span>
                                            <span className="font-bold">{item.value}{section.title === 'Skills Developed' ? '%' : ''}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color}`}
                                                style={{ width: section.title === 'Skills Developed' ? `${item.value}%` : `${(item.value / 15) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
