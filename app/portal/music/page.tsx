"use client";

import React, { useState, useRef } from 'react';
import {
    Music, Play, Pause, ChevronLeft,
    Heart, Sparkles, Gift, Crown, Star
} from 'lucide-react';
import Link from 'next/link';
import { RADIO_TRACKS, RADIO_CHANNELS } from '@/lib/constants';
import { AskAParentNotice } from '@/components/portal/AskAParentNotice';

// ── Channel metadata ──────────────────────────────────────────────────────────
const CHANNEL_META: Record<string, { emoji: string; color: string; bg: string }> = {
    roti:          { emoji: '🤖', color: 'text-blue-600',   bg: 'bg-blue-50'   },
    tanty_spice:   { emoji: '🌶️', color: 'text-orange-600', bg: 'bg-orange-50' },
    dilly_doubles: { emoji: '🎵', color: 'text-pink-600',   bg: 'bg-pink-50'   },
    steelpan_sam:  { emoji: '🥁', color: 'text-amber-600',  bg: 'bg-amber-50'  },
};

function formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicHub() {
    const [activeTab, setActiveTab] = useState<'music' | 'upgrade' | 'custom'>('music');
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [activeChannel, setActiveChannel] = useState<string>('all');

    // Custom song
    const [customChildName, setCustomChildName] = useState('');
    const [customEventType, setCustomEventType] = useState('birthday');
    const [customInstructions, setCustomInstructions] = useState('');
    const [customNote, setCustomNote] = useState<string | null>(null);

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

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCustomNote('A parent orders custom songs from their account. This page cannot take payment.');
    };

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
                            Play all 9 island tracks right now — or order a personalised song made just for your child, delivered in 24 hours.
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
                        { id: 'upgrade', label: 'Upgrade',     icon: Crown },
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

                        {/* Upgrade upsell */}
                        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Heart size={28} className="text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white leading-tight">More island music lives with a parent plan</h3>
                                    <p className="text-zinc-400 text-sm font-medium mt-1">Kids listen here. A parent unlocks more from their account.</p>
                                </div>
                            </div>
                            <AskAParentNotice className="text-white" />
                        </div>
                    </div>
                )}

                {/* ── UPGRADE TAB ── */}
                {activeTab === 'upgrade' && (
                    <div className="max-w-xl mx-auto rounded-[2rem] bg-white p-8 text-center shadow-xl">
                        <h2 className="text-3xl font-black text-zinc-900">Parents choose the plan</h2>
                        <AskAParentNotice className="mt-4 text-zinc-600" />
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
                                    Tell us about your Likkle Legend and our team will craft a unique Caribbean song with their name woven in. Delivered in 24–48 hours.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center mt-6">
                                    {['🎂 Birthday songs', '👶 New baby', '🏫 First day of school', '🎓 Graduation', '💛 Just because'].map(tag => (
                                        <span key={tag} className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-black">
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
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-400 transition-all font-bold text-zinc-900 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Occasion *</label>
                                    <select
                                        title="Occasion"
                                        value={customEventType}
                                        onChange={e => setCustomEventType(e.target.value)}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-400 transition-all font-bold text-zinc-900 outline-none"
                                        required
                                    >
                                        <option value="birthday_1st">1st Birthday</option>
                                        <option value="birthday">Birthday (General)</option>
                                        <option value="graduation">Graduation</option>
                                        <option value="new_born">New Baby Arrival</option>
                                        <option value="first_day">First Day of School</option>
                                        <option value="just_because">Just Because 💛</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Their Favourite Things *</label>
                                    <textarea
                                        value={customInstructions}
                                        onChange={e => setCustomInstructions(e.target.value)}
                                        placeholder="Tell us their favourite food, toy, island, cartoon character, or anything that makes them unique — we'll weave it into the lyrics!"
                                        className="w-full px-6 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-400 transition-all font-bold text-zinc-900 outline-none h-32 resize-none"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 text-lg"
                                    >
                                        <Gift size={24} /> Ask a parent
                                    </button>
                                    {customNote && <AskAParentNotice className="mt-4 text-center text-zinc-600" />}
                                </div>
                            </form>

                            {/* What you get */}
                            <div className="mt-12 pt-10 border-t border-zinc-100">
                                <h4 className="text-center text-xs font-black uppercase tracking-widest text-zinc-300 mb-6">What's Included</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { icon: '🎶', title: 'Personalised Lyrics', desc: "Their name & favourite things woven into every verse" },
                                        { icon: '🏝️', title: 'Caribbean Sound', desc: 'Steelpan, calypso & island rhythms — crafted for little ears' },
                                        { icon: '📥', title: 'MP3 Download', desc: 'High-quality audio file yours to keep forever' },
                                    ].map(({ icon, title, desc }) => (
                                        <div key={title} className="bg-zinc-50 rounded-2xl p-5 text-center">
                                            <div className="text-3xl mb-3">{icon}</div>
                                            <h5 className="font-black text-zinc-900 text-sm mb-1">{title}</h5>
                                            <p className="text-zinc-400 text-xs font-medium leading-relaxed">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
