'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, Radio } from 'lucide-react';
import { RADIO_CHANNELS } from '@/lib/constants';
import { getPlayableTracks } from '@/lib/song-catalog';

export default function ListenPage() {
    const tracks = getPlayableTracks();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const toggle = (id: string, url: string) => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playingId === id) {
            audio.pause();
            setPlayingId(null);
            return;
        }
        audio.src = url;
        audio.play().then(() => setPlayingId(id)).catch(() => setPlayingId(null));
    };

    return (
        <div className="min-h-screen bg-[#FDF8EE] text-slate-900">
            <div className="mx-auto max-w-3xl px-4 py-10">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600">
                    <ArrowLeft size={16} /> Back home
                </Link>

                <div className="mt-6 flex items-center gap-3">
                    <Radio className="text-orange-500" />
                    <h1 className="text-3xl font-black">Explore Music</h1>
                </div>
                <p className="mt-3 text-slate-600 font-medium">
                    {tracks.length} recovered island {tracks.length === 1 ? 'track' : 'tracks'} you can play right now.
                    No sign-up needed. Dead Suno/GCS rows are not listed.
                </p>

                <div className="mt-8 space-y-3">
                    {tracks.map((track) => {
                        const channel = RADIO_CHANNELS.find((ch) => ch.id === track.channel);
                        const playing = playingId === track.id;
                        return (
                            <div key={track.id} className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggle(track.id, track.url)}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white"
                                    aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                                >
                                    {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                                </button>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-black">{track.title}</p>
                                    <p className="truncate text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {channel?.icon} {track.artist} · {channel?.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/radio" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">
                        Open Island Radio
                    </Link>
                    <Link href="/portal/music" className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white">
                        Music Hub / Custom Song
                    </Link>
                </div>
            </div>
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} onError={() => setPlayingId(null)} />
        </div>
    );
}
