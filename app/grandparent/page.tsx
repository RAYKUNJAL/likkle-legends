"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart, MessageSquare, Video, Camera, Bell, Star, BookOpen, Music, TrendingUp, ChevronRight, Loader2, Sparkles
} from 'lucide-react';


interface GrandparentViewData {
    id: string;
    first_name: string;
    age: number;
    parent_id: string;
    avatar_url: string;
    primary_island: string;
    total_xp: number;
    current_streak: number;
    stories_completed: number;
    songs_listened: number;
    earned_badges: any[];
}

export default function GrandparentDashboardPage() {
    const [child, setChild] = useState<GrandparentViewData | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'progress' | 'messages' | 'gallery'>('progress');
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        // In a real scenario, we'd get the childId from the access code verification
        // For this launch fix, we'll look for a 'childId' in URL params as a fallback
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('childId');

        if (childId) {
            loadRealData(childId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadRealData = async (childId: string) => {
        setIsLoading(true);
        try {
            // Dynamically import to ensure server-side action is used
            const { getGrandparentDashData } = await import('@/app/actions/grandparent');

            const result = await getGrandparentDashData(childId);

            if (result.success && result.child) {
                setChild(result.child);
                setActivities(result.activities);
                setMessages(result.messages);
            } else {
                console.error('Failed to load dashboard:', result.error);
                // Redirect to access page if child invalid
                // window.location.href = '/grandparent/access';
            }
        } catch (error) {
            console.error('Failed to load grandparent view:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !child) return;

        try {
            const { sendMessageAsGrandparent } = await import('@/app/actions/grandparent');

            const result = await sendMessageAsGrandparent(child.id, child.parent_id, messageInput);

            if (result.success && result.message) {
                setMessages(prev => [...prev, result.message]);
                setMessageInput('');
            } else {
                alert(result.error || 'Failed to send message');
            }
        } catch (error) {
            alert('Failed to send message');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!child) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white rounded-[3rem] p-12 text-center max-w-md shadow-2xl border border-orange-100">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔑</div>
                    <h2 className="text-3xl font-black text-deep mb-4">Access Required</h2>
                    <p className="text-deep/60 mb-8">Please enter your unique access code from the parents to view your grandchild's progress.</p>
                    <Link href="/grandparent/access" className="btn btn-primary w-full py-4 text-lg">
                        Enter Access Code
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-deep text-white shadow-xl">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black">Grandparent Portal</h1>
                            <p className="text-white/60">Stay connected with {child.first_name}'s learning journey</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10" aria-label="Notifications">
                                <Bell size={24} />
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20">
                                <Video size={20} />
                                Video Call
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Child Hero Card */}
            <div className="max-w-6xl mx-auto px-4 -mt-6">
                <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-6xl shadow-inner">
                            {child.avatar_url ? (
                                <img src={child.avatar_url} alt="" className="w-full h-full object-cover rounded-[2rem]" />
                            ) : '🐢'}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-black mb-1">{child.first_name}</h2>
                            <p className="text-white/80 text-lg uppercase tracking-widest font-bold">
                                Age {child.age} • {child.primary_island}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-sm font-bold">
                                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-300" /> Legend Grade
                                </span>
                                <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                    🔥 {child.current_streak} Day Streak
                                </span>
                            </div>
                        </div>
                        <div className="text-center md:text-right bg-black/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                            <p className="text-6xl font-black leading-tight">{(child.total_xp || 0).toLocaleString()}</p>
                            <p className="text-white/60 text-sm font-black uppercase tracking-widest">Total XP Earned</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-12">
                <div className="flex gap-4 p-2 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white shadow-lg inline-flex">
                    {[
                        { id: 'progress', label: 'Progress', icon: TrendingUp },
                        { id: 'messages', label: 'Messages', icon: MessageSquare },
                        { id: 'gallery', label: 'Art Gallery', icon: Camera },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id
                                ? 'bg-deep text-white shadow-xl scale-105'
                                : 'text-deep/40 hover:text-deep/60 hover:bg-white/50'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                {activeTab === 'progress' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Stats Cards */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-xl border border-zinc-50 hover:shadow-2xl transition-shadow group">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <BookOpen size={32} />
                                    </div>
                                    <p className="text-4xl font-black text-deep">{child.stories_completed || 0}</p>
                                    <p className="text-deep/40 font-bold text-xs uppercase tracking-widest">Stories Read</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-xl border border-zinc-50 hover:shadow-2xl transition-shadow group">
                                    <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Music size={32} />
                                    </div>
                                    <p className="text-4xl font-black text-deep">{child.songs_listened || 0}</p>
                                    <p className="text-deep/40 font-bold text-xs uppercase tracking-widest">Songs Heard</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-xl border border-zinc-50 hover:shadow-2xl transition-shadow group">
                                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Star size={32} />
                                    </div>
                                    <p className="text-4xl font-black text-deep">{child.earned_badges?.length || 0}</p>
                                    <p className="text-deep/40 font-bold text-xs uppercase tracking-widest">Badges Earned</p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-zinc-50">
                                <h3 className="text-2xl font-black text-deep mb-8 flex items-center gap-3">
                                    <TrendingUp className="text-primary" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {activities.length > 0 ? activities.map((activity, i) => (
                                        <div key={i} className="flex items-center gap-6 p-6 bg-zinc-50 rounded-[2rem] hover:bg-zinc-100 transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform font-bold text-xl">
                                                {activity.activity_type === 'story' ? '📚' : activity.activity_type === 'song' ? '🎵' : '🎯'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-deep text-lg">{activity.metadata?.title || activity.activity_type}</p>
                                                <p className="text-deep/40 font-bold text-sm uppercase tracking-tighter">
                                                    {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="text-primary font-black">+{activity.xp_earned} XP</div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 text-deep/40 font-bold">No activity recorded yet</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-zinc-50">
                                <h3 className="text-2xl font-black text-deep mb-8">Recent Badges</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {child.earned_badges?.slice(0, 4).map((badge: any, i: number) => (
                                        <div key={i} className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                                            <span className="text-4xl block mb-2">{badge.icon || '🏅'}</span>
                                            <span className="text-xs font-black text-amber-800 uppercase tracking-tight line-clamp-1">{badge.name}</span>
                                        </div>
                                    ))}
                                    {(!child.earned_badges || child.earned_badges.length === 0) && (
                                        <div className="col-span-2 py-8 text-center text-deep/20">
                                            <Star size={40} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-bold">First badge coming soon!</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 p-8 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] text-white text-center shadow-lg relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Heart className="mx-auto mb-4 animate-bounce" size={40} />
                                    <p className="text-lg font-black mb-4 leading-tight">
                                        Send a sticker of encouragement!
                                    </p>
                                    <button className="w-full py-4 bg-white text-primary rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
                                        Send Sticker
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-zinc-50 overflow-hidden">
                            {/* Message List */}
                            <div className="h-[500px] overflow-y-auto p-8 space-y-6 bg-zinc-50/50">
                                {messages.length > 0 ? messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender_id === child.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-6 rounded-[2rem] shadow-sm ${msg.sender_id === child.id
                                            ? 'bg-deep text-white rounded-br-none'
                                            : 'bg-white text-deep rounded-bl-none border border-zinc-100'
                                            }`}>
                                            <p className="font-bold leading-relaxed">{msg.content}</p>
                                            <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${msg.sender_id === child.id ? 'text-white/40' : 'text-deep/30'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                                        <MessageSquare size={64} className="mb-4" />
                                        <p className="text-xl font-black">Start a conversation with {child.first_name}'s parents!</p>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-8 bg-white border-t border-zinc-100">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder={`Message ${child.first_name}'s parents...`}
                                        className="flex-1 px-8 py-5 bg-zinc-100 rounded-[2rem] font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border-none"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                                    >
                                        Send <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="bg-white rounded-[4rem] p-24 shadow-2xl border border-zinc-50 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <Sparkles className="text-amber-500 mx-auto mb-8 animate-pulse" size={100} />
                            <h3 className="text-5xl font-black text-deep mb-6 tracking-tighter">Island Art Gallery</h3>
                            <p className="text-xl text-deep/40 max-w-xl mx-auto leading-relaxed font-medium">
                                Soon, you'll be able to see every digital painting and island creation {child.first_name || 'your grandchild'} brings to life!
                            </p>
                            <div className="mt-12 flex flex-wrap justify-center gap-4">
                                <span className="px-6 py-3 bg-zinc-100 rounded-2xl text-[10px] font-black text-deep/30 uppercase tracking-widest border border-zinc-200">🎨 Digital Coloring</span>
                                <span className="px-6 py-3 bg-zinc-100 rounded-2xl text-[10px] font-black text-deep/30 uppercase tracking-widest border border-zinc-200">✨ Magic Creations</span>
                                <span className="px-6 py-3 bg-zinc-100 rounded-2xl text-[10px] font-black text-deep/30 uppercase tracking-widest border border-zinc-200">📸 AR Moments</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
