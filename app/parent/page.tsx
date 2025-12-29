"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Settings, BarChart3, Users, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { islandData } from '@/lib/islands';
import IslandCustomizer from '@/components/IslandCustomizer';

export default function ParentDashboard() {
    const jamaica = islandData["JAM-001"];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Navbar />
            <main className="container pt-32 pb-24">
                <header className="mb-16">
                    <span className="text-primary font-black uppercase tracking-widest text-sm mb-4 inline-block">Parent Portal</span>
                    <h1 className="text-5xl lg:text-7xl font-black text-deep mb-4">Parent Dashboard 🏠</h1>
                    <p className="text-xl text-deep/60">Manage your little legend's cultural journey and track their growth.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Stats */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 flex items-center gap-8 group hover:scale-[1.02] transition-transform">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><BarChart3 size={40} /></div>
                                <div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Vocabulary Growth</p>
                                    <p className="text-4xl font-black text-deep tracking-tighter">15% Up</p>
                                </div>
                            </div>
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 flex items-center gap-8 group hover:scale-[1.02] transition-transform">
                                <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-3xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all"><Users size={40} /></div>
                                <div>
                                    <p className="text-sm font-black text-deep/30 uppercase tracking-widest mb-1">Cultural IQ</p>
                                    <p className="text-4xl font-black text-deep tracking-tighter">Level 4</p>
                                </div>
                            </div>
                        </div>

                        {/* Child Profiles */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-3xl font-black text-deep">Legend Profiles</h3>
                                <button className="flex items-center gap-3 text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all">
                                    <Plus size={18} /> Add Child
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="p-8 rounded-[2.5rem] border-4 border-primary/20 bg-primary/5 flex items-center justify-between group hover:border-primary transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">K</div>
                                        <div>
                                            <h4 className="text-xl font-black text-deep">Kai (The Explorer)</h4>
                                            <p className="text-deep/60 font-bold">Age 5 • Interests: {jamaica.cultural_training_data.sensory_calibration.sounds[0]}, Reggae</p>
                                        </div>
                                    </div>
                                    <button className="text-primary font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2">Edit <ArrowRight size={16} /></button>
                                </div>
                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-black">!</div>
                                    <p className="text-amber-900 font-bold text-sm">
                                        {jamaica.parent_analytics_logic.milestone_alert}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Co-Pilot Widget */}
                    <div className="space-y-10">
                        <div className="bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
                            <Sparkles className="absolute -top-4 -right-4 text-white/20 w-32 h-32 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700" />
                            <h4 className="font-black text-2xl mb-6 relative z-10">AI PARENT CO-PILOT</h4>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 mb-8 relative z-10">
                                <p className="text-lg text-white font-bold leading-relaxed italic">
                                    "Based on Kai's learning path, I suggest this week's activity: Practice the phrase '{jamaica.cultural_training_data.dialect_patois[1].phrase}' during playtime to build resilience!"
                                </p>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <button className="w-full py-5 bg-white text-primary rounded-[2rem] font-black shadow-xl shadow-black/10 hover:scale-[1.02] transition-transform">Assign Mission</button>
                                <button className="w-full py-5 border-2 border-white/30 hover:bg-white/10 rounded-[2rem] font-black transition-all">Get More Ideas</button>
                            </div>
                        </div>

                        <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-zinc-100">
                            <h4 className="text-2xl font-black text-deep mb-8 flex items-center gap-2">
                                <Settings className="text-zinc-400" />
                                Account Settings
                            </h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-6 border-b border-zinc-50">
                                    <span className="text-deep/40 font-black uppercase tracking-widest text-xs">Current Plan</span>
                                    <span className="text-secondary font-black bg-secondary/10 px-4 py-1.5 rounded-full text-sm">Legends Plus</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-deep/40 font-black uppercase tracking-widest text-xs">Billing</span>
                                    <span className="text-deep font-black text-lg">Monthly ($24)</span>
                                </div>
                            </div>

                            {/* AI Voice Consent */}
                            <div className="mt-8 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center mt-1">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-5 w-5 rounded-lg border-primary/30 text-primary focus:ring-primary/20 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-xs text-deep/60 leading-relaxed font-bold">
                                        I am the parent/legal guardian. I consent to Likkle Legends using AI voice processing to help my child learn to read, as outlined in the
                                        <Link href="/privacy" className="text-primary underline font-black ml-1">Kids' Safety Policy</Link>.
                                    </span>
                                </label>
                            </div>

                            <button className="w-full mt-10 p-6 border-2 border-zinc-100 text-deep rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-zinc-50 hover:border-primary transition-all">Manage Subscription</button>
                        </div>
                    </div>
                </div>

                <IslandCustomizer />
            </main>
            <Footer />
        </div>
    );
}
