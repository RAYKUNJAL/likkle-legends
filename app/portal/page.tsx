"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BookOpen, Star, Trophy, Mic, Lightbulb, Download, Music, FileText, Play } from 'lucide-react';
import TantySpiceWidget from '@/components/AIWidgets';
import { supabase } from '@/lib/supabase';

interface PortalAsset {
    name: string;
    id: string;
    metadata: {
        mimetype: string;
        size: number;
    };
    created_at: string;
}

export default function TheYard() {
    const [track, setTrack] = useState<'mini' | 'big'>('mini');
    const [assets, setAssets] = useState<PortalAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const { data, error } = await supabase
                .storage
                .from('legends-assets')
                .list();

            if (error) throw error;
            if (data) setAssets(data as any);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadAsset = async (fileName: string) => {
        const { data } = supabase.storage.from('legends-assets').getPublicUrl(fileName);
        window.open(data.publicUrl, '_blank');
    };

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Navbar />

            <main className="container pt-32 pb-24">
                {/* Header Section */}
                <div className="bg-deep rounded-[3rem] p-12 text-white relative overflow-hidden mb-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
                                Member Access Only
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black mb-4">Welcome to The Yard 🌴</h1>
                            <p className="text-xl text-white/60 max-w-xl">
                                Grab your monthly loot, chat with Tanty Spice, and level up your Legend status!
                            </p>
                        </div>
                        <div className="flex bg-white/10 p-2 rounded-2xl backdrop-blur-md">
                            <button
                                onClick={() => setTrack('mini')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${track === 'mini' ? 'bg-primary text-deep shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Mini Legends (4-5)
                            </button>
                            <button
                                onClick={() => setTrack('big')}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${track === 'big' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-white/60 hover:text-white'}`}
                            >
                                Big Legends (6-8)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Monthly Mission Card */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-100 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-8">
                                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Current Mission
                                </span>
                                <div className="flex items-center gap-2 text-deep font-black bg-zinc-100 px-4 py-2 rounded-xl">
                                    <Trophy size={18} className="text-yellow-500" />
                                    <span>500 XP</span>
                                </div>
                            </div>

                            <div className="flex gap-8 items-center md:items-start flex-col md:flex-row">
                                <div className="w-full md:w-1/3 aspect-[3/4] rounded-3xl bg-zinc-100 relative overflow-hidden shadow-inner">
                                    <img
                                        src="https://images.unsplash.com/photo-1546554523-281b37d42571?q=80&w=600&auto=format&fit=crop"
                                        alt="Mission"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h2 className="text-3xl font-black text-deep leading-tight">Operation: Steelpan Rhythm</h2>
                                    <p className="text-lg text-deep/60 leading-relaxed">
                                        Your mission is to find 3 objects in your house that make different sounds. Can you make a beat? Record it and show Tanty Spice!
                                    </p>
                                    <button className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-primary/20">
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Digital Asset Loot Box */}
                        <div className="bg-deep text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>

                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
                                <Download className="text-secondary" />
                                Your Digital Loot
                            </h3>

                            {loading ? (
                                <div className="text-white/40 italic">Checking the vault...</div>
                            ) : assets.length === 0 ? (
                                <div className="bg-white/5 rounded-3xl p-8 text-center border border-white/10">
                                    <p className="font-bold text-white/50">No loot found yet!</p>
                                    <p className="text-sm text-white/30">Tell your parents to check back soon.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                                    {assets.map((asset, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-4 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${asset.metadata?.mimetype?.includes('pdf') ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {asset.metadata?.mimetype?.includes('pdf') ? <FileText size={20} /> : <BookOpen size={20} />}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-bold text-sm truncate">{asset.name}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                        {new Date(asset.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadAsset(asset.name)}
                                                className="w-10 h-10 rounded-full bg-white text-deep flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Progress & Badges */}
                    <div className="space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-zinc-100 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-slate-100 mb-6 overflow-hidden border-4 border-white shadow-xl relative group">
                                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${track}`} alt="Avatar" className="w-full h-full object-cover" />
                                <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                                    EDIT
                                </button>
                            </div>
                            <h3 className="text-2xl font-black text-deep mb-1">Junior Legend</h3>
                            <p className="text-deep/40 font-bold text-sm uppercase tracking-widest mb-6">Level 3 Explorer</p>

                            <div className="w-full bg-zinc-100 h-4 rounded-full overflow-hidden mb-2">
                                <div className="w-[70%] h-full bg-gradient-to-r from-primary to-secondary"></div>
                            </div>
                            <div className="flex justify-between w-full text-xs font-bold text-deep/30">
                                <span>1200 XP</span>
                                <span>Next: 2000 XP</span>
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-zinc-100">
                            <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
                                <Star className="text-primary" fill="currentColor" />
                                Badge Case
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-2xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:border-primary cursor-help transition-all" title={`Badge #${i}`}>
                                        🎖️
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Assistant */}
            <TantySpiceWidget />
        </div>
    );
}
