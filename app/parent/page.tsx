"use client";

import Navbar from '@/components/Navbar';
import { Settings, BarChart3, Users, Sparkles, Plus } from 'lucide-react';

export default function ParentDashboard() {
    return (
        <div className="bg-zinc-50 min-h-screen">
            <Navbar />
            <div className="container py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Parent Dashboard 🏠</h1>
                    <p className="text-deep/60">Manage your little legend's cultural journey.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><BarChart3 size={32} /></div>
                                <div>
                                    <p className="text-sm font-bold opacity-40 uppercase">Reading Progress</p>
                                    <p className="text-3xl font-black text-deep">84%</p>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border flex items-center gap-6">
                                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center"><Users size={32} /></div>
                                <div>
                                    <p className="text-sm font-bold opacity-40 uppercase">Missions Done</p>
                                    <p className="text-3xl font-black text-deep">12</p>
                                </div>
                            </div>
                        </div>

                        {/* Child Profiles */}
                        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold">LEGEND PROFILES</h3>
                                <button className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
                                    <Plus size={16} /> Add Child
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">M</div>
                                        <div>
                                            <h4 className="font-bold">Malik (Big Legend)</h4>
                                            <p className="text-sm text-deep/60">Age 7 • Interests: Carnival, Science</p>
                                        </div>
                                    </div>
                                    <button className="text-primary font-bold hover:underline">Edit</button>
                                </div>
                                <div className="p-6 rounded-2xl border border-border bg-white flex items-center justify-between opacity-50 grayscale">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center font-bold">?</div>
                                        <div>
                                            <h4 className="font-bold">Invite a Family Member</h4>
                                            <p className="text-sm text-deep/60">Share the cultural journey with grandparents</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Co-Pilot Widget */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-primary to-orange-600 p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
                            <Sparkles className="absolute top-4 right-4 text-white/20 w-12 h-12 group-hover:rotate-12 transition-transform" />
                            <h4 className="font-bold text-xl mb-4">AI PARENT CO-PILOT</h4>
                            <p className="text-sm text-white/80 mb-6 leading-relaxed">
                                "Based on Malik's interest in Trinidad Carnival, I suggest this week's Unity Mission: Make a recycled costume part using things from the garden!"
                            </p>
                            <div className="space-y-3">
                                <button className="w-full py-4 bg-white text-primary rounded-2xl font-bold shadow-lg shadow-black/10">Assign Mission</button>
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-colors">Get More Ideas</button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-border">
                            <h4 className="font-bold mb-4">Account Settings</h4>
                            <div className="space-y-4 text-sm font-semibold">
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="opacity-50">Current Plan</span>
                                    <span className="text-secondary bg-secondary/5 px-3 py-1 rounded-full">Legends Plus</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="opacity-50">Billing Cycle</span>
                                    <span className="text-deep font-bold">Monthly ($24)</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-4 border-2 border-border text-deep rounded-2xl font-bold hover:bg-zinc-50 transition-colors uppercase tracking-widest text-xs">Manage Subscription</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
