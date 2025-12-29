"use client";

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { BookOpen, Star, ArrowRight, Flame, GraduationCap, Mic, BarChart3, History, Mail } from 'lucide-react';
import Link from 'next/link';
import { islandData } from '@/lib/islands';

export default function DashboardPage() {
    const jamaica = islandData["JAM-001"];

    return (
        <div className="flex min-h-screen bg-[#FFFDF7]">
            <Sidebar />

            <main className="flex-1 ml-64 p-10">
                {/* Header Section with Streak & Stamps */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest mb-4">
                            Active Explorer
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-deep tracking-tight">Welcome Back, Kai! 👋</h1>
                        <p className="text-deep/50 text-xl font-medium mt-2">You've explored <span className="text-secondary font-black">2 islands</span> this month. Keep going!</p>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 flex items-center gap-8 group">
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-deep/30 uppercase tracking-widest mb-1">Current Streak</p>
                            <p className="text-3xl font-black text-orange-500 flex items-center gap-2">
                                <Flame size={28} fill="currentColor" className="animate-pulse" />
                                5 Days
                            </p>
                        </div>
                        <div className="h-12 w-[2px] bg-zinc-100 rounded-full"></div>
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-deep/30 uppercase tracking-widest mb-1">Stamps Earned</p>
                            <p className="text-3xl font-black text-primary flex items-center gap-2">
                                12 <GraduationCap size={28} className="group-hover:rotate-12 transition-transform" />
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">

                        {/* Monthly Reading Goal Card */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h3 className="text-2xl font-black text-deep flex items-center gap-3">
                                    <BookOpen className="text-primary" />
                                    Monthly Reading Goal
                                </h3>
                                <div className="bg-primary/10 text-primary px-6 py-2 rounded-2xl font-black text-xl">
                                    65%
                                </div>
                            </div>

                            <div className="w-full bg-zinc-100 h-8 rounded-full overflow-hidden p-1.5 shadow-inner mb-8">
                                <div className="w-[65%] h-full bg-gradient-to-r from-primary via-orange-500 to-secondary rounded-full shadow-lg relative group">
                                    <div className="absolute top-0 right-0 w-4 h-full bg-white/20 animate-shine"></div>
                                </div>
                            </div>

                            <p className="text-lg text-deep/60 leading-relaxed font-medium">
                                <span className="text-deep font-black uppercase tracking-tight">Level Up!</span> 3 more stories until your next <span className="text-secondary font-black italic">Physical Sticker Pack</span> ships to your door! 📦
                            </p>
                        </div>

                        {/* Island Passport Section */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-deep tracking-tight">Your Island Passport</h3>
                                <button className="text-primary font-black uppercase text-xs tracking-widest hover:underline flex items-center gap-2">
                                    View Full Map <ArrowRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {/* Jamaica (Current) */}
                                <div className="bg-gradient-to-br from-[#FFF7EC] to-white p-8 rounded-[3rem] border-4 border-primary shadow-2xl shadow-primary/10 text-center group cursor-pointer hover:-translate-y-2 transition-all">
                                    <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-500">🇯🇲</div>
                                    <p className="text-xl font-black text-deep mb-3">Jamaica</p>
                                    <span className="inline-block px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-full tracking-widest">Explored</span>
                                </div>

                                {/* Trinidad (Unlocked) */}
                                <div className="bg-gradient-to-br from-white to-zinc-50 p-8 rounded-[3rem] border-2 border-zinc-100 shadow-xl hover:shadow-2xl transition-all text-center group cursor-pointer hover:-translate-y-2">
                                    <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-500">🇹🇹</div>
                                    <p className="text-xl font-black text-deep mb-3">Trinidad</p>
                                    <span className="inline-block px-4 py-1.5 bg-secondary text-white text-[10px] font-black uppercase rounded-full tracking-widest">Explored</span>
                                </div>

                                {/* Barbados (Locked) */}
                                <div className="bg-zinc-100 p-8 rounded-[3rem] border-2 border-dashed border-zinc-200 shadow-sm text-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                                    <div className="text-6xl mb-6">🇧🇧</div>
                                    <p className="text-xl font-black text-deep/40 mb-3">Barbados</p>
                                    <span className="inline-block px-4 py-1.5 bg-zinc-200 text-zinc-500 text-[10px] font-black uppercase rounded-full tracking-widest">Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats & Tools */}
                    <div className="space-y-12">
                        {/* AI Reading Buddy Widget */}
                        <div className="bg-gradient-to-br from-primary to-orange-500 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-3 relative z-10">
                                <Mic fill="currentColor" size={24} />
                                Reading Buddy
                            </h3>
                            <p className="text-white/80 font-bold mb-10 leading-relaxed relative z-10">
                                Ready to read <span className="text-white italic">"The Brave Little Hummingbird"</span>? Tanty Spice is waiting!
                            </p>
                            <button className="w-full bg-white text-primary py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                                🎙️ Start Reading
                            </button>
                        </div>

                        {/* Parent Quick Tools */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                            <h3 className="text-2xl font-black text-deep mb-8 flex items-center gap-3">
                                <BarChart3 className="text-primary" />
                                Parent Tools
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Growth Report", icon: BarChart3, href: "/parent" },
                                    { name: "Saved Recordings", icon: History, href: "#" },
                                    { name: "Mail Tracking", icon: Mail, href: "#" },
                                ].map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className="w-full flex justify-between items-center p-5 hover:bg-zinc-50 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={20} className="text-deep/20 group-hover:text-primary transition-colors" />
                                            <span className="font-black text-deep group-hover:text-primary transition-colors">{item.name}</span>
                                        </div>
                                        <ArrowRight size={18} className="text-deep/10 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Mini Feed */}
                        <div className="bg-deep text-white/40 p-10 rounded-[3.5rem] shadow-2xl border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Recent Wins</h4>
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-white/60"><span className="text-primary">✨ Learned:</span> "Wah Gwan"</p>
                                <p className="text-xs font-bold text-white/60"><span className="text-secondary">📚 Finished:</span> Mento Beats</p>
                                <p className="text-xs font-bold text-white/60"><span className="text-primary">🎨 Painted:</span> Red Billed Bird</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
