"use client";

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Download, FileText, Printer, Check, Search, Sparkles } from 'lucide-react';

export default function PrintablesPage() {
    const assets = [
        { title: "Dilly's Doubles Stand", type: "Coloring Sheet", date: "Oct 24", icon: "🎨" },
        { title: "Caribbean Flag Alphabet", type: "Flashcards", date: "Oct 20", icon: "📚" },
        { title: "My First Patois Phrases", type: "Writing Practice", date: "Oct 18", icon: "✏️" },
        { title: "National Hero Badges", type: "DIY Sticker Kit", date: "Oct 15", icon: "🏅" },
        { title: "Island Bird Maze", type: "Puzzle", date: "Oct 10", icon: "🧩" },
        { title: "Cocoa Tea Recipe Art", type: "Activity", date: "Oct 05", icon: "☕" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="parent" />
            <div className="ml-64">
                <Navbar />
                <main className="container py-24">
                    <header className="mb-16 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                                    <Download size={24} />
                                </div>
                                <span className="text-secondary font-black uppercase tracking-[0.2em] text-xs">Print & Play</span>
                            </div>
                            <h1 className="text-6xl font-black text-deep mb-6">Printable Adventures 📄</h1>
                            <p className="text-xl text-deep/50 max-w-2xl">
                                High-quality coloring pages, activity sheets, and cultural flashcards. Fresh content delivered to your inbox every week.
                            </p>
                        </div>
                        <div className="w-full md:w-96 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-deep/20 group-focus-within:text-secondary mb-1 transition-colors" size={24} />
                            <input
                                type="text"
                                placeholder="Search by island or character..."
                                className="w-full pl-16 pr-8 py-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all text-lg font-bold"
                            />
                        </div>
                    </header>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {assets.map((asset, i) => (
                            <div key={i} className="bg-white p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:bg-secondary/10 transition-colors"></div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                                        {asset.icon}
                                    </div>
                                    <span className="text-xs font-black text-deep/20 uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">{asset.date}</span>
                                </div>
                                <div className="relative z-10 mb-8">
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">{asset.type}</p>
                                    <h3 className="text-2xl font-black text-deep group-hover:text-secondary transition-colors leading-tight">{asset.title}</h3>
                                </div>
                                <button className="w-full bg-deep text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl group-hover:bg-secondary transition-colors">
                                    <Printer size={20} /> Download PDF
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-16 rounded-[5rem] border-4 border-dashed border-zinc-100 flex flex-col items-center text-center max-w-4xl mx-auto relative overflow-hidden">
                        <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-[2.5rem] flex items-center justify-center mb-8"><FileText size={48} /></div>
                        <h3 className="text-4xl font-black text-deep mb-6">Missing something specific?</h3>
                        <p className="text-xl text-deep/50 mb-10 leading-relaxed max-w-xl">
                            Our AI can generate custom coloring sheets based on Kai's latest learning goals. Just tell us what you'd like to see!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button className="bg-secondary text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                <Sparkles size={24} /> New AI Request
                            </button>
                            <button className="bg-zinc-100 text-deep px-12 py-6 rounded-[2rem] font-black text-lg hover:bg-zinc-200 transition-all">
                                View Bulk Packs
                            </button>
                        </div>
                        {/* Status Bar */}
                        <div className="mt-12 flex items-center gap-8 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 3,420 Prints this month</div>
                            <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
                            <div className="flex items-center gap-2"><Check size={14} className="text-green-500" /> New items every Monday</div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
