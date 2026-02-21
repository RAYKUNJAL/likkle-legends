"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Settings, BarChart, Users, Sparkles, Plus, ArrowRight,
    Edit, BookOpen, Music, Trophy, Flame, Target, TrendingUp,
    ChevronRight, Star, Calendar, MapPin, Gift, Download, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/components/UserContext';
import { calculateLevel, LEVELS } from '@/lib/gamification';
import { getRecentActivities, getMissions, logActivity } from '@/lib/database';
import TantyRadio from '@/components/TantyRadio';
import Image from 'next/image';
import ContentReviewFeed from '@/components/island-brain/ContentReviewFeed';
import ReferralWidget from '@/components/dashboard/ReferralWidget';
import { AssessmentDashboard } from '@/components/portal/AssessmentDashboard';
import { LibraryDashboard } from '@/components/dashboard/LibraryDashboard';

export default function ParentDashboard() {
    const { user, children, activeChild, isLoading, isSubscribed } = useUser();
    const [activities, setActivities] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'library'>('overview');
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        if (activeChild) {
            loadDashboardData();
        }
    }, [activeChild?.id]);

    const loadDashboardData = async () => {
        if (!activeChild || !user) return;
        setIsDataLoading(true);
        try {
            const [activitiesData, missionsData] = await Promise.all([
                getRecentActivities(activeChild.id, 8),
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

    if (!isLoading && !user) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <Navbar />
                <main className="container pt-32 pb-24 text-center">
                    <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border-8 border-white">
                        <ShieldCheck size={64} className="text-primary mx-auto mb-6" />
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Security Area</h1>
                        <p className="text-slate-500 font-bold mb-10">Please sign in to access the Parent Command Center.</p>
                        <Link
                            href="/login?redirect=/parent"
                            className="block w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
                        >
                            Sign In
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // 2. Logged In but No Children -> Show Onboarding Prompt
    if (!isLoading && user && children.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <Navbar />
                <main className="container pt-32 pb-24 text-center">
                    <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border-8 border-white">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus size={48} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Welcome to the Village!</h1>
                        <p className="text-slate-500 font-bold mb-10 text-lg">
                            To create your personalized parent dashboard, let's set up your first Likkle Legend.
                        </p>
                        <Link
                            href="/onboarding/child"
                            className="inline-flex items-center gap-2 px-8 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
                        >
                            Add Your Child <ArrowRight />
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : LEVELS[0];

    return (
        <div className="bg-[#F8FAFC] min-h-screen selection:bg-primary selection:text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-36 pb-32">
                {/* Dashboard Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className="w-10 h-[2px] bg-primary"></span>
                            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Command Center</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]"
                        >
                            Parent <br /><span className="text-primary">Dashboard.</span>
                        </motion.h1>
                    </div>

                    <div className="flex bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-100 shadow-slate-200/50">
                        {children.map((child) => (
                            <button
                                key={child.id}
                                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeChild?.id === child.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {child.first_name}
                            </button>
                        ))}
                        <Link href="/onboarding/child" className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-colors">
                            <Plus size={20} />
                        </Link>
                    </div>
                </header>

                {/* Tab Selection */}
                <div className="flex gap-8 mb-12 border-b-2 border-slate-100">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-6 text-xl font-black transition-all relative ${activeTab === 'overview' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Overview
                        {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('assessment')}
                        className={`pb-6 text-xl font-black transition-all relative ${activeTab === 'assessment' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Assessment
                        {activeTab === 'assessment' && <motion.div layoutId="activeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`pb-6 text-xl font-black transition-all relative ${activeTab === 'library' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        My Library
                        {activeTab === 'library' && <motion.div layoutId="activeTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-primary" />}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Top Row: Core Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between border-4 border-white"
                                >
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-inner">
                                        <BookOpen size={32} />
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{activeChild?.stories_completed || 0}</p>
                                        <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Stories Read</h4>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between border-4 border-white"
                                >
                                    <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-inner">
                                        <Music size={32} />
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{activeChild?.songs_listened || 0}</p>
                                        <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Songs Listened</h4>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="w-16 h-16 bg-white/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-10 shadow-inner border border-white/10">
                                        <Star size={32} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-white tracking-tighter mb-2">{activeChild?.total_xp.toLocaleString()}</p>
                                        <h4 className="text-white/40 font-black uppercase tracking-widest text-[10px]">Total Legend XP</h4>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-gradient-to-br from-primary to-accent p-10 rounded-[3rem] shadow-2xl shadow-primary/30 text-white flex flex-col justify-between"
                                >
                                    <div className="w-16 h-16 bg-white/20 text-white rounded-[1.5rem] flex items-center justify-center mb-10 shadow-inner border border-white/20 animate-pulse">
                                        <Flame size={32} />
                                    </div>
                                    <div>
                                        <p className="text-6xl font-black text-white tracking-tighter mb-2">{activeChild?.current_streak || 0}</p>
                                        <h4 className="text-white/60 font-black uppercase tracking-widest text-[10px]">Day Learning Streak</h4>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Progress & Activity */}
                                <div className="lg:col-span-2 space-y-12">
                                    {/* Cultural Milestone Tracker */}
                                    <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Cultural Milestones</h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Heritage Journey Tracking</p>
                                            </div>
                                            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                                <p className="text-slate-900 font-black text-xl">{activeChild?.cultural_milestones?.length || 0}/12</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
                                            {[...Array(12)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`aspect-square rounded-[2rem] flex items-center justify-center text-3xl shadow-inner transition-all ${i < (activeChild?.cultural_milestones?.length || 0) ? 'bg-primary/10 text-primary scale-100' : 'bg-slate-50 text-slate-200 opacity-50'}`}
                                                    title={`Milestone ${i + 1}`}
                                                >
                                                    <Trophy size={24} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity Feed */}
                                    <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Recent Activity</h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Live Learning Feed</p>
                                            </div>
                                            <button
                                                className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <Calendar size={24} />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {activities.length === 0 ? (
                                                <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[3rem]">
                                                    <TrendingUp size={48} className="text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No activity logged yet</p>
                                                </div>
                                            ) : (
                                                activities.slice(0, 5).map((activity, idx) => (
                                                    <motion.div
                                                        key={activity.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="flex items-center gap-6 p-6 rounded-[2.5rem] hover:bg-slate-50 transition-colors group cursor-default"
                                                    >
                                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg text-2xl group-hover:scale-110 transition-transform">
                                                            {activity.activity_type === 'story' ? '📖' : activity.activity_type === 'song' ? '🎵' : '🎯'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-xl font-black text-slate-900 capitalize tracking-tight leading-tight">
                                                                Completed {activity.activity_type}
                                                            </h4>
                                                            <p className="text-slate-400 font-medium text-sm">
                                                                {new Date(activity.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full font-black text-sm">
                                                                <Sparkles size={14} /> +{activity.xp_earned} XP
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Mini Cards & Account */}
                                <div className="space-y-12">
                                    <ContentReviewFeed />
                                    {activeChild && (
                                        <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-white overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                                            <div className="relative z-10 text-center">
                                                <div className="w-24 h-24 bg-slate-900 text-white rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl mb-6">
                                                    {activeChild.first_name?.charAt(0)}
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{activeChild.first_name}</h3>
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">{currentLevel.name}</p>
                                                <Link href={`/account/children/${activeChild.id}`} className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors">
                                                    <Edit size={14} /> Edit Legend Profile
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    <ReferralWidget />
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden">
                                        <Gift className="w-12 h-12 text-indigo-300 mb-8" />
                                        <h3 className="text-3xl font-black tracking-tighter mb-4 leading-tight">Unlock Premium Music.</h3>
                                        <p className="text-indigo-100/60 font-medium mb-8">Get exclusive tracks or order a custom song for your Legend.</p>
                                        <Link href="/portal/music" className="block w-full py-5 bg-white text-indigo-700 rounded-2xl font-black text-center shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest">
                                            Visit Music Hub
                                        </Link>
                                    </div>
                                    <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                                            <Star size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Heritage Radio</h3>
                                        <p className="text-slate-400 text-sm mb-6">Streaming Caribbean culture 24/7.</p>
                                        <Link href="/portal?sec=radio" className="text-primary font-black uppercase tracking-widest text-xs hover:underline">
                                            Open Player
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'assessment' ? (
                        <motion.div
                            key="assessment"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Literacy Assessment</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Detailed Learning Analytics</p>
                                </div>
                                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full font-black text-sm">
                                    <TrendingUp size={20} /> On track for age group
                                </div>
                            </div>

                            <AssessmentDashboard data={{
                                storiesRead: activeChild?.stories_completed || 0,
                                phonicsMastered: ['s', 'a', 't', 'p', 'i', 'n'],
                                patoisWords: activeChild?.patois_words_learned || [],
                                averageScore: 0.85,
                                totalXP: activeChild?.total_xp || 0,
                                streak: activeChild?.current_streak || 0,
                                recentImprovement: 15
                            }} />

                            <div className="mt-16 bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-md">
                                    <h3 className="text-3xl font-black mb-4 tracking-tight">Download Progress Report</h3>
                                    <p className="text-white/60 font-bold leading-relaxed mb-8">
                                        Get a detailed PDF report of your child's phonics mastery and cultural learnings to share with teachers.
                                    </p>
                                    <button
                                        onClick={() => {
                                            const originalText = document.getElementById('pdf-btn-text');
                                            if (originalText) originalText.innerText = "Generating...";
                                            setTimeout(() => {
                                                window.print();
                                                if (originalText) originalText.innerText = "Generate PDF";
                                            }, 1000);
                                        }}
                                        className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                    >
                                        <Download size={24} /> <span id="pdf-btn-text">Generate PDF</span>
                                    </button>
                                </div>
                                <div className="w-64 h-64 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group overflow-hidden relative">
                                    <BookOpen size={120} className="text-white/10 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="library"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Library</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Personal Caribbean Collection</p>
                                </div>
                            </div>

                            <LibraryDashboard user={user} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
