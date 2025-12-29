"use client";

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Music, Play, Heart, Share2, Sparkles } from 'lucide-react';

export default function NurserySongsPage() {
    const songs = [
        { title: "Brown Girl in the Ring", duration: "2:45", category: "Classic", icon: "🥥" },
        { title: "One, Two, Buckle My Shoe (Reggae Remix)", duration: "3:12", category: "Education", icon: "👟" },
        { title: "The Anansi Beat", duration: "4:01", category: "Folklore", icon: "🕷️" },
        { title: "Coconut Tree Swing", duration: "2:30", category: "Lullaby", icon: "🌴" },
        { title: "Steelpan Morning", duration: "5:20", category: "Instrumental", icon: "🎵" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="parent" />
            <div className="ml-64">
                <Navbar />
                <main className="container py-24">
                    <header className="mb-16">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                                <Music size={24} />
                            </div>
                            <span className="text-accent font-black uppercase tracking-[0.2em] text-xs">Digital Universe</span>
                        </div>
                        <h1 className="text-6xl font-black text-deep mb-6">Island Nursery Songs 🎵</h1>
                        <p className="text-xl text-deep/50 max-w-2xl">
                            Caribbean rhythms re-imagined for modern legends. Lyrics that teach and beats that move.
                        </p>
                    </header>

                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-4">
                            {songs.map((song, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                            {song.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-deep mb-1">{song.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-3 py-1 rounded-full">{song.category}</span>
                                                <span className="text-xs font-bold text-deep/30">{song.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button title="Favorite" className="p-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Heart size={20} /></button>
                                        <button title="Play Song" className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-110 active:scale-95 transition-all">
                                            <Play fill="white" size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-accent to-pink-500 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-white/20 group-hover:rotate-12 transition-transform" />
                                <h4 className="font-black text-2xl mb-4 relative z-10">LEGEND PLAYLIST</h4>
                                <p className="text-white/80 font-bold mb-8 relative z-10 italic">"Kai's favorite jams for the morning school run!"</p>
                                <button className="w-full bg-white text-accent py-5 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-transform relative z-10">
                                    Create New Playlist
                                </button>
                            </div>

                            <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-sm">
                                <h4 className="text-xl font-black text-deep mb-6">Music Stats</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-deep/30 uppercase tracking-widest">Rhythm Recognition</span>
                                        <span className="text-2xl font-black text-primary">Advanced</span>
                                    </div>
                                    <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-primary rounded-full"></div>
                                    </div>
                                    <p className="text-xs font-bold text-deep/40 leading-relaxed">Kai has listened to "Anansi Beat" 12 times this week!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
