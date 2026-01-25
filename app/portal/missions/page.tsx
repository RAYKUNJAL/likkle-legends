"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Flame, Trophy, Star, Gift, CheckCircle, Clock,
    Target, Sparkles, Lock, ChevronRight, Zap, Medal
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { XP_ACTIONS, LEVELS, calculateLevel } from '@/lib/gamification';

interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    reward_xp: number;
    progress: number;
    target: number;
    icon: string;
    completed: boolean;
    expires_at?: string;
    tier_required?: string;
}

export default function MissionsPage() {
    const { activeChild, canAccess } = useUser();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');

    useEffect(() => {
        async function loadMissions() {
            try {
                const { getMissions } = await import('@/lib/database');
                // Pass age track from active child if available, or 'mini' default
                const data = await getMissions(activeChild?.age_track || 'mini');

                // Map to Mission interface
                const mappedMissions: Mission[] = data.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    type: m.mission_type || 'daily',
                    reward_xp: m.reward_xp || 50,
                    progress: 0, // Need to fetch user progress separately
                    target: m.completion_target || 1,
                    icon: m.icon || '🎯',
                    completed: false, // Calculate from user progress
                    expires_at: m.end_date,
                    tier_required: 'free'
                }));

                setMissions(mappedMissions);
            } catch (error) {
                console.error('Failed to load missions:', error);
            }
        }

        loadMissions();
    }, [activeChild]);


    const totalXP = activeChild?.total_xp || 850;
    const streak = activeChild?.current_streak || 5;
    const level = calculateLevel(totalXP);

    const dailyMissions = missions.filter(m => m.type === 'daily');
    const weeklyMissions = missions.filter(m => m.type === 'weekly');
    const specialMissions = missions.filter(m => m.type === 'special');

    const completedDaily = dailyMissions.filter(m => m.completed).length;
    const totalDaily = dailyMissions.length;

    const claimReward = (missionId: string) => {
        setMissions(prev => prev.map(m =>
            m.id === missionId ? { ...m, completed: true, progress: m.target } : m
        ));
    };

    const getTimeRemaining = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/portal" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">Daily Missions</h1>
                            <p className="text-white/70 text-sm">Complete challenges to earn XP</p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Flame className="text-orange-300" size={20} />
                                <span className="text-2xl font-black">{streak}</span>
                            </div>
                            <p className="text-xs text-white/70">Day Streak</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Star className="text-yellow-300" size={20} />
                                <span className="text-2xl font-black">{totalXP.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-white/70">Total XP</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Trophy className="text-amber-300" size={20} />
                                <span className="text-2xl font-black">{level.icon}</span>
                            </div>
                            <p className="text-xs text-white/70">{level.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Daily Progress */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">Today's Progress</h2>
                        <span className="text-sm text-gray-500">{completedDaily}/{totalDaily} completed</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${(completedDaily / totalDaily) * 100}%` }}
                        />
                    </div>
                    {completedDaily === totalDaily && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-green-800">All Daily Missions Complete! 🎉</p>
                                <p className="text-sm text-green-600">Come back tomorrow for new challenges</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-6">
                <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5 inline-flex">
                    {[
                        { id: 'daily', label: 'Daily', icon: Target, count: dailyMissions.length },
                        { id: 'weekly', label: 'Weekly', icon: Flame, count: weeklyMissions.length },
                        { id: 'special', label: 'Special', icon: Sparkles, count: specialMissions.length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-200'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Missions List */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="space-y-4">
                    {(activeTab === 'daily' ? dailyMissions :
                        activeTab === 'weekly' ? weeklyMissions :
                            specialMissions
                    ).map((mission) => {
                        const isLocked = mission.tier_required && !canAccess(mission.tier_required);
                        const progressPercent = (mission.progress / mission.target) * 100;

                        return (
                            <div
                                key={mission.id}
                                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${mission.completed
                                    ? 'border-green-200 bg-green-50/50'
                                    : isLocked
                                        ? 'border-gray-200 opacity-60'
                                        : 'border-gray-100 hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${mission.completed
                                        ? 'bg-green-100'
                                        : isLocked
                                            ? 'bg-gray-100'
                                            : 'bg-gradient-to-br from-primary/10 to-accent/10'
                                        }`}>
                                        {isLocked ? <Lock size={24} className="text-gray-400" /> : mission.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className={`font-bold ${mission.completed ? 'text-green-700' : 'text-gray-900'}`}>
                                                    {mission.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">{mission.description}</p>
                                            </div>

                                            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                                                <Zap size={14} />
                                                <span className="font-bold text-sm">+{mission.reward_xp} XP</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-500">
                                                    {mission.progress}/{mission.target} {mission.completed ? '✓' : ''}
                                                </span>
                                                {mission.expires_at && !mission.completed && (
                                                    <span className="flex items-center gap-1 text-orange-500">
                                                        <Clock size={12} /> {getTimeRemaining(mission.expires_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${mission.completed
                                                        ? 'bg-green-500'
                                                        : 'bg-gradient-to-r from-primary to-accent'
                                                        }`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {mission.progress >= mission.target && !mission.completed && !isLocked && (
                                            <button
                                                onClick={() => claimReward(mission.id)}
                                                className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                            >
                                                <Gift size={18} /> Claim Reward
                                            </button>
                                        )}

                                        {isLocked && (
                                            <Link
                                                href="/checkout?plan=legends_plus"
                                                className="mt-4 w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                            >
                                                <Lock size={18} /> Upgrade to Unlock
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Streak Bonus Banner */}
            {streak >= 7 && (
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Medal size={24} />
                            </div>
                            <div>
                                <p className="font-bold">🔥 Week Streak Bonus Active!</p>
                                <p className="text-sm text-white/80">Earning 2x XP on all missions</p>
                            </div>
                        </div>
                        <div className="text-3xl font-black">{streak} Days</div>
                    </div>
                </div>
            )}
        </div>
    );
}
