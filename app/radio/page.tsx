"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isPlayableAudioUrl } from "@/lib/song-catalog";
import IslandRadio from "@/components/public/IslandRadio";
import type { Track } from "@/lib/types";

export default function FreeRadioPage() {
    const [extraTracks, setExtraTracks] = useState<Track[]>([]);

    const fallbackReady = useMemo(() => true, []);

    useEffect(() => {
        if (!fallbackReady) return;
        const loadFreeTracks = async () => {
            try {
                const supabase = createClient();
                const { data: songs } = await supabase
                    .from("songs")
                    .select("id,title,artist,audio_url,metadata,is_active,display_order")
                    .eq("is_active", true)
                    .order("display_order", { ascending: true });

                const freeSongs = (songs || [])
                    .filter((song: any) => isPlayableAudioUrl(song.audio_url) && !song.metadata?.is_premium)
                    .map((song: any) => {
                        const rawChannel = song.metadata?.channel || song.metadata?.segment || song.metadata?.category;
                        const artist = String(song.artist || "Likkle Legends").toLowerCase();
                        const channel = rawChannel || (
                            artist.includes("roti") ? "roti"
                            : artist.includes("dilly") ? "dilly_doubles"
                            : artist.includes("steelpan") ? "steelpan_sam"
                            : artist.includes("tanty") ? "tanty_spice"
                            : "tanty_spice"
                        );
                        return {
                            id: song.id,
                            title: song.title,
                            artist: song.artist || "Likkle Legends",
                            url: song.audio_url,
                            channel,
                        } as Track;
                    });
                setExtraTracks(freeSongs);
            } catch (_e) {
                setExtraTracks([]);
            }
        };
        void loadFreeTracks();
    }, [fallbackReady]);

    return (
        <div className="min-h-screen bg-[#fffaf0]">
            <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#51617b] hover:text-[#07898c]">
                        <ArrowLeft size={16} /> Back Home
                    </Link>
                    <span className="text-xs font-black uppercase tracking-widest text-[#07898c]">Free station</span>
                </div>
                <div className="mt-8 max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight text-[#102543] sm:text-5xl">Good tunes. Familiar faces. A little piece of home.</h1>
                    <p className="mt-4 text-lg text-[#51617b]">
                        Pick a character, choose a song, and sing along. We only list nursery rhymes we can actually play.
                    </p>
                </div>
            </div>
            <IslandRadio variant="station" extraTracks={extraTracks} />
            <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
                <div className="rounded-3xl border border-[#eadfcb] bg-white p-6 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-black text-[#102543]">Want a saved family library?</p>
                        <p className="mt-1 text-sm text-[#51617b]">Sign in to keep favorites in the portal. Public radio stays free right here.</p>
                    </div>
                    <Link href="/login?redirect=/portal/music" className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-[#102543] px-6 py-3 text-sm font-bold text-white sm:mt-0">
                        Sign in for my library
                    </Link>
                </div>
            </div>
        </div>
    );
}
