"use client";

import React, { useState, useEffect } from 'react';
import {
    Music, ShoppingBag, Download, Star, Sparkles,
    Gift, Calendar, Play, Pause, ChevronRight, Clock,
    DollarSign, Heart, AudioLines
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/storage';

import PurchaseModal from '@/components/MusicStore/PurchaseModal';

interface Song {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    category: string;
    read_time_minutes?: number; // repurposed for duration?
    metadata?: {
        is_premium?: boolean;
        price?: number;
    };
}

export default function ParentMusicHub() {
    const [activeTab, setActiveTab] = useState<'market' | 'library' | 'custom'>('market');
    const [songs, setSongs] = useState<Song[]>([]);
    const [purchases, setPurchases] = useState<string[]>([]); // Array of song IDs
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);

    // Purchase Modal State
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch all premium songs
            const { data: allSongs } = await supabase
                .from('songs')
                .select('*')
                .eq('is_active', true);

            setSongs(allSongs || []);

            // 2. Fetch user purchases (using purchased_content)
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: myPurchases } = await supabase
                    .from('purchased_content')
                    .select('content_id')
                    .eq('user_id', session.user.id);

                setPurchases(myPurchases?.map(p => p.content_id) || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchaseInitiate = (song: Song) => {
        setSelectedSong(song);
        setSelectedProduct('single_track');
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = () => {
        if (selectedSong) {
            setPurchases(prev => [...prev, selectedSong.id]);
        }
        setIsPurchaseModalOpen(false);
        toast.success("Purchase successful! Added to your library.");
        loadData();
    };

    const handleCustomInitiate = () => {
        setSelectedSong(null);
        setSelectedProduct('custom_song_request');
        setIsPurchaseModalOpen(true);
    };

    const premiumTracks = songs.filter(s => s.metadata?.is_premium && !purchases.includes(s.id));
    const ownedTracks = songs.filter(s => purchases.includes(s.id) || !s.metadata?.is_premium);

    return (
        <div className="min-h-screen bg-[#FDFCF6] pb-20">
            {/* Hero Header */}
            <section className="bg-gradient-to-br from-[#FF9D00] to-[#FF6B00] pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                <div className="container mx-auto">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
                            <Star size={12} className="fill-white" /> The Legendary Sound
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                            Music for Every <br /> <span className="text-deep italic underline decoration-wavy decoration-yellow-300">Milestone.</span>
                        </h1>
                        <p className="text-white/80 text-lg font-medium mb-10 leading-relaxed max-w-xl">
                            Unlock premium Caribbean tracks for just $0.99 or order a custom birthday song made specifically for your Likkle Legend!
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setActiveTab('custom')}
                                className="px-8 py-4 bg-white text-[#FF6B00] rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-sm"
                            >
                                <Gift size={18} /> Order Custom Song
                            </button>
                            <button
                                onClick={() => setActiveTab('market')}
                                className="px-8 py-4 bg-deep/20 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-deep/30 transition-all text-sm"
                            >
                                <ShoppingBag size={18} /> Browse Marketplace
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <div className="container mx-auto -mt-10 px-6">
                <div className="bg-white rounded-3xl p-2 shadow-xl border border-zinc-100 flex items-center max-w-fit gap-2">
                    {[
                        { id: 'market', label: 'Market', icon: ShoppingBag },
                        { id: 'library', label: 'My Library', icon: AudioLines },
                        { id: 'custom', label: 'Custom Orders', icon: Sparkles }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-zinc-400 hover:text-deep hover:bg-zinc-50'}`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-6 py-12">
                {activeTab === 'market' && (
                    <div className="space-y-12 animate-fade-in">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-deep">Premium Marketplace</h2>
                                <p className="text-zinc-400 font-medium">Own high-quality Caribbean education tracks forever.</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                $0.99 per track
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {premiumTracks.map(song => (
                                <div key={song.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-zinc-50 group hover:scale-[1.02] transition-all">
                                    <div className="relative h-48 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-3xl mb-6 overflow-hidden flex items-center justify-center border border-zinc-50">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-primary transform group-hover:scale-110 transition-transform">
                                            <Music size={40} />
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                                {song.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-deep group-hover:text-primary transition-colors">{song.title}</h3>
                                            <p className="text-zinc-400 text-sm font-medium">{song.artist}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Clock size={14} />
                                                <span className="text-xs font-bold">3:45</span>
                                            </div>
                                            <button
                                                onClick={() => handlePurchaseInitiate(song)}
                                                className="px-6 py-3 bg-deep text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:shadow-lg transition-all"
                                            >
                                                Unlock for $0.99
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'library' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-deep">My Music Library</h2>
                                <p className="text-zinc-400 font-medium">Stream or download your unlocked tracks.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-50 overflow-hidden">
                            <div className="divide-y divide-zinc-50">
                                {ownedTracks.map(song => (
                                    <div key={song.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => setIsPlaying(isPlaying === song.id ? null : song.id)}
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isPlaying === song.id ? 'bg-primary text-white shadow-lg' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                                            >
                                                {isPlaying === song.id ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                            </button>
                                            <div>
                                                <h4 className="font-black text-deep text-lg">{song.title}</h4>
                                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">{song.artist} • {song.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <a
                                                href={song.audio_url}
                                                download
                                                className="p-3 bg-zinc-100 text-zinc-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                                                title="Download Track"
                                            >
                                                <Download size={20} />
                                            </a>
                                            <span className="text-xs font-black text-zinc-300">03:45</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'custom' && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-zinc-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Sparkles size={40} className="text-primary/20" />
                            </div>

                            <div className="text-center mb-12">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Gift size={40} className="text-primary" />
                                </div>
                                <h2 className="text-4xl font-black text-deep mb-4 tracking-tight">The Perfect Gift</h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                                    Fill out the details below and our AI Sound Team (Tanty & Suno) will craft a unique Caribbean song for your child's special day.
                                </p>
                            </div>

                            <form
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCustomInitiate();
                                }}
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Child's Name</label>
                                    <input placeholder="Who is the song for?" className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Event Type</label>
                                    <select className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep" required>
                                        <option value="birthday">1st Birthday</option>
                                        <option value="birthday_generic">Birthday (General)</option>
                                        <option value="graduation">Graduation</option>
                                        <option value="new_born">New Born Arrival</option>
                                        <option value="encouragement">Encouragement / First Day of School</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Special Instructions / Favorite Things</label>
                                    <textarea placeholder="Tell us about their favorite food, toy, or island. We'll weave it into the lyrics!" className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep h-32 resize-none" required />
                                </div>

                                <div className="md:col-span-2 pt-6">
                                    <button className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-lg">
                                        Send Request for $9.99 <ArrowRight size={24} />
                                    </button>
                                    <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-6">
                                        Secure Payment via Stripe/PayPal • delivered in 24-48 hours
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <PurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    productKey={selectedProduct}
                    contentId={selectedSong?.id}
                    contentTitle={selectedSong?.title}
                    onSuccess={handlePurchaseSuccess}
                />
            )}
        </div>
    );
}

function ArrowRight({ size }: { size: number }) {
    return <ChevronRight size={size} />;
}
