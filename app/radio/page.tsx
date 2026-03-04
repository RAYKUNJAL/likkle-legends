"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Radio, Sparkles, Crown } from "lucide-react";
import { RADIO_TRACKS } from "@/lib/constants";

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

    const tracks = useMemo<StationTrack[]>(() => {
        const base = RADIO_TRACKS.slice(0, 9).map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            url: t.url,
        }));

        return [
            ...base,
            {
                id: "free-bonus-10",
                title: "Island Summer Mix",
                artist: "Likkle Legends Radio",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            },
        ];
    }, []);

    const audioRef = useRef<HTMLAudioElement>(null);
    const [index, setIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const current = tracks[index];
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
                        <Link href="/signup?plan=legends_plus" className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-black">
                            <Crown size={16} /> Unlock Premium Radio
                        </Link>
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
