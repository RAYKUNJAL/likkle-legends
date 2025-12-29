"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Star, Trophy, Mic, Lightbulb, Download, Music, FileText, Play, Languages, Volume2 } from 'lucide-react';
import TantySpiceWidget from '@/components/AIWidgets';
import { supabase } from '@/lib/supabase';
import { islandData } from '@/lib/islands';

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
    const jamaica = islandData["JAM-001"];

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
                <div className="bg-deep rounded-[4rem] p-16 text-white relative overflow-hidden mb-16 shadow-2xl">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[150px] opacity-20 -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-10 -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full text-sm font-black uppercase tracking-widest mb-6 border border-white/20 backdrop-blur-md">
                                <Star size={16} className="text-primary" fill="currentColor" />
                                Member Access Only
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-black mb-6 tracking-tighter">Welcome to <span className="text-primary italic">The Yard</span> 🌴</h1>
                            <p className="text-2xl text-white/60 max-w-2xl leading-relaxed">
                                Grab your monthly loot, chat with <span className="text-secondary font-black">Tanty Spice</span>, and level up your Legend status!
                            </p>
                        </div>
                        <div className="flex bg-white/5 p-3 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                            <button
                                onClick={() => setTrack('mini')}
                                className={`px-10 py-5 rounded-[2rem] font-black tracking-tight transition-all text-lg ${track === 'mini' ? 'bg-primary text-deep shadow-2xl shadow-primary/40 scale-105' : 'text-white/40 hover:text-white'}`}
                            >
                                Mini Legends (4-5)
                            </button>
                            <button
                                onClick={() => setTrack('big')}
                                className={`px-10 py-5 rounded-[2rem] font-black tracking-tight transition-all text-lg ${track === 'big' ? 'bg-secondary text-white shadow-2xl shadow-secondary/40 scale-105' : 'text-white/40 hover:text-white'}`}
                            >
                                Big Legends (6-8)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Monthly Mission Card */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-10">
                                <span className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-green-200 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Current Mission
                                </span>
                                <div className="flex items-center gap-3 text-deep font-black bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100">
                                    <Trophy size={24} className="text-amber-500" />
                                    <span className="text-xl">500 XP</span>
                                </div>
                            </div>

                            <div className="flex gap-12 items-center lg:items-start flex-col lg:flex-row">
                                <div className="w-full lg:w-2/5 aspect-[4/5] rounded-[3rem] bg-zinc-100 relative overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1546554523-281b37d42571?q=80&w=800&auto=format&fit=crop"
                                        alt="Mission"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-deep/60 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="p-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white text-center font-black uppercase tracking-widest text-xs">
                                            Mission Visual Guide
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-8">
                                    <h2 className="text-4xl lg:text-5xl font-black text-deep leading-tight tracking-tighter">Operation: Steelpan Rhythm 🥁</h2>
                                    <p className="text-xl text-deep/60 leading-relaxed font-bold italic">
                                        "{jamaica.cultural_training_data.sensory_calibration.sounds[0]}"
                                    </p>
                                    <p className="text-lg text-deep/60 leading-relaxed">
                                        Your mission is to find 3 objects in your house that make different sounds. Can you make a beat like {jamaica.cultural_training_data.folklore_characters[0].name}? Record it and show Tanty Spice!
                                    </p>
                                    <button className="w-full py-6 bg-primary text-white text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dialect / Patois Corner */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                            <Languages className="absolute top-0 right-0 w-64 h-64 text-white/10 -mr-20 -mt-20 rotate-12" />
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                                    <Volume2 className="text-accent" />
                                    Patois Corner: Jamaica {jamaica.identity.flag_emoji}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {jamaica.cultural_training_data.dialect_patois.map((item, i) => (
                                        <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:bg-white/20 transition-all cursor-help group">
                                            <p className="text-primary font-black text-2xl mb-2 group-hover:scale-105 transition-transform">"{item.phrase}"</p>
                                            <p className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-4">Means: {item.literal_meaning}</p>
                                            <p className="text-sm text-white/80 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">
                                                {item.context}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Digital Asset Loot Box */}
                        <div className="bg-deep text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>

                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <h3 className="text-3xl font-black flex items-center gap-4">
                                    <Download className="text-secondary" size={32} />
                                    Your Digital Loot
                                </h3>
                                <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    New Items Weekly
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-white/40 font-black uppercase tracking-widest text-xs italic">Checking the vault...</div>
                                </div>
                            ) : assets.length === 0 ? (
                                <div className="bg-white/5 rounded-[3rem] p-16 text-center border-2 border-dashed border-white/10">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Star className="text-white/20" size={32} />
                                    </div>
                                    <p className="text-2xl font-black text-white mb-2">The vault is currently empty!</p>
                                    <p className="text-lg text-white/40 font-bold max-w-sm mx-auto">No digital loot has been packed yet. Tell your parents to check back soon.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                                    {assets.map((asset, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all p-6 rounded-[2.5rem] flex items-center justify-between group cursor-pointer shadow-lg">
                                            <div className="flex items-center gap-6 overflow-hidden">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${asset.metadata?.mimetype?.includes('pdf') ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {asset.metadata?.mimetype?.includes('pdf') ? <FileText size={28} /> : <BookOpen size={28} />}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-black text-lg truncate mb-1">{asset.name}</p>
                                                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest bg-white/5 px-2 py-0.5 rounded-full inline-block">
                                                        Added {new Date(asset.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadAsset(asset.name)}
                                                className="w-12 h-12 rounded-full bg-white text-deep flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-xl"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Progress & Badges */}
                    <div className="space-y-12">
                        {/* Profile Card */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>

                            <div className="w-40 h-40 rounded-full bg-slate-50 mb-8 overflow-hidden border-8 border-white shadow-2xl relative group ring-4 ring-zinc-50">
                                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${track === 'mini' ? 'Kai' : 'BigLegend'}`} alt="Avatar" className="w-full h-full object-cover" />
                                <button className="absolute inset-0 bg-deep/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs uppercase tracking-widest backdrop-blur-sm">
                                    Change Hero
                                </button>
                            </div>
                            <h3 className="text-3xl font-black text-deep mb-2 tracking-tight">Kai</h3>
                            <p className="text-primary font-black text-sm uppercase tracking-widest mb-10 bg-primary/5 px-6 py-1.5 rounded-full ring-1 ring-primary/10 tracking-widest">
                                {track === 'mini' ? 'Junior Explorer' : 'Cultural Legend'}
                            </p>

                            <div className="w-full space-y-3 mb-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-deep/30 uppercase tracking-widest">Growth Meter</span>
                                    <span className="text-xl font-black text-deep tracking-tighter">70%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-6 rounded-full overflow-hidden p-1 shadow-inner border border-zinc-50">
                                    <div className="w-[70%] h-full bg-gradient-to-r from-primary via-orange-500 to-secondary rounded-full shadow-lg"></div>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-deep/30">800 XP to next badge!</p>
                        </div>

                        {/* AI Story Assistant Live Preview */}
                        <div className="bg-deep p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-10 -mr-24 -mt-24"></div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Story Buddy Live</span>
                            </div>
                            <div className="space-y-8 relative z-10">
                                <p className="italic text-xl text-primary font-bold leading-relaxed">
                                    "In the lush hills of St. Lucia, Dilly found a mysterious mango..."
                                </p>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all hover:scale-105 active:scale-95">
                                        🔊 Accent
                                    </button>
                                    <button className="flex-[2] bg-primary px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                        Use Kai's Name
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Know Your Island */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12"></div>
                            <h4 className="font-black text-2xl mb-8 flex items-center gap-3">
                                <span>{jamaica.identity.flag_emoji}</span>
                                Know {jamaica.island_name}
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🐦</div>
                                    <div>
                                        <p className="text-[10px] font-black text-deep/30 uppercase">National Bird</p>
                                        <p className="font-black text-deep text-sm">{jamaica.identity.national_symbols.bird.split(' (')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-secondary/5 group-hover:border-secondary/20 transition-all">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🍲</div>
                                    <div>
                                        <p className="text-[10px] font-black text-deep/30 uppercase">National Fruit</p>
                                        <p className="font-black text-deep text-sm">{jamaica.identity.national_symbols.fruit}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-zinc-50 text-center">
                                <p className="text-[10px] font-black text-deep/30 uppercase mb-2">Cool Places</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {jamaica.identity.landscape_features.map((feature, i) => (
                                        <span key={i} className="px-3 py-1 bg-zinc-100 text-deep/60 rounded-full text-[10px] font-black">{feature}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Badges */}
                        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                            <h4 className="font-black text-2xl mb-10 flex items-center gap-3">
                                <Star className="text-primary" fill="currentColor" size={28} />
                                Badge Case
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-[1.5rem] border-2 flex items-center justify-center text-3xl transition-all cursor-help relative group ${i <= 2 ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' : 'bg-zinc-50 border-dashed border-zinc-200 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:border-primary'
                                            }`}
                                        title={i === 1 ? "Cultural Hero" : i === 2 ? "Steelpan Scholar" : `Locked Badge #${i}`}
                                    >
                                        {i === 1 ? '🥇' : i === 2 ? '🎵' : '🔒'}
                                        {i <= 2 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-10 p-5 bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] text-deep/30 font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 transition-all">
                                View Full Case
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Assistant */}
            <TantySpiceWidget />

            <Footer />
        </div>
    );
}
