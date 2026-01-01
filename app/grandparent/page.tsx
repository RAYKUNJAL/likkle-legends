"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Heart, MessageSquare, Video, Camera, Calendar, Gift,
    Bell, Star, BookOpen, Music, TrendingUp, Play, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/storage';
import { getConversation, sendMessage } from '@/lib/messaging';
import { calculateLevel, BADGES } from '@/lib/gamification';

interface GrandparentViewData {
    childName: string;
    childAge: number;
    parentName: string;
    avatarEmoji: string;
    island: string;
    level: { name: string; icon: string };
    totalXP: number;
    currentStreak: number;
    storiesCompleted: number;
    songsListened: number;
    recentBadges: { name: string; icon: string }[];
    recentActivities: { type: string; title: string; date: string }[];
}

export default function GrandparentDashboardPage() {
    const [data, setData] = useState<GrandparentViewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'progress' | 'messages' | 'gallery'>('progress');
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'parent' | 'grandparent'; text: string; time: string }[]>([]);

    useEffect(() => {
        // In production, verify access code and load real data
        loadMockData();
    }, []);

    const loadMockData = () => {
        // Mock data - replace with real Supabase queries
        setData({
            childName: 'Marcus',
            childAge: 6,
            parentName: 'Sarah',
            avatarEmoji: '🐢',
            island: 'Jamaica',
            level: { name: 'Story Seeker', icon: '📚' },
            totalXP: 1250,
            currentStreak: 7,
            storiesCompleted: 15,
            songsListened: 42,
            recentBadges: [
                { name: 'Week Warrior', icon: '🔥' },
                { name: 'Story Explorer', icon: '📖' },
                { name: 'Music Lover', icon: '🎧' },
            ],
            recentActivities: [
                { type: 'story', title: 'The Wise Sea Turtle', date: 'Today' },
                { type: 'song', title: 'Island Breeze', date: 'Yesterday' },
                { type: 'mission', title: 'Learn 5 Patois Words', date: '2 days ago' },
            ],
        });

        setMessages([
            { role: 'parent', text: 'Marcus loved the story about the sea turtle! He keeps asking questions about Jamaica.', time: '2 hours ago' },
            { role: 'grandparent', text: 'That warms my heart! I\'ll video call this weekend to tell him more stories.', time: '1 hour ago' },
        ]);

        setIsLoading(false);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        setMessages(prev => [...prev, {
            role: 'grandparent',
            text: messageInput,
            time: 'Just now',
        }]);
        setMessageInput('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-12 text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Access Required</h2>
                    <p className="text-gray-500 mb-6">Please enter your access code to view your grandchild's progress.</p>
                    <Link href="/grandparent/access" className="text-primary font-bold">
                        Enter Access Code →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-deep text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black">Grandparent Dashboard</h1>
                            <p className="text-white/70 text-sm">Stay connected with {data.childName}'s learning journey</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" aria-label="Notifications">
                                <Bell size={20} />
                            </button>
                            <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" aria-label="Start Video Call">
                                <Video size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Child Hero Card */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">
                            {data.avatarEmoji}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-black">{data.childName}</h2>
                            <p className="text-white/80">Age {data.childAge} • {data.island}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                                    {data.level.icon} {data.level.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    🔥 {data.currentStreak} day streak
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-black">{data.totalXP.toLocaleString()}</p>
                            <p className="text-white/70">Total XP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
                    {[
                        { id: 'progress', label: 'Progress', icon: TrendingUp },
                        { id: 'messages', label: 'Messages', icon: MessageSquare },
                        { id: 'gallery', label: 'Gallery', icon: Camera },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {activeTab === 'progress' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Stats */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                                    <BookOpen className="text-blue-500 mx-auto mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900">{data.storiesCompleted}</p>
                                    <p className="text-gray-500 text-sm">Stories Read</p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                                    <Music className="text-purple-500 mx-auto mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900">{data.songsListened}</p>
                                    <p className="text-gray-500 text-sm">Songs Heard</p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                                    <Star className="text-amber-500 mx-auto mb-2" size={28} />
                                    <p className="text-3xl font-black text-gray-900">{data.recentBadges.length}</p>
                                    <p className="text-gray-500 text-sm">Badges Earned</p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-black text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    {data.recentActivities.map((activity, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                {activity.type === 'story' && <BookOpen className="text-primary" size={20} />}
                                                {activity.type === 'song' && <Music className="text-purple-500" size={20} />}
                                                {activity.type === 'mission' && <Star className="text-amber-500" size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-xs text-gray-400">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 mb-4">Recent Badges</h3>
                            <div className="space-y-3">
                                {data.recentBadges.map((badge, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                                        <span className="text-2xl">{badge.icon}</span>
                                        <span className="font-medium text-amber-800">{badge.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                                <p className="text-sm text-gray-600 mb-2">
                                    💝 Celebrate {data.childName}'s achievements
                                </p>
                                <button className="w-full py-2 bg-primary text-white rounded-lg font-bold text-sm">
                                    Send Encouragement
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Message List */}
                            <div className="h-96 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'grandparent' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'grandparent'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-xs mt-1 ${msg.role === 'grandparent' ? 'text-white/60' : 'text-gray-400'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="border-t border-gray-100 p-4">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Send a message to the parents..."
                                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                        <Camera className="text-gray-300 mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Artwork Gallery Coming Soon</h3>
                        <p className="text-gray-500">
                            Soon you'll be able to see {data.childName}'s coloring pages and artwork here!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
