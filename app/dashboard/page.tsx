"use client";

import Sidebar from '@/components/Sidebar';
import { Music, BookOpen, Star, Mail, LayoutDashboard, Compass } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-deep">Welcome back, Legend! 👋</h1>
                        <p className="text-deep/50">Your child's next adventure is currently being packed with love.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold text-sm">Parent Account</p>
                            <p className="text-xs text-primary font-bold">LEGENDS PLUS MEMBER</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">JS</div>
                    </div>
                </header>

                {/* Status Bar */}
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-deep/40 uppercase">Next Mail</p>
                            <p className="font-bold">Jan 15th</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-deep/40 uppercase">Points Earned</p>
                            <p className="font-bold">850 Pts</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-deep/40 uppercase">Books Read</p>
                            <p className="font-bold">12 Stories</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                            <Compass size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-deep/40 uppercase">Missions</p>
                            <p className="font-bold">4 Complete</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content: Child Portal Access */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative h-80 rounded-[3rem] overflow-hidden group border-8 border-white shadow-2xl">
                            <img src="/images/hero.png" alt="Child Portal" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                                <div>
                                    <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 inline-block">Kids Only Area</span>
                                    <h2 className="text-4xl font-black text-white">Enter the Child Portal</h2>
                                    <p className="text-white/70 max-w-sm">Magic awaits! Interactive stories, AI buddies, and new songs are ready.</p>
                                </div>
                                <button className="btn btn-primary btn-lg p-6">Enter Portal →</button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 hover:shadow-xl transition-all group">
                                <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                                    Newest Song
                                    <Music className="text-accent group-hover:rotate-12 transition-transform" />
                                </h3>
                                <div className="p-4 bg-zinc-50 rounded-2xl mb-4">
                                    <p className="font-bold text-sm">Mango Seasons</p>
                                    <p className="text-xs text-deep/40">By Mango Moko</p>
                                </div>
                                <button className="text-accent font-bold text-sm hover:underline">Listen Now</button>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 hover:shadow-xl transition-all group">
                                <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                                    Next Mission
                                    <LayoutDashboard className="text-primary group-hover:scale-110 transition-transform" />
                                </h3>
                                <div className="p-4 bg-zinc-50 rounded-2xl mb-4">
                                    <p className="font-bold text-sm">Identity & Pride</p>
                                    <p className="text-xs text-deep/40">Level 2: The Stilt Walker</p>
                                </div>
                                <button className="text-primary font-bold text-sm hover:underline">Start Mission</button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Sidebar: Activity Feed */}
                    <div className="bg-white p-8 rounded-[3rem] border border-zinc-100">
                        <h3 className="text-xl font-black mb-8">Activity Hub</h3>
                        <div className="space-y-6">
                            {[
                                { title: "Daughter completed Level 1", date: "2 hours ago", icon: "✨", color: "bg-yellow-100" },
                                { title: "Letter #4 Shipped Worldwide", date: "Yesterday", icon: "📦", color: "bg-blue-100" },
                                { title: "New coloring page added", date: "2 days ago", icon: "🎨", color: "bg-pink-100" },
                                { title: "Tanty Spice sent a voice msg", date: "3 days ago", icon: "🎙️", color: "bg-purple-100" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-deep leading-tight">{item.title}</p>
                                        <p className="text-[10px] text-deep/40 uppercase font-black tracking-widest mt-1">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 p-4 border-2 border-dashed border-zinc-200 rounded-2xl text-deep/40 text-sm font-bold hover:bg-zinc-50 transition-colors">
                            View All History
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
