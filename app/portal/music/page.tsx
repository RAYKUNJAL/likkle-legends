"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Music, ShoppingBag, Download, Star, Sparkles,
    Gift, Play, Pause, ChevronRight, ChevronLeft, Clock,
    Heart, AudioLines, Package, Zap, Globe, CheckCircle2, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/storage';
import PurchaseModal from '@/components/MusicStore/PurchaseModal';

interface Song {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    category: string;
    duration_seconds?: number;
    metadata?: {
        is_premium?: boolean;
        price?: number;
    };
}

type Category = 'all' | 'story' | 'lullaby' | 'culture' | 'learning' | 'calm';

// Swap this URL for your real demo MP3 when it's ready.
// Leave as '' to hide the demo player until then.
const DEMO_SONG_URL = '';

function formatDuration(seconds?: number): string {
    if (!seconds || seconds === 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ParentMusicHub() {
    const [activeTab, setActiveTab] = useState<'market' | 'library' | 'custom'>('market');
    const [songs, setSongs] = useState<Song[]>([]);
    const [purchases, setPurchases] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<Category>('all');

    // Audio
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isDemoPlaying, setIsDemoPlaying] = useState(false);

    // Purchase Modal
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [customMetadata, setCustomMetadata] = useState<any>(null);

    // Custom song form state
    const [customChildName, setCustomChildName] = useState('');
    const [customEventType, setCustomEventType] = useState('birthday');
    const [customInstructions, setCustomInstructions] = useState('');

    // Bundle picker state
    const [isBundlePickerOpen, setIsBundlePickerOpen] = useState(false);
    const [bundleSelectedIds, setBundleSelectedIds] = useState<string[]>([]);

    // Custom song orders for library
    const [customOrders, setCustomOrders] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: allSongs } = await supabase
                .from('songs')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            setSongs(allSongs || []);

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const [{ data: myPurchases }, { data: myCustomOrders }] = await Promise.all([
                    supabase
                        .from('purchased_content')
                        .select('content_id')
                        .eq('user_id', session.user.id),
                    supabase
                        .from('custom_song_orders')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false }),
                ]);

                setPurchases(myPurchases?.map(p => p.content_id).filter(Boolean) || []);
                setCustomOrders(myCustomOrders || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = (song: Song) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying === song.id) {
            audio.pause();
            setIsPlaying(null);
        } else {
            audio.src = song.audio_url;
            audio.play().catch(() => toast.error('Could not play this track.'));
            setIsPlaying(song.id);
            setIsDemoPlaying(false);
        }
    };

    const handleDemoPlay = () => {
        const audio = audioRef.current;
        if (!audio || !DEMO_SONG_URL) return;

        if (isDemoPlaying) {
            audio.pause();
            setIsDemoPlaying(false);
        } else {
            audio.src = DEMO_SONG_URL;
            audio.play().catch(() => toast.error('Could not play demo.'));
            setIsDemoPlaying(true);
            setIsPlaying(null);
        }
    };

    const handlePurchaseInitiate = (song: Song) => {
        setSelectedSong(song);
        setSelectedProduct('single_track');
        setCustomMetadata(null);
        setIsPurchaseModalOpen(true);
    };

    const handleBundleInitiate = () => {
        setBundleSelectedIds([]);
        setIsBundlePickerOpen(true);
    };

    const toggleBundleSong = (id: string) => {
        setBundleSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : prev.length < 5 ? [...prev, id] : prev
        );
    };

    const handleBundleConfirm = () => {
        setIsBundlePickerOpen(false);
        setSelectedSong(null);
        setSelectedProduct('track_bundle_5');
        setCustomMetadata({ selectedSongIds: bundleSelectedIds });
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = () => {
        if (selectedSong) {
            setPurchases(prev => [...prev, selectedSong.id]);
        }
        setIsPurchaseModalOpen(false);
        toast.success('Purchase successful! Added to your library.');
        loadData();
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSelectedSong(null);
        setSelectedProduct('custom_song_request');
        setCustomMetadata({
            child_name: customChildName,
            event_type: customEventType,
            special_instructions: customInstructions,
        });
        setIsPurchaseModalOpen(true);
    };

    const premiumTracks = songs.filter(s => s.metadata?.is_premium && !purchases.includes(s.id));
    const ownedTracks = songs.filter(s => purchases.includes(s.id) || !s.metadata?.is_premium);

    const filteredPremiumTracks = activeCategory === 'all'
        ? premiumTracks
        : premiumTracks.filter(s => s.category === activeCategory);

    const CATEGORIES: { id: Category; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'story', label: 'Story' },
        { id: 'lullaby', label: 'Lullaby' },
        { id: 'culture', label: 'Culture' },
        { id: 'learning', label: 'Learning' },
        { id: 'calm', label: 'Calm' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCF6] pb-20">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onEnded={() => { setIsPlaying(null); setIsDemoPlaying(false); }}
                onError={() => {
                    toast.error('Could not load audio.');
                    setIsPlaying(null);
                    setIsDemoPlaying(false);
                }}
            />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#FF9D00] to-[#FF6B00] pt-12 pb-28 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl" />
                <div className="container mx-auto relative">
                    <Link
                        href="/portal"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm mb-8 transition-colors group"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Portal
                    </Link>
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
                            <Star size={12} className="fill-white" /> 500+ Families Streaming Daily
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tighter">
                            Give Your Likkle Legend a<br />
                            <span className="italic underline decoration-wavy decoration-yellow-300">Soundtrack for Life.</span>
                        </h1>
                        <p className="text-white/85 text-lg font-medium mb-10 leading-relaxed max-w-2xl">
                            Premium Caribbean music, stories & lullabies — crafted by island voices, built for little ears. Own tracks forever for just <strong className="text-white">$0.99</strong>, or commission a personalised song made just for your child.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => { setActiveTab('market'); }}
                                className="px-8 py-4 bg-white text-[#FF6B00] rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-sm"
                            >
                                <ShoppingBag size={18} /> Browse Tracks — $0.99 each
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className="px-8 py-4 bg-black/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black/30 transition-all text-sm"
                            >
                                <Gift size={18} /> Custom Song — $24.99
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Strip */}
            <div className="container mx-auto px-6 -mt-6 mb-4 relative z-10">
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {[
                        { icon: <Music size={14} />, label: 'Own it forever' },
                        { icon: <Gift size={14} />, label: 'Perfect as a gift' },
                        { icon: <Globe size={14} />, label: 'Caribbean-made' },
                        { icon: <CheckCircle2 size={14} />, label: 'Child-safe & ad-free' },
                    ].map(({ icon, label }) => (
                        <span key={label} className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-full text-xs font-black text-deep border border-zinc-100">
                            <span className="text-primary">{icon}</span> {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Tab Bar */}
            <div className="container mx-auto -mt-4 px-6 mb-0">
                <div className="bg-white rounded-3xl p-2 shadow-xl border border-zinc-100 flex items-center max-w-fit gap-2">
                    {[
                        { id: 'market', label: 'Market', icon: ShoppingBag },
                        { id: 'library', label: 'My Library', icon: AudioLines },
                        { id: 'custom', label: 'Custom Song', icon: Sparkles }
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

            {/* Content */}
            <div className="container mx-auto px-6 py-10">

                {/* ── MARKET TAB ── */}
                {activeTab === 'market' && (
                    <div className="space-y-10 animate-fade-in">

                        {/* Bundle Upsell Banner */}
                        <div className="bg-gradient-to-r from-deep to-deep/80 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Package size={32} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Best Value</p>
                                    <h3 className="text-2xl font-black text-white leading-tight">5 Tracks for $3.99</h3>
                                    <p className="text-white/60 text-sm font-medium">Save $0.96 vs buying individually. Perfect starter library.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleBundleInitiate}
                                className="flex-shrink-0 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-primary/40 flex items-center gap-3 whitespace-nowrap"
                            >
                                <Zap size={18} /> Grab the Bundle
                            </button>
                        </div>

                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-deep">Premium Tracks</h2>
                                <p className="text-zinc-400 font-medium">Own high-quality Caribbean education tracks forever — $0.99 each.</p>
                            </div>
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${activeCategory === cat.id
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                        : 'bg-white text-zinc-400 border-zinc-200 hover:border-primary hover:text-primary'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Track Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-zinc-100 rounded-[2.5rem] h-72 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredPremiumTracks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPremiumTracks.map(song => (
                                    <div key={song.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-zinc-50 group hover:scale-[1.02] transition-all">
                                        <div className="relative h-44 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-3xl mb-6 overflow-hidden flex items-center justify-center border border-zinc-50">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-primary transform group-hover:scale-110 transition-transform">
                                                <Music size={36} />
                                            </div>
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                                    {song.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-black text-deep group-hover:text-primary transition-colors leading-tight">{song.title}</h3>
                                                <p className="text-zinc-400 text-sm font-medium mt-1">{song.artist}</p>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <Clock size={14} />
                                                    <span className="text-xs font-bold">{formatDuration(song.duration_seconds)}</span>
                                                </div>
                                                <button
                                                    onClick={() => handlePurchaseInitiate(song)}
                                                    className="px-6 py-3 bg-deep text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:shadow-lg transition-all"
                                                >
                                                    Unlock $0.99
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Music size={32} className="text-primary" />
                                </div>
                                <h3 className="text-xl font-black text-deep mb-2">More Tracks Dropping Soon</h3>
                                <p className="text-zinc-400 font-medium mb-6">New Caribbean sounds are on their way. In the meantime, grab the bundle!</p>
                                <button
                                    onClick={handleBundleInitiate}
                                    className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Get 5 Tracks for $3.99
                                </button>
                            </div>
                        )}

                        {/* Subscription Upsell */}
                        <div className="bg-gradient-to-r from-primary/10 to-orange-50 border border-primary/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Heart size={28} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-deep">Upgrade to Legends Club</h3>
                                    <p className="text-zinc-500 text-sm font-medium">Get every track, story & game included — from $4.99/mo.</p>
                                </div>
                            </div>
                            <Link
                                href="/parent"
                                className="flex-shrink-0 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 whitespace-nowrap"
                            >
                                Upgrade & Save <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── LIBRARY TAB ── */}
                {activeTab === 'library' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-3xl font-black text-deep">My Music Library</h2>
                            <p className="text-zinc-400 font-medium">Stream or download your unlocked tracks.</p>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="bg-zinc-100 rounded-2xl h-20 animate-pulse" />)}
                            </div>
                        ) : ownedTracks.length > 0 ? (
                            <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-50 overflow-hidden">
                                <div className="divide-y divide-zinc-50">
                                    {ownedTracks.map(song => (
                                        <div key={song.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <button
                                                    onClick={() => handlePlay(song)}
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isPlaying === song.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                                                >
                                                    {isPlaying === song.id ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
                                                </button>
                                                <div>
                                                    <h4 className="font-black text-deep text-lg leading-tight">{song.title}</h4>
                                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{song.artist} · {song.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-zinc-300">{formatDuration(song.duration_seconds)}</span>
                                                <a
                                                    href={song.audio_url}
                                                    download
                                                    className="p-3 bg-zinc-100 text-zinc-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                                                    title="Download Track"
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
                                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <AudioLines size={32} className="text-zinc-300" />
                                </div>
                                <h3 className="text-xl font-black text-deep mb-2">Your Library is Empty</h3>
                                <p className="text-zinc-400 font-medium mb-6">Unlock your first track from the marketplace to get started.</p>
                                <button
                                    onClick={() => setActiveTab('market')}
                                    className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Browse Tracks
                                </button>
                            </div>
                        )}

                        {/* Custom Song Orders in Library */}
                        {customOrders.length > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-deep">Custom Songs</h3>
                                    <p className="text-zinc-400 text-sm font-medium">Songs ordered specially for your Likkle Legend.</p>
                                </div>
                                <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-50 overflow-hidden">
                                    <div className="divide-y divide-zinc-50">
                                        {customOrders.map(order => {
                                            const STATUS_STYLES: Record<string, string> = {
                                                paid: 'bg-yellow-50 text-yellow-600',
                                                in_progress: 'bg-blue-50 text-blue-600',
                                                delivered: 'bg-green-50 text-green-600',
                                            };
                                            const STATUS_LABELS: Record<string, string> = {
                                                paid: 'In Queue',
                                                in_progress: 'Being Made',
                                                delivered: 'Ready',
                                            };
                                            return (
                                                <div key={order.id} className="p-6 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Gift size={24} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-deep text-base leading-tight">
                                                                Song for {order.child_name || 'Your Legend'}
                                                            </h4>
                                                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5 capitalize">
                                                                {(order.event_type || 'Custom').replace(/_/g, ' ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-zinc-100 text-zinc-400'}`}>
                                                            {STATUS_LABELS[order.status] || order.status}
                                                        </span>
                                                        {order.final_audio_url && (
                                                            <a
                                                                href={order.final_audio_url}
                                                                download
                                                                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                                                title="Download Your Song"
                                                            >
                                                                <Download size={18} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CUSTOM ORDERS TAB ── */}
                {activeTab === 'custom' && (
                    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">

                        {/* Demo Song Player — hidden until DEMO_SONG_URL is set */}
                        {DEMO_SONG_URL && (
                            <div className="bg-gradient-to-br from-[#FF9D00] to-[#FF6B00] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-3">Real Example · Made by Our Team</p>
                                    <h3 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                                        Hear Your Child's Name<br />in a Song
                                    </h3>
                                    <p className="text-white/80 font-medium mb-8 max-w-lg leading-relaxed">
                                        This is exactly what we create — a personalised Caribbean track with your child's name woven into every verse. Press play and imagine it's theirs.
                                    </p>

                                    {/* Player */}
                                    <div className="flex items-center gap-6 bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                                        <button
                                            onClick={handleDemoPlay}
                                            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#FF6B00] shadow-xl hover:scale-105 transition-all flex-shrink-0"
                                        >
                                            {isDemoPlaying
                                                ? <Pause size={28} />
                                                : <Play size={28} className="ml-1" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-lg leading-tight">"Happy Birthday, Amara!"</p>
                                            <p className="text-white/70 text-sm font-medium mt-0.5">Likkle Legends Music Team · Caribbean Pop</p>
                                        </div>
                                        {isDemoPlaying && (
                                            <div className="flex items-end gap-0.5 h-8 flex-shrink-0">
                                                {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1.5 bg-white/70 rounded-full animate-bounce"
                                                        style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms` }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-white/60 text-sm font-medium mt-6 italic text-center">
                                        "Imagine hearing your child's name in a song like this on their birthday morning."
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-zinc-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Sparkles size={80} className="text-primary" />
                            </div>

                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Gift size={40} className="text-primary" />
                                </div>
                                <h2 className="text-4xl font-black text-deep mb-3 tracking-tight">A Song Made Just for Them</h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                                    Tell us about your Likkle Legend and our AI Sound Team — Tanty & Suno — will craft a unique Caribbean song personalised to your child. Delivered in 24–48 hours.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center mt-6">
                                    {['Birthday songs', 'New baby arrivals', 'First day of school', 'Graduation', 'Just because'].map(tag => (
                                        <span key={tag} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-7" onSubmit={handleCustomSubmit}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Child's Name *</label>
                                    <input
                                        value={customChildName}
                                        onChange={e => setCustomChildName(e.target.value)}
                                        placeholder="Who is this song for?"
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Occasion *</label>
                                    <select
                                        value={customEventType}
                                        onChange={e => setCustomEventType(e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep outline-none"
                                        required
                                    >
                                        <option value="birthday_1st">1st Birthday</option>
                                        <option value="birthday">Birthday (General)</option>
                                        <option value="graduation">Graduation</option>
                                        <option value="new_born">New Baby Arrival</option>
                                        <option value="first_day">First Day of School / Encouragement</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Their Favourite Things *</label>
                                    <textarea
                                        value={customInstructions}
                                        onChange={e => setCustomInstructions(e.target.value)}
                                        placeholder="Tell us their favourite food, toy, island, cartoon character, or anything that makes them unique — we'll weave it into the lyrics!"
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-deep outline-none h-32 resize-none"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-lg"
                                    >
                                        <Gift size={24} /> Order Custom Song — $24.99
                                    </button>
                                    <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-5">
                                        Secure Payment via PayPal · Delivered in 24–48 hours · 100% Satisfaction
                                    </p>
                                </div>
                            </form>

                            {/* What you get */}
                            <div className="mt-12 pt-10 border-t border-zinc-100">
                                <h4 className="text-center text-xs font-black uppercase tracking-widest text-zinc-300 mb-6">What's Included</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { icon: <Music size={20} />, title: 'Personalised Lyrics', desc: "Your child's name & favourite things woven into every verse" },
                                        { icon: <Sparkles size={20} />, title: 'Caribbean Sound', desc: 'Steelpan, calypso & island rhythms — crafted by our AI composers' },
                                        { icon: <Download size={20} />, title: 'MP3 Download', desc: 'High-quality audio file yours to keep and play forever' },
                                    ].map(({ icon, title, desc }) => (
                                        <div key={title} className="bg-zinc-50 rounded-2xl p-5 text-center">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary">{icon}</div>
                                            <h5 className="font-black text-deep text-sm mb-1">{title}</h5>
                                            <p className="text-zinc-400 text-xs font-medium leading-relaxed">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bundle Song Picker Modal */}
            {isBundlePickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-7 border-b border-zinc-100 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">5-Track Bundle · $3.99</p>
                                <h2 className="text-2xl font-black text-deep leading-tight">Pick Your 5 Tracks</h2>
                                <p className="text-zinc-400 text-sm font-medium mt-1">
                                    Choose any 5 from the catalogue. {bundleSelectedIds.length}/5 selected.
                                </p>
                            </div>
                            <button onClick={() => setIsBundlePickerOpen(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 flex-shrink-0">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Song List */}
                        <div className="overflow-y-auto flex-1 p-4">
                            {songs.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400 font-medium">
                                    No tracks available yet — check back soon!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {songs.map(song => {
                                        const isSelected = bundleSelectedIds.includes(song.id);
                                        const isOwned = purchases.includes(song.id);
                                        const isDisabled = !isSelected && bundleSelectedIds.length >= 5;
                                        return (
                                            <button
                                                key={song.id}
                                                disabled={isOwned || isDisabled}
                                                onClick={() => !isOwned && toggleBundleSong(song.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                    isOwned
                                                        ? 'border-zinc-100 bg-zinc-50 opacity-40 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                            : isDisabled
                                                                ? 'border-zinc-100 bg-white opacity-40 cursor-not-allowed'
                                                                : 'border-zinc-100 bg-white hover:border-primary/40 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                                    {isSelected ? <CheckCircle2 size={20} /> : <Music size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-deep text-sm leading-tight truncate">{song.title}</p>
                                                    <p className="text-xs text-zinc-400 font-medium mt-0.5 truncate">{song.artist} · <span className="capitalize">{song.category}</span></p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {isOwned && <span className="text-[10px] font-black text-zinc-300 uppercase">Owned</span>}
                                                    <span className="text-xs font-bold text-zinc-300">{formatDuration(song.duration_seconds)}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div className="p-6 border-t border-zinc-100">
                            <button
                                onClick={handleBundleConfirm}
                                disabled={bundleSelectedIds.length !== 5}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                <Package size={18} />
                                {bundleSelectedIds.length === 5 ? 'Checkout — $3.99' : `Select ${5 - bundleSelectedIds.length} more track${5 - bundleSelectedIds.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Modal */}
            {selectedProduct && (
                <PurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    productKey={selectedProduct}
                    contentId={selectedSong?.id}
                    contentTitle={selectedSong?.title}
                    onSuccess={handlePurchaseSuccess}
                    metadata={customMetadata}
                />
            )}
        </div>
    );
}
