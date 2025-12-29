"use client";

import Sidebar from '@/components/Sidebar';
import { Plus, Layout, Type, Music, BookOpen, Download, Settings, ChevronRight } from 'lucide-react';

export default function AdminContentPage() {
    const modules = [
        { name: "Island Nursery Songs", count: 24, type: "Audio", icon: Music, color: "text-accent bg-accent/5", lastUpdate: "2h ago" },
        { name: "Interactive Stories", count: 18, type: "Interactive", icon: BookOpen, color: "text-primary bg-primary/5", lastUpdate: "1d ago" },
        { name: "Activity Sheets", count: 56, type: "Document", icon: Download, color: "text-secondary bg-secondary/5", lastUpdate: "3h ago" },
        { name: "Character Bios", count: 12, type: "Text", icon: Layout, color: "text-blue-600 bg-blue-50", lastUpdate: "1w ago" },
        { name: "Parent Guides", count: 8, type: "Text", icon: Type, color: "text-amber-600 bg-amber-50", lastUpdate: "3d ago" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="admin" />
            <main className="ml-64 p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-deep mb-2">Content Manager 🛠️</h1>
                        <p className="text-lg text-deep/40 font-bold">Control the stories, beats, and lessons in the Likkle Universe.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-5 rounded-2xl font-black text-deep/40 bg-zinc-100 hover:bg-zinc-200 transition-all flex items-center gap-3">
                            <Settings size={20} /> View Archive
                        </button>
                        <button className="bg-primary text-white px-8 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <Plus size={24} /> New Content Module
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-deep pl-4 mb-4">Core Libraries</h3>
                        {modules.map((mod, i) => (
                            <div key={i} className="bg-white p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className={`w-20 h-20 ${mod.color} rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <mod.icon size={36} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-deep mb-1">{mod.name}</h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-deep/30 uppercase tracking-widest">{mod.count} Items</span>
                                            <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                            <span className="text-xs font-bold text-deep/30 italic">Updated {mod.lastUpdate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-10">
                        <div className="bg-deep p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                            <h3 className="text-3xl font-black mb-6 relative z-10">AI Deployment Logic</h3>
                            <p className="text-white/60 text-lg font-bold leading-relaxed mb-10 relative z-10">
                                Current storytelling engine is using <span className="text-primary italic">Gemini 1.5 Pro</span>. Accuracy for Jamaican Patois is currently 94.2%.
                            </p>
                            <div className="grid gap-4 relative z-10">
                                <button className="w-full py-5 bg-white text-deep rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-transform">Update System Role</button>
                                <button className="w-full py-5 border-2 border-white/20 hover:bg-white/5 rounded-2xl font-black transition-all">View Logic Audit</button>
                            </div>
                        </div>

                        <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-sm shadow-zinc-200/20">
                            <h3 className="text-2xl font-black text-deep mb-8">Asset Commands</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Bulk PDF Generator", status: "Idle", color: "bg-green-500" },
                                    { label: "Audio Sync (CDN)", status: "Active", color: "bg-amber-500" },
                                    { label: "Child Asset Garbage Map", status: "Clean", color: "bg-blue-500" },
                                ].map((task, i) => (
                                    <div key={i} className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex items-center justify-between group hover:border-primary transition-all">
                                        <span className="font-black text-deep">{task.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-deep/30 uppercase tracking-widest">{task.status}</span>
                                            <div className={`w-2.5 h-2.5 rounded-full ${task.color} ${task.status === 'Active' ? 'animate-pulse' : ''}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-10 p-5 border-2 border-dashed border-zinc-200 rounded-3xl text-[10px] font-black uppercase tracking-widest text-deep/30 hover:border-primary hover:text-primary transition-all">
                                Run Maintenance Cycle
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
