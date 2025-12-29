"use client";

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Star, ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function StorybooksPage() {
    const stories = [
        { title: "Dilly and the Magic Mango", status: "Unlocked", difficulty: "Beginner", characters: ["Dilly"], image: "/images/dilly_doubles.png" },
        { title: "Mango Moko's High View", status: "Unlocked", difficulty: "Intermediate", characters: ["Mango"], image: "/images/mango_moko.png" },
        { title: "The Steelpan Secret", status: "New", difficulty: "Beginner", characters: ["Sam"], image: "/images/steelpan_sam.png" },
        { title: "Anansi's Digital Web", status: "Locked", difficulty: "Expert", characters: ["Anansi"], image: "" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="parent" />
            <div className="ml-64">
                <Navbar />
                <main className="container py-24">
                    <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <BookOpen size={24} />
                                </div>
                                <span className="text-primary font-black uppercase tracking-[0.2em] text-xs">Library</span>
                            </div>
                            <h1 className="text-6xl font-black text-deep mb-6">Interactive Storybooks 📖</h1>
                            <p className="text-xl text-deep/50 max-w-2xl">
                                Dive into adventures where your child is the hero. Every story features 'Legends Mode' AI personalization.
                            </p>
                        </div>
                        <div className="bg-white px-8 py-6 rounded-[2.5rem] shadow-xl border border-zinc-100 flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-deep/30 uppercase tracking-widest mb-1">Books Read</p>
                                <p className="text-3xl font-black text-deep tracking-tight">12</p>
                            </div>
                            <div className="w-px h-10 bg-zinc-100"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-deep/30 uppercase tracking-widest mb-1">XP Earned</p>
                                <p className="text-3xl font-black text-secondary tracking-tight">2.4k</p>
                            </div>
                        </div>
                    </header>

                    <div className="grid md:grid-cols-2 gap-10">
                        {stories.map((story, i) => (
                            <div key={i} className={`relative p-8 rounded-[4rem] border-2 transition-all duration-500 overflow-hidden group ${story.status === 'Locked'
                                    ? 'bg-zinc-100 border-zinc-100 opacity-60 grayscale'
                                    : 'bg-white border-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/20'
                                }`}>
                                <div className="flex gap-8 items-center">
                                    <div className="w-40 h-40 bg-zinc-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner flex items-center justify-center relative">
                                        {story.image ? (
                                            <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <Lock size={48} className="text-zinc-200" />
                                        )}
                                        {story.status === 'New' && (
                                            <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">NEW</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-deep group-hover:text-primary transition-colors">{story.title}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">{story.difficulty}</span>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3].map(star => (
                                                        <Star key={star} size={12} fill={story.status === 'Locked' ? '#E4E4E7' : '#FFD700'} stroke="none" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            disabled={story.status === 'Locked'}
                                            className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${story.status === 'Locked' ? 'text-zinc-400' : 'text-primary group-hover:gap-5'
                                                }`}
                                        >
                                            {story.status === 'Locked' ? 'Locked Library' : 'Read Now'} <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 rounded-[4rem] bg-deep text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary opacity-10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Sparkles size={28} className="text-primary" /></div>
                                    <h4 className="text-2xl font-black">AI Legend Mode</h4>
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-black leading-tight">Your child is the hero in every story.</h3>
                                <p className="text-xl text-white/50 leading-relaxed">
                                    Our storytelling engine weaves Kai's name and milestones directly into the narrative, building self-esteem and local pride.
                                </p>
                                <button className="btn btn-primary btn-lg px-12 py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Generate Kai's Daily Tale
                                </button>
                            </div>
                            <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl rotate-2">
                                <img src="/images/child_reading.png" alt="Legend Mode" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent opacity-60"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
