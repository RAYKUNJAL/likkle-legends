"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { BookOpen, Star, Trophy, Mic, Lightbulb } from 'lucide-react';

export default function ChildPortal() {
    const [track, setTrack] = useState<'mini' | 'big'>('mini');

    return (
        <div className="bg-background min-h-screen">
            <Navbar />
            <div className="container py-12">
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold">Welcome back, Little Legend! 🌟</h1>
                        <p className="text-deep/60">Ready for your cultural mission today?</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl border border-border shadow-sm">
                        <button
                            onClick={() => setTrack('mini')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${track === 'mini' ? 'bg-secondary text-white shadow-md' : 'text-deep/40 hover:text-deep'}`}
                        >
                            Mini Legends (4-5)
                        </button>
                        <button
                            onClick={() => setTrack('big')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${track === 'big' ? 'bg-primary text-white shadow-md' : 'text-deep/40 hover:text-deep'}`}
                        >
                            Big Legends (6-8)
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Story Reader */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-secondary/20 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <span className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-bold uppercase">December Mission</span>
                                <div className="flex items-center gap-2 text-primary font-bold"><Trophy size={18} /> 400 EXP</div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">Dilly's Doubles Stand Adventure</h2>
                                <p className="text-lg leading-relaxed text-deep/80">
                                    "Come see!" cried Dilly. The steam from the barrel smelled like...
                                </p>

                                <div className="aspect-video bg-zinc-100 rounded-3xl flex items-center justify-center relative group-hover:scale-[1.02] transition-transform overflow-hidden">
                                    <img src="https://via.placeholder.com/800x450?text=Storybook+Animation" alt="Story" className="w-full h-full object-cover" />
                                    <button className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-primary animate-pulse">
                                            <Mic size={40} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center pt-6">
                                    <button className="btn btn-primary gap-2 h-16 px-10 text-xl shadow-primary/30">
                                        <Mic size={24} /> Start Reading Buddy
                                    </button>
                                </div>
                                <p className="text-center text-xs text-deep/40 uppercase tracking-widest font-bold">Gemini AI will listen & guide you</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Stats & Badges */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-border">
                            <h4 className="font-bold text-xl mb-6">Your Collection</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-zinc-50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center group cursor-pointer hover:border-secondary transition-colors">
                                        <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🏆</div>
                                        <span className="text-[10px] uppercase font-bold text-deep/30 group-hover:text-secondary">Mission {i}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-deep p-8 rounded-[3rem] shadow-lg text-white space-y-4">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="text-yellow-400" />
                                <h4 className="font-bold">Unity Mission</h4>
                            </div>
                            <p className="text-sm text-white/70">Find something in your kitchen that came from another country!</p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">Submit Mission</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
