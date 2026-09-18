'use client';

import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import IslandRadio from '@/components/public/IslandRadio';
import { getPlayableCatalogSongs } from '@/lib/song-catalog';

export default function PublicListenPage() {
    const songs = getPlayableCatalogSongs();

    return (
        <div className="min-h-screen bg-[#fffaf0]">
            <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#51617b] hover:text-[#07898c]">
                    <ArrowLeft size={16} /> Back Home
                </Link>
                <div className="mt-8 max-w-2xl">
                    <p className="text-xs font-black uppercase tracking-widest text-[#07898c]">Public music preview</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight text-[#102543] sm:text-5xl">
                        Explore Music — no login needed
                    </h1>
                    <p className="mt-4 text-lg text-[#51617b]">
                        These are the island songs we can actually stream today. Sign in later to save favorites in your family library.
                    </p>
                </div>
            </div>

            <IslandRadio variant="station" />

            <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
                <h2 className="text-xl font-black text-[#102543]">Playable catalog</h2>
                <p className="mt-2 text-sm text-[#51617b]">
                    {songs.length} owned {songs.length === 1 ? 'track' : 'tracks'}. Dead CDN links are not listed.
                </p>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {songs.map((song) => (
                        <li key={song.id} className="rounded-3xl border border-[#eadfcb] bg-white p-5">
                            <p className="font-black text-[#102543]">{song.title}</p>
                            <p className="text-sm font-bold text-[#51617b]">{song.artist}</p>
                            <audio className="mt-4 w-full" controls preload="none" src={song.url}>
                                <track kind="captions" />
                            </audio>
                        </li>
                    ))}
                </ul>

                <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Music made for you</p>
                    <h3 className="mt-1 text-2xl font-black">Custom Song — $24.99</h3>
                    <p className="mt-2 max-w-xl text-white/85">A real Caribbean song with your child’s name. Not a fake catalog track.</p>
                    <Link
                        href="/login?redirect=/portal/music#custom"
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-600"
                    >
                        <Gift size={16} /> Order after sign-in
                    </Link>
                </div>
            </div>
        </div>
    );
}
