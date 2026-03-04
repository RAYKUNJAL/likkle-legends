"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Radio as RadioIcon, Sparkles, Mic2, Broadcast, Music4 } from 'lucide-react';
import TantyRadio from '@/components/TantyRadio';

export default function RadioPortalPage() {
    const [nowPlaying, setNowPlaying] = React.useState<string>('Connecting to station...');

    React.useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await fetch('/api/radio/now-playing', { cache: 'no-store' });
                const json = await res.json();
                if (!active) return;
                if (!json?.success) {
                    setNowPlaying('AzuraCast relay not configured yet');
                    return;
                }
                const first = Array.isArray(json.data) ? json.data[0] : json.data;
                const title = first?.now_playing?.song?.title || first?.now_playing?.song?.text || 'Live';
                setNowPlaying(title);
            } catch {
                if (active) setNowPlaying('Unable to load live station');
            }
        };
        void load();
        return () => { active = false; };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="font-heading font-black text-2xl text-blue-950 flex items-center gap-2">
                                <RadioIcon className="text-orange-500 animate-pulse" />
                                Likkle Legends Radio
                            </h1>
                            <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">Core Audio World: DJ Segments Live</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                        <Sparkles size={14} /> Enter the Radio World
                    </span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-blue-950 mb-4">Likkle Legends Radio</h2>
                    <p className="text-lg text-blue-900/60 max-w-2xl mx-auto mb-6">
                        Four hosts. Four shows. One living audio world for your family.
                        Tune into segments by Tanty Spice, R.O.T.I, Dilly Doubles, and Steelpan Sam.
                    </p>
                    <Link href="/portal/store" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-transform">
                        <Sparkles size={18} /> Visit Music Store
                    </Link>
                </div>

                <div className="relative">
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10" />
                    <TantyRadio />
                </div>

                <div className="mt-24 grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[3rem] p-10 border-4 border-orange-50 shadow-xl">
                        <h3 className="text-2xl font-heading font-black text-blue-950 mb-4 flex items-center gap-3">
                            <Mic2 className="text-orange-500" /> Host Segments
                        </h3>
                        <p className="text-blue-900/60 font-medium mb-6">
                            Each DJ has their own voice lane and energy: storytelling, learning drops, hype mixes,
                            and steelpan rhythm sessions.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Tanty Spice', 'R.O.T.I', 'Dilly Doubles', 'Steelpan Sam'].map((host) => (
                                <span key={host} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">{host}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                        <h3 className="text-2xl font-heading font-black mb-4 flex items-center gap-3 relative z-10">
                            <Broadcast className="text-white" /> AzuraCast Ready
                        </h3>
                        <p className="text-white/80 font-medium mb-6 relative z-10">
                            This hub is structured for station-grade streaming. Next step: connect each host segment
                            to dedicated AzuraCast playlists and live schedules.
                        </p>
                        <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-4 relative z-10">
                            Now Playing: {nowPlaying}
                        </p>
                        <Link href="/portal?sec=songs" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                            <Music4 size={16} /> Explore All Music
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
