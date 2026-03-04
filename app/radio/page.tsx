"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Radio, Sparkles, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildFreeFallbackTracks, RADIO_SEGMENTS } from "@/lib/radio-stations";

type StationTrack = {
    id: string;
    title: string;
    artist: string;
    url: string;
};

export default function FreeRadioPage() {
    const hosts = [
        { id: "tanty_spice", name: "Tanty Spice", image: "/images/tanty_spice_avatar.jpg" },
        { id: "roti", name: "R.O.T.I", image: "/images/roti-new.jpg" },
        { id: "dilly_doubles", name: "Dilly Doubles", image: "/images/dilly-doubles.jpg" },
        { id: "steelpan_sam", name: "Steelpan Sam", image: "/images/steelpan_sam.png" },
    ];

    const fallbackTracks = useMemo<StationTrack[]>(
        () =>
            buildFreeFallbackTracks().map((t) => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                url: t.url,
            })),
        []
    );
    const [tracks, setTracks] = useState<StationTrack[]>(fallbackTracks);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [segmentStatus, setSegmentStatus] = useState<Record<string, boolean>>({});

    const audioRef = useRef<HTMLAudioElement>(null);
    const [index, setIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const loadFreeTracks = async () => {
            try {
                const supabase = createClient();
                const { data: songs } = await supabase
                    .from("songs")
                    .select("id,title,artist,audio_url,metadata,is_active,display_order")
                    .eq("is_active", true)
                    .order("display_order", { ascending: true });

                const freeSongs = (songs || [])
                    .filter((song: any) => song.audio_url && !song.metadata?.is_premium)
                    .slice(0, 10)
                    .map((song: any) => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artist || "Likkle Legends",
                        url: song.audio_url,
                    }));

                if (freeSongs.length >= 10) {
                    setTracks(freeSongs);
                    return;
                }

                const ids = new Set(freeSongs.map((t: StationTrack) => t.id));
                const padded = [...freeSongs];
                for (const t of fallbackTracks) {
                    if (padded.length >= 10) break;
                    if (ids.has(t.id)) continue;
                    padded.push(t);
                }
                setTracks(padded.slice(0, 10));
            } catch {
                setTracks(fallbackTracks);
            }
        };

        const loadAccess = async () => {
            try {
                const supabase = createClient();
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session?.user?.id) {
                    setIsPremiumUser(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("subscription_tier,subscription_status")
                    .eq("id", session.user.id)
                    .single();

                const paidTier = profile?.subscription_tier && profile.subscription_tier !== "free";
                const activeStatus = ["active", "trialing"].includes(profile?.subscription_status || "");
                setIsPremiumUser(Boolean(paidTier && activeStatus));
            } catch {
                setIsPremiumUser(false);
            }
        };

        const loadSegments = async () => {
            try {
                const res = await fetch("/api/radio/stations", { cache: "no-store" });
                const json = await res.json();
                const map: Record<string, boolean> = {};
                for (const segment of json?.stations || []) {
                    map[segment.id] = Boolean(segment.configured);
                }
                setSegmentStatus(map);
            } catch {
                setSegmentStatus({});
            }
        };

        void loadFreeTracks();
        void loadAccess();
        void loadSegments();
    }, [fallbackTracks]);

    useEffect(() => {
        if (index >= tracks.length) {
            setIndex(0);
        }
    }, [index, tracks.length]);

    const safeTrack = tracks[index] || fallbackTracks[0];
    if (!safeTrack) return null;

    const current = safeTrack;
    const currentHost =
        hosts.find((h) => current.artist.toLowerCase().includes(h.name.toLowerCase().replace(/\./g, ""))) ||
        hosts.find((h) => current.artist.toLowerCase().includes(h.name.toLowerCase())) ||
        hosts[0];

    const play = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        try {
            await audio.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
        }
    };

    const pause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        setIsPlaying(false);
    };

    const next = () => setIndex((prev) => (prev + 1) % tracks.length);
    const prev = () => setIndex((prev) => (prev - 1 + tracks.length) % tracks.length);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-deep/70 hover:text-primary">
                        <ArrowLeft size={16} /> Back Home
                    </Link>
                    <span className="text-xs font-black uppercase tracking-widest text-primary/80">Free Station</span>
                </div>

                <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-5">
                        <Radio className="text-primary" />
                        <h1 className="text-3xl font-black text-deep">Likkle Legends Free Radio</h1>
                    </div>

                    <p className="text-deep/60 font-medium mb-8">
                        Enjoy a rotating 10-song loop. Upgrade for full premium DJ segments, more tracks, and exclusive drops.
                    </p>

                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-6">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Now Playing</p>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                <Image src={currentHost.image} alt={currentHost.name} fill className="object-cover" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-deep">{current.title}</h2>
                                <p className="text-sm font-bold text-primary/80">{current.artist}</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Track {index + 1} of {tracks.length}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {hosts.map((host) => (
                            <div key={host.id} className="bg-white border border-zinc-100 rounded-2xl p-3 text-center">
                                <div className="relative w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-primary/20">
                                    <Image src={host.image} alt={host.name} fill className="object-cover" />
                                </div>
                                <p className="text-xs font-black text-deep">{host.name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={prev} className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center" aria-label="Previous">
                            <SkipBack size={18} />
                        </button>
                        <button
                            onClick={isPlaying ? pause : play}
                            className="w-14 h-14 rounded-full bg-primary text-white hover:scale-105 transition-transform flex items-center justify-center"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                        </button>
                        <button onClick={next} className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center" aria-label="Next">
                            <SkipForward size={18} />
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        {tracks.map((track, i) => (
                            <button
                                key={track.id}
                                onClick={() => setIndex(i)}
                                className={`text-left p-3 rounded-xl border text-sm ${i === index ? "border-primary bg-primary/5" : "border-zinc-100 bg-white hover:bg-zinc-50"}`}
                            >
                                <p className="font-bold text-deep truncate">{track.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-3">
                        <Link href="/signup?plan=free" className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-deep text-white font-black">
                            <Sparkles size={16} /> Sign Up Free
                        </Link>
                        {isPremiumUser ? (
                            <Link href="/portal/radio" className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-black">
                                <Crown size={16} /> Open Premium Radio
                            </Link>
                        ) : (
                            <Link href="/signup?plan=legends_plus" className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-black">
                                <Crown size={16} /> Unlock Premium Radio
                            </Link>
                        )}
                    </div>

                    <div className="mt-6 bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Premium Live DJ Segments</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {RADIO_SEGMENTS.map((segment) => (
                                <div key={segment.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-sm font-black text-deep truncate">{segment.label}</p>
                                    <p className="text-[11px] text-zinc-500 font-bold mt-1">
                                        {segmentStatus[segment.id] ? "Live-capable" : "Config pending"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <audio
                key={current.id}
                ref={audioRef}
                src={current.url}
                onEnded={next}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoPlay={isPlaying}
            />
        </div>
    );
}
