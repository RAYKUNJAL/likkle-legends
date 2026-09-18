'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    Loader2,
    Pause,
    Play,
    Radio,
    RotateCcw,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { getPlayableCatalogTracks } from '@/lib/song-catalog';
import type { Track } from '@/lib/types';

export type IslandRadioVariant = 'landing' | 'station' | 'member';

type Station = {
    id: string;
    name: string;
    shortName: string;
    image: string;
    note: string;
};

const ALL_STATIONS: Station[] = [
    { id: 'roti', name: 'R.O.T.I. Learning Lab', shortName: 'R.O.T.I.', image: '/images/roti-new.jpg', note: 'Healthy habits & little discoveries' },
    { id: 'tanty_spice', name: 'Tanty Spice Show', shortName: 'Tanty Spice', image: '/images/tanty_spice_avatar.jpg', note: 'Everyday learning & sing-along favorites' },
    { id: 'dilly_doubles', name: 'Dilly Vibes', shortName: 'Dilly Doubles', image: '/images/dilly-doubles.jpg', note: 'Playful songs for curious little minds' },
    { id: 'steelpan_sam', name: 'Steelpan Sam Stage', shortName: 'Steelpan Sam', image: '/images/steelpan_sam.png', note: 'Island animals & joyful rhythms' },
];

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function isSameTrack(a: Track, b: Track) {
    return a.id === b.id || a.url === b.url;
}

export default function IslandRadio({
    variant = 'landing',
    extraTracks = [],
}: {
    variant?: IslandRadioVariant;
    extraTracks?: Track[];
}) {
    const catalogTracks = useMemo(() => getPlayableCatalogTracks(), []);
    const tracks = useMemo(() => {
        const merged: Track[] = [];
        const seen = new Set<string>();
        for (const track of [...catalogTracks, ...extraTracks]) {
            if (!track.url || seen.has(track.id) || seen.has(track.url)) continue;
            merged.push(track);
            seen.add(track.id);
            seen.add(track.url);
        }
        return merged;
    }, [catalogTracks, extraTracks]);

    const stations = useMemo(
        () => ALL_STATIONS.filter((station) => tracks.some((track) => track.channel === station.id)),
        [tracks]
    );

    const [activeStationId, setActiveStationId] = useState(stations[0]?.id || '');
    const [currentId, setCurrentId] = useState(tracks[0]?.id || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useEffect(() => {
        if (!stations.some((station) => station.id === activeStationId)) {
            setActiveStationId(stations[0]?.id || '');
        }
    }, [stations, activeStationId]);

    const stationTracks = tracks.filter((track) => track.channel === activeStationId);
    const current = stationTracks.find((track) => track.id === currentId) || stationTracks[0] || tracks[0];
    const station = stations.find((item) => item.id === activeStationId) || stations[0];

    useEffect(() => {
        if (!stationTracks.some((track) => track.id === currentId) && stationTracks[0]) {
            setCurrentId(stationTracks[0].id);
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [activeStationId, stationTracks, currentId]);

    const playTrack = async (track: Track) => {
        const audio = audioRef.current;
        if (!audio) return;
        setError(null);
        if (!isSameTrack(track, current || track)) {
            setCurrentId(track.id);
            setCurrentTime(0);
        }
        try {
            setIsBuffering(true);
            if (audio.src !== new URL(track.url, window.location.origin).href && !track.url.startsWith('http')) {
                audio.src = track.url;
            } else if (audio.getAttribute('src') !== track.url) {
                audio.src = track.url;
            }
            await audio.play();
            setIsPlaying(true);
        } catch (_e) {
            setIsPlaying(false);
            setError('This song could not start. Try again or pick another playable track.');
        } finally {
            setIsBuffering(false);
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio || !current) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }
        void playTrack(current);
    };

    const skip = (dir: -1 | 1) => {
        if (!stationTracks.length) return;
        const index = Math.max(0, stationTracks.findIndex((track) => track.id === current?.id));
        const next = stationTracks[(index + dir + stationTracks.length) % stationTracks.length];
        void playTrack(next);
    };

    const headingId = `${variant}-radio-heading`;
    const ctaHref = variant === 'member' ? '/portal/songs' : '/radio';
    const ctaLabel = variant === 'member' ? 'Explore my music library' : variant === 'station' ? 'Stay on Island Radio' : 'Explore Island Radio';

    if (!tracks.length || !station || !current) {
        return (
            <section id="radio" className="scroll-mt-[100px] bg-[#fffaf0] px-5 py-16 text-[#102543] sm:px-8 sm:py-20">
                <div className="mx-auto max-w-xl text-center">
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0a8b8d]/20 bg-[#e8f5ef] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087c7c]">
                        <Radio size={16} aria-hidden /> Likkle Legends Island Radio
                    </p>
                    <h2 className="text-4xl font-black tracking-tight">Radio is quiet right now</h2>
                    <p className="mt-4 text-[#51617b]">We only list songs we can actually stream. Nothing playable is online at the moment.</p>
                </div>
            </section>
        );
    }

    const status = error
        ? 'Playback unavailable'
        : isBuffering
            ? isPlaying ? 'Buffering your song...' : 'Loading your song...'
            : isPlaying
                ? `Now playing: ${current.title}`
                : 'Choose a song and press play';

    return (
        <section id="radio" aria-labelledby={headingId} className="scroll-mt-[100px] overflow-hidden bg-[#fffaf0] px-5 py-16 text-[#102543] sm:px-8 sm:py-20">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                <div>
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0a8b8d]/20 bg-[#e8f5ef] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087c7c]">
                        <Radio size={16} aria-hidden /> Likkle Legends Island Radio
                    </p>
                    <h2 id={headingId} className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                        Little voices.<br />
                        <span className="text-[#07898c]">Big island rhythms.</span>
                    </h2>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-[#51617b]">
                        Caribbean nursery rhymes, learning songs and sing-along adventures. {tracks.length} playable {tracks.length === 1 ? 'song' : 'songs'} right now — we only show tracks we can stream.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[#51617b]">
                        {['Healthy habits', 'Money skills', 'Island rhythms'].map((tag) => (
                            <span key={tag} className="rounded-full border border-[#eadfcb] bg-white/70 px-3 py-2">{tag}</span>
                        ))}
                    </div>
                    {variant === 'station' ? (
                        <p className="mt-8 text-sm font-bold text-[#51617b]">Listen right here. No sign-up needed.</p>
                    ) : (
                        <Link
                            href={ctaHref}
                            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4d63] px-6 py-3 font-bold text-white shadow-[0_6px_18px_#ff4d6325] transition-colors hover:bg-[#e83c54]"
                        >
                            {ctaLabel} <ArrowRight size={18} aria-hidden />
                        </Link>
                    )}
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#51617b]">
                        <Radio size={15} aria-hidden />
                        {variant === 'member' ? 'Choose a host, press play, and sing along.' : 'Listen to a song right here. No sign-up needed.'}
                    </p>
                </div>

                <div className="min-w-0 rounded-[2rem] border border-[#eadfcb] bg-white p-5 shadow-[0_16px_40px_#10254312] sm:p-6">
                    <div className="mb-3 flex items-end justify-between gap-3">
                        <p className="text-sm font-black text-[#102543]">Pick your station</p>
                        <span className="text-xs font-semibold text-[#64748b]">Meet your hosts</span>
                    </div>
                    <div role="tablist" aria-label="Island Radio stations" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {stations.map((item, index) => {
                            const count = tracks.filter((track) => track.channel === item.id).length;
                            const selected = item.id === activeStationId;
                            return (
                                <button
                                    key={item.id}
                                    ref={(el) => { tabRefs.current[index] = el; }}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() => setActiveStationId(item.id)}
                                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-bold transition-colors ${
                                        selected
                                            ? 'border-[#07898c] bg-[#e8f5ef] text-[#066f71]'
                                            : 'border-[#e6e9e4] bg-[#fcfcf9] text-[#51617b] hover:border-[#07898c]/40 hover:bg-[#f3f8f5]'
                                    }`}
                                >
                                    <span className="relative block h-16 w-16 overflow-hidden rounded-2xl bg-white">
                                        <Image src={item.image} alt="" fill sizes="64px" className="object-contain" />
                                    </span>
                                    {item.shortName}
                                    <span className="text-[10px] font-medium">{count} {count === 1 ? 'song' : 'songs'}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5">
                        <div className="relative overflow-hidden rounded-2xl bg-[#102543] p-5 text-white sm:p-6">
                            <div className="relative flex items-center gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold uppercase leading-relaxed tracking-[0.12em] text-[#80d9ce]">{station.name}</p>
                                    <h3 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">{current.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#c2cddd]">{station.note}</p>
                                </div>
                                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-white/20 bg-[#fffaf0] shadow-lg sm:h-40 sm:w-40">
                                    <Image src={station.image} alt={`${station.shortName}, your station host`} fill sizes="(max-width: 640px) 112px, 160px" className="object-contain p-1" />
                                </div>
                            </div>

                            <div className="relative mt-6">
                                <label htmlFor={`${variant}-seek`} className="sr-only">Playback position</label>
                                <input
                                    id={`${variant}-seek`}
                                    type="range"
                                    min={0}
                                    max={duration || 1}
                                    step={0.1}
                                    value={Math.min(currentTime, duration || 1)}
                                    disabled={!duration}
                                    onChange={(e) => {
                                        const next = Number(e.target.value);
                                        if (audioRef.current && duration) {
                                            audioRef.current.currentTime = next;
                                            setCurrentTime(next);
                                        }
                                    }}
                                    className="h-6 w-full cursor-pointer accent-[#70d3c4] disabled:cursor-default disabled:opacity-50"
                                />
                                <div className="flex justify-between text-xs tabular-nums text-[#c2cddd]">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="relative mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button type="button" onClick={() => skip(-1)} disabled={stationTracks.length < 2} aria-label="Previous song" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40">
                                        <SkipBack size={21} aria-hidden />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={togglePlay}
                                        aria-label={isPlaying ? 'Pause song' : 'Play song'}
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ffcf5b] text-[#102543] shadow-lg transition-colors hover:bg-[#ffde87]"
                                    >
                                        {isBuffering ? <Loader2 size={25} className="animate-spin" aria-hidden /> : isPlaying ? <Pause size={25} fill="currentColor" aria-hidden /> : <Play size={25} fill="currentColor" className="ml-1" aria-hidden />}
                                    </button>
                                    <button type="button" onClick={() => skip(1)} disabled={stationTracks.length < 2} aria-label="Next song" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40">
                                        <SkipForward size={21} aria-hidden />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (audioRef.current) audioRef.current.muted = !isMuted;
                                        setIsMuted((value) => !value);
                                    }}
                                    aria-label={isMuted ? 'Unmute song' : 'Mute song'}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                                >
                                    {isMuted ? <VolumeX size={21} aria-hidden /> : <Volume2 size={21} aria-hidden />}
                                </button>
                            </div>
                            <p role="status" aria-live="polite" className="relative mt-3 min-h-4 text-xs text-[#c2cddd]">{status}</p>
                        </div>

                        {error && (
                            <div role="alert" className="mt-3 rounded-xl border border-[#ffd4d8] bg-[#fff1f2] p-3 text-sm text-[#9c2440]">
                                <p>{error}</p>
                                <button type="button" onClick={() => current && void playTrack(current)} className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-bold underline underline-offset-4">
                                    <RotateCcw size={15} aria-hidden /> Retry song
                                </button>
                            </div>
                        )}

                        <ol aria-label={`${station.name} songs`} className="mt-3 space-y-1">
                            {stationTracks.map((track, index) => {
                                const active = track.id === current.id;
                                return (
                                    <li key={track.id}>
                                        <button
                                            type="button"
                                            onClick={() => (active ? togglePlay() : void playTrack(track))}
                                            className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                                                active ? 'bg-[#e8f5ef] text-[#066f71]' : 'text-[#51617b] hover:bg-[#f6f8f6]'
                                            }`}
                                        >
                                            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                                                {active && isPlaying ? <Pause size={13} fill="currentColor" /> : String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="min-w-0 flex-1 text-sm font-bold leading-snug">{track.title}</span>
                                            <span className="shrink-0 text-[10px] font-semibold text-[#64748b]">{track.artist}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>
            </div>

            {current && (
                <audio
                    ref={audioRef}
                    src={current.url}
                    preload="metadata"
                    onLoadedMetadata={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlaying={() => { setIsPlaying(true); setIsBuffering(false); setError(null); }}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setIsBuffering(true)}
                    onCanPlay={() => setIsBuffering(false)}
                    onEnded={() => skip(1)}
                    onError={() => {
                        setIsPlaying(false);
                        setError('This song could not start. Try again or pick another playable track.');
                    }}
                />
            )}
        </section>
    );
}
