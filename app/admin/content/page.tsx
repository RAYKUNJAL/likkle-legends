"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    AdminLayout,
    Music, Video, BookOpen, Download, LayoutGrid, Gamepad2,
    Plus, Settings, ChevronRight, Activity, Globe
} from '@/components/admin/AdminComponents';

export default function AdminContentPage() {
    const [counts, setCounts] = useState({
        songs: 0,
        stories: 0,
        characters: 0,
        videos: 0,
        printables: 0,
        games: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCounts();
    }, []);

    const loadCounts = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
            if (!session) return;

            const { getContentCounts } = await import('@/app/actions/admin');
            const data = await getContentCounts(session.access_token);
            setCounts(data);
        } catch (error) {
            console.error('Failed to load counts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const modules = [
        {
            id: 'songs',
            name: "Island Nursery Songs",
            count: counts.songs,
            type: "Audio",
            icon: Music,
            color: "text-accent bg-accent/5",
            href: "/admin/media?tab=songs"
        },
        {
            id: 'stories',
            name: "Interactive Stories",
            count: counts.stories,
            type: "Interactive",
            icon: BookOpen,
            color: "text-primary bg-primary/5",
            href: "/admin/content/stories"
        },
        {
            id: 'videos',
            name: "Video Lessons",
            count: counts.videos,
            type: "Video",
            icon: Video,
            color: "text-blue-600 bg-blue-50",
            href: "/admin/media?tab=videos"
        },
        {
            id: 'games',
            name: "Fun Games",
            count: counts.games,
            type: "Game",
            icon: Gamepad2,
            color: "text-purple-600 bg-purple-50",
            href: "/admin/games"
        },
        {
            id: 'characters',
            name: "Character Bios",
            count: counts.characters,
            type: "Profile",
            icon: LayoutGrid,
            color: "text-emerald-600 bg-emerald-50",
            href: "/admin/characters"
        },
        {
            id: 'printables',
            name: "Activity Sheets",
            count: counts.printables,
            type: "Document",
            icon: Download,
            color: "text-secondary bg-secondary/5",
            href: "/admin/content/printables"
        }
    ];

    return (
        <AdminLayout activeSection="content">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Content Library</h1>
                        <p className="text-gray-500">Manage all island assets, stories, and educational modules</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/admin/cms"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <Globe size={20} />
                            Site CMS
                        </Link>
                        <button
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            New Module
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Core Libraries */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-xl font-black text-gray-900">Core Libraries</h3>
                            <button
                                onClick={loadCounts}
                                title="Refresh Counts"
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                <Activity size={18} />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {modules.map((mod) => (
                                <Link
                                    key={mod.id}
                                    href={mod.href}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 ${mod.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <mod.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900">{mod.name}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    {isLoading ? '...' : mod.count} {mod.type}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI & Automation */}
                    <div className="space-y-8">
                        <div className="bg-deep rounded-3xl p-10 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                    <Activity className="text-primary" />
                                    AI Engine Status
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-white/60 text-sm font-medium mb-1">Active Model</p>
                                        <p className="text-xl font-bold">Gemini 1.5 Pro</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-xs text-green-400 font-bold uppercase tracking-widest">Optimal Performance</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="py-4 bg-white text-deep rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                            Manage Prompts
                                        </button>
                                        <button className="py-4 border border-white/20 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors">
                                            View Logs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Settings className="text-gray-400" size={20} />
                                Asset Automation
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Bulk PDF Generator", status: "Ready", color: "bg-green-500" },
                                    { label: "Audio Sync (CDN)", status: "Active", color: "bg-amber-500" },
                                    { label: "Asset Cleanup", status: "Idle", color: "bg-gray-400" },
                                ].map((task, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all">
                                        <span className="font-bold text-gray-700 text-sm">{task.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{task.status}</span>
                                            <div className={`w-2 h-2 rounded-full ${task.color} ${task.status === 'Active' ? 'animate-pulse' : ''}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary transition-all">
                                Run Maintenance Cycle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
