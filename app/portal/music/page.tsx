"use client";

import React, { useState, useRef } from 'react';
import {
    Music, Play, Pause, ChevronLeft,
    Sparkles, Gift, Star
} from 'lucide-react';
import Link from 'next/link';
import { RADIO_TRACKS, RADIO_CHANNELS } from '@/lib/constants';

// ── Channel metadata ──────────────────────────────────────────────────────────
const CHANNEL_META: Record<string, { emoji: string; color: string; bg: string }> = {
    roti:          { emoji: '🤖', color: 'text-blue-600',   bg: 'bg-blue-50'   },
    tanty_spice:   { emoji: '🌶️', color: 'text-orange-600', bg: 'bg-orange-50' },
    dilly_doubles: { emoji: '🎵', color: 'text-pink-600',   bg: 'bg-pink-50'   },
    steelpan_sam:  { emoji: '🥁', color: 'text-amber-600',  bg: 'bg-amber-50'  },
};

export default function MusicHub() {
    const [activeTab, setActiveTab] = useState<'music' | 'custom'>('music');
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [activeChannel, setActiveChannel] = useState<string>('all');

    const audioRef = useRef<HTMLAudioElement>(null);

    const handlePlay = (trackId: string, url: string) => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying === trackId) {
            audio.pause();
            setIsPlaying(null);
        } else {
            audio.src = url;
            audio.play().catch(() => setIsPlaying(null));
            setIsPlaying(trackId);
        }
    };

    const filteredTracks = activeChannel === 'all'
        ? RADIO_TRACKS
        : RADIO_TRACKS.filter(t => t.channel === activeChannel);

    return (
        <div className="min-h-screen bg-[#FDFCF6] pb-24">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(null)}
                onError={() => setIsPlaying(null)}
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
                            <Star size={12} className="fill-white" /> Caribbean Music for Little Legends
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tighter">
                            Likkle Legends<br />
                            <span className="italic underline decoration-wavy decoration-yellow-300">Music Hub</span>
                        </h1>
                        <p className="text-white/85 text-lg font-medium mb-10 leading-relaxed max-w-2xl">
                            Listen free. These are the songs we have on file.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setActiveTab('music')}
                                className="px-8 py-4 bg-white text-[#FF6B00] rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-sm"
                            >
                                <Music size={18} /> Listen Now — Free
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className="px-8 py-4 bg-black/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black/30 transition-all text-sm"
                            >
                                <Gift size={18} /> Custom Song
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Bar */}
            <div className="container mx-auto px-6 -mt-6 mb-0 relative z-10">
                <div className="bg-white rounded-3xl p-2 shadow-xl border border-zinc-100 flex items-center max-w-fit gap-2">
                    {[
                        { id: 'music',   label: 'Music Hub',   icon: Music },
                        { id: 'custom',  label: 'Custom Song', icon: Sparkles },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30'
                                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50'
                                }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="container mx-auto px-6 py-10">

                {/* ── MUSIC HUB TAB ── */}
                {activeTab === 'music' && (
                    <div className="space-y-8 animate-fade-in">

                        {/* Now Playing bar */}
                        {isPlaying && (() => {
                            const track = RADIO_TRACKS.find(t => t.id === isPlaying);
                            const meta = CHANNEL_META[track?.channel || ''] || { emoji: '🎵', color: 'text-orange-600', bg: 'bg-orange-50' };
                            return track ? (
                                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl min-w-[320px] max-w-[90vw]">
                                    <span className="text-2xl">{meta.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm truncate">{track.title}</p>
                                        <p className="text-zinc-400 text-xs font-medium truncate">{track.artist}</p>
                                    </div>
                                    <div className="flex items-end gap-0.5 h-6 mx-2 flex-shrink-0">
                                        <div className="w-1 h-3 bg-orange-500 rounded-full animate-bounce" />
                                        <div className="w-1 h-5 bg-orange-500 rounded-full animate-bounce delay-75" />
                                        <div className="w-1 h-4 bg-orange-500 rounded-full animate-bounce delay-100" />
                                        <div className="w-1 h-6 bg-orange-500 rounded-full animate-bounce delay-150" />
                                        <div className="w-1 h-3 bg-orange-500 rounded-full animate-bounce delay-200" />
                                        <div className="w-1 h-5 bg-orange-500 rounded-full animate-bounce delay-300" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePlay(isPlaying, track.url)}
                                        className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-400 transition-colors flex-shrink-0"
                                        aria-label="Pause"
                                    >
                                        <Pause size={18} />
                                    </button>
                                </div>
                            ) : null;
                        })()}

                        {/* Channel filter */}
                        <div className="flex flex-wrap gap-2">
                            {[{ id: 'all', label: 'All Tracks', emoji: '🎶' }, ...RADIO_CHANNELS.map(ch => ({ id: ch.id, label: ch.label, emoji: CHANNEL_META[ch.id]?.emoji || '🎵' }))].map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => setActiveChannel(ch.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                                        activeChannel === ch.id
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                                            : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700'
                                    }`}
                                >
                                    <span>{ch.emoji}</span> {ch.label}
                                </button>
                            ))}
                        </div>

                        {/* Track list */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden">
                            {filteredTracks.length === 0 ? (
                                <div className="py-20 text-center text-zinc-400 font-medium">No tracks in this channel yet.</div>
                            ) : (
                                <div className="divide-y divide-zinc-50">
                                    {filteredTracks.map((track, i) => {
                                        const meta = CHANNEL_META[track?.channel || ''] || { emoji: '🎵', color: 'text-orange-600', bg: 'bg-orange-50' };
                                        const playing = isPlaying === track.id;
                                        return (
                                            <div
                                                key={track.id}
                                                className={`flex items-center gap-4 px-6 py-5 transition-colors ${playing ? 'bg-orange-50' : 'hover:bg-zinc-50/60'}`}
                                            >
                                                {/* Track number */}
                                                <span className="text-[11px] font-black text-zinc-300 tabular-nums w-5 text-right flex-shrink-0">
                                                    {playing ? <Pause size={14} className="text-orange-500 mx-auto" /> : i + 1}
                                                </span>

                                                {/* Play button */}
                                                <button
                                                    onClick={() => handlePlay(track.id, track.url)}
                                                    aria-label={playing ? 'Pause' : 'Play'}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                                                        playing
                                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                            : `${meta.bg} ${meta.color} hover:bg-orange-500 hover:text-white`
                                                    }`}
                                                >
                                                    {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                                                </button>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-black text-base leading-tight truncate ${playing ? 'text-orange-600' : 'text-zinc-900'}`}>
                                                        {track.title}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                                                        {meta.emoji} {track.artist}
                                                    </p>
                                                </div>

                                                {/* Channel badge */}
                                                <span className={`hidden sm:block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0 ${meta.bg} ${meta.color}`}>
                                                    {RADIO_CHANNELS.find(c => c.id === track.channel)?.label || track.channel}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* ── CUSTOM SONG TAB ── */}
                {activeTab === 'custom' && (
                    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-zinc-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles size={100} className="text-orange-500" />
                            </div>

                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                                    🎤
                                </div>
                                <h2 className="text-4xl font-black text-zinc-900 mb-3 tracking-tight">A Song Made Just for Them</h2>
                                <p className="text-zinc-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                                    A parent can ask for a custom Caribbean kids song from the parent dashboard. This page cannot take a payment.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center mt-6">
                                    {['🎂 Birthday songs', '👶 New baby', '🏫 First day of school', '🎓 Graduation', '💛 Just because'].map(tag => (
                                        <span key={tag} className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-black">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <p className="text-center text-sm font-bold text-zinc-500">Ask a parent. Buying is not available on this page.</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
