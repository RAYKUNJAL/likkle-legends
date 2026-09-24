'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import {
    LIKKLE_AUDIO_EVENT,
    LIKKLE_RADIO_SOURCE,
    LIKKLE_RADIO_STATIONS,
    announceLikkleAudio,
    buildLikkleRadioPlaylists,
    getLikkleRadioDj,
    stationPlaylistNote,
    stepTrack,
    type LikkleRadioTrack,
} from '@/lib/likkle-radio';
import styles from './LikkleRadioPlayer.module.css';

type LikkleRadioPlayerProps = {
    /** Fires after a real track starts. The player itself never shows a price. */
    onTrackStarted?: (trackId: string) => void;
};

function formatTime(seconds: number) {
    const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export default function LikkleRadioPlayer({ onTrackStarted }: LikkleRadioPlayerProps = {}) {
    const uid = useId();
    const playlists = useMemo(() => buildLikkleRadioPlaylists(), []);
    const stations = useMemo(
        () => LIKKLE_RADIO_STATIONS.flatMap((station) => {
            const dj = getLikkleRadioDj(station.djId);
            return dj ? [{ station, dj }] : [];
        }),
        [],
    );
    const firstReady = stations.find((entry) => (playlists[entry.station.id] ?? []).length > 0) ?? stations[0];
    const initialSrcRef = useRef<string | null>(null);
    if (initialSrcRef.current === null) {
        initialSrcRef.current = (firstReady && playlists[firstReady.station.id]?.[0]?.url) || '';
    }

    const audioRef = useRef<HTMLAudioElement>(null);
    const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
    const playAttemptRef = useRef(0);
    const wantsPlaybackRef = useRef(false);
    const onTrackStartedRef = useRef(onTrackStarted);
    const activeTrackRef = useRef<LikkleRadioTrack | undefined>(firstReady ? playlists[firstReady.station.id]?.[0] : undefined);
    const [stationId, setStationId] = useState(firstReady?.station.id ?? 'sing-along');
    const [trackIndex, setTrackIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [reduceMotion, setReduceMotion] = useState(false);

    const current = stations.find((entry) => entry.station.id === stationId) ?? stations[0];
    const playlist = current ? playlists[current.station.id] ?? [] : [];
    const activeTrack = playlist[trackIndex] ?? playlist[0];
    activeTrackRef.current = activeTrack;
    onTrackStartedRef.current = onTrackStarted;
    const note = stationPlaylistNote(playlist.length);

    const clearAudio = useCallback(() => {
        playAttemptRef.current += 1;
        wantsPlaybackRef.current = false;
        activeTrackRef.current = undefined;
        const audio = audioRef.current;
        audio?.pause();
        if (audio?.getAttribute('src')) {
            audio.removeAttribute('src');
            audio.load();
        }
        setPlaying(false);
        setLoading(false);
        setPosition(0);
        setDuration(0);
    }, []);

    const startTrack = useCallback(async (track: LikkleRadioTrack, shouldPlay: boolean) => {
        const audio = audioRef.current;
        if (!audio) return;
        const attempt = ++playAttemptRef.current;
        wantsPlaybackRef.current = shouldPlay;
        activeTrackRef.current = track;
        setError(null);
        const loaded = audio.getAttribute('src');
        if (loaded !== track.url) {
            audio.pause();
            audio.src = track.url;
            audio.load();
            setPosition(0);
            setDuration(0);
            setPlaying(false);
        } else if (shouldPlay && audio.ended) {
            audio.currentTime = 0;
            setPosition(0);
        }
        setLoading(shouldPlay && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
        if (!shouldPlay) {
            audio.pause();
            setPlaying(false);
            return;
        }
        try {
            await audio.play();
            if (attempt !== playAttemptRef.current) return;
            setPlaying(true);
            setLoading(false);
            announceLikkleAudio(LIKKLE_RADIO_SOURCE);
            onTrackStartedRef.current?.(track.id);
        } catch (cause) {
            if (attempt !== playAttemptRef.current) return;
            if (cause instanceof Error && cause.name === 'AbortError') return;
            wantsPlaybackRef.current = false;
            setPlaying(false);
            setLoading(false);
            setError(cause instanceof Error && cause.name === 'NotAllowedError'
                ? 'Tap play to start the song.'
                : 'This song could not load. Try again, or pick another station.');
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            playAttemptRef.current += 1;
            wantsPlaybackRef.current = false;
            audio?.pause();
        };
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => setReduceMotion(media.matches);
        apply();
        media.addEventListener('change', apply);
        return () => media.removeEventListener('change', apply);
    }, []);

    useEffect(() => {
        const onOther = (event: Event) => {
            const source = (event as CustomEvent<{ source?: string }>).detail?.source;
            if (source === LIKKLE_RADIO_SOURCE) return;
            playAttemptRef.current += 1;
            wantsPlaybackRef.current = false;
            audioRef.current?.pause();
            setPlaying(false);
            setLoading(false);
        };
        window.addEventListener(LIKKLE_AUDIO_EVENT, onOther);
        return () => window.removeEventListener(LIKKLE_AUDIO_EVENT, onOther);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
        audio.muted = muted || volume === 0;
    }, [volume, muted]);

    useEffect(() => {
        const index = stations.findIndex((entry) => entry.station.id === stationId);
        const tab = tabsRef.current[index];
        const scroller = tab?.parentElement;
        if (!tab || !scroller) return;
        const left = tab.offsetLeft - (scroller.clientWidth / 2) + (tab.clientWidth / 2);
        scroller.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [stationId, stations, reduceMotion]);

    if (!current) return null;
    const { station, dj } = current;

    function togglePlayback() {
        const audio = audioRef.current;
        const track = activeTrackRef.current;
        if (!audio || !track) return;
        if (wantsPlaybackRef.current || !audio.paused) {
            playAttemptRef.current += 1;
            wantsPlaybackRef.current = false;
            audio.pause();
            setPlaying(false);
            setLoading(false);
            return;
        }
        void startTrack(track, true);
    }

    function selectStation(nextId: string) {
        if (nextId === stationId) return;
        const nextPlaylist = playlists[nextId] ?? [];
        const keepPlaying = wantsPlaybackRef.current;
        setStationId(nextId);
        setTrackIndex(0);
        setPosition(0);
        setDuration(0);
        setError(null);
        const next = nextPlaylist[0];
        if (!next) {
            clearAudio();
            return;
        }
        void startTrack(next, keepPlaying);
    }

    function moveStation(direction: -1 | 1) {
        const index = stations.findIndex((entry) => entry.station.id === stationId);
        const next = stations[stepTrack(index, stations.length, direction)];
        if (next) selectStation(next.station.id);
    }

    function moveTrack(direction: -1 | 1) {
        if (!playlist.length) return;
        const nextIndex = stepTrack(trackIndex, playlist.length, direction);
        const next = playlist[nextIndex];
        if (!next) return;
        if (next.id === activeTrack?.id && audioRef.current) {
            audioRef.current.currentTime = 0;
            setPosition(0);
        }
        setTrackIndex(nextIndex);
        void startTrack(next, true);
    }

    function onStationKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!offset && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        const index = stations.findIndex((entry) => entry.station.id === stationId);
        const nextIndex = event.key === 'Home'
            ? 0
            : event.key === 'End'
                ? stations.length - 1
                : stepTrack(index, stations.length, offset as -1 | 1);
        const next = stations[nextIndex];
        if (!next) return;
        selectStation(next.station.id);
        tabsRef.current[nextIndex]?.focus();
    }

    const status = error
        ? 'Playback unavailable'
        : !playlist.length
            ? `${dj.name} is ready. More songs coming on ${station.name}.`
            : loading
                ? 'Loading your song...'
                : playing
                    ? `Playing ${activeTrack?.title} on ${station.name}`
                    : `${activeTrack?.title} is ready on ${station.name}`;

    return (
        <div className={`${styles.player} ${playing ? styles.playing : ''}`}>
            <div className={styles.top}>
                <p className={styles.brand}>
                    <span className={styles.brandMark} aria-hidden="true" />
                    Likkle Radio
                </p>
                <p className={`${styles.badge} ${playing ? styles.badgeOn : ''}`}>
                    <span className={styles.bars} aria-hidden="true"><i /><i /><i /></span>
                    {playing ? 'On air' : 'Ready'}
                    <span className={styles.srOnly}>{playing ? 'Recorded song playing' : 'Paused'}</span>
                </p>
            </div>

            <div className={styles.dialRow}>
                <button type="button" className={styles.nudge} onClick={() => moveStation(-1)} aria-label="Previous station">
                    <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <div
                    role="tablist"
                    aria-label="Likkle Radio stations"
                    aria-orientation="horizontal"
                    className={styles.dial}
                    onKeyDown={onStationKeyDown}
                >
                    {stations.map(({ station: item, dj: host }, index) => {
                        const count = (playlists[item.id] ?? []).length;
                        const selected = item.id === stationId;
                        const itemNote = stationPlaylistNote(count);
                        return (
                            <button
                                key={item.id}
                                ref={(node) => { tabsRef.current[index] = node; }}
                                type="button"
                                role="tab"
                                id={`${uid}-tab-${item.id}`}
                                aria-selected={selected}
                                aria-controls={`${uid}-panel`}
                                tabIndex={selected ? 0 : -1}
                                data-station={item.id}
                                onClick={() => selectStation(item.id)}
                                className={styles.station}
                            >
                                <span className={styles.avatar} style={{ backgroundColor: host.color }}>
                                    <Image
                                        src={host.image}
                                        alt=""
                                        fill
                                        sizes="68px"
                                        loading={selected ? 'eager' : 'lazy'}
                                    />
                                </span>
                                <span className={styles.stationName}>{item.shortName}</span>
                                <span className={styles.srOnly}>
                                    {`${host.name}. ${item.name}. ${itemNote.primary}`}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <button type="button" className={styles.nudge} onClick={() => moveStation(1)} aria-label="Next station">
                    <ChevronRight size={22} aria-hidden="true" />
                </button>
            </div>

            <div
                id={`${uid}-panel`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${station.id}`}
                className={styles.stage}
            >
                <div className={styles.now}>
                    <div className={styles.art} style={{ backgroundColor: dj.color }}>
                        <Image
                            src={activeTrack?.artwork || dj.image}
                            alt={`${dj.name}, DJ for ${station.name}`}
                            fill
                            sizes="(max-width: 640px) 116px, 152px"
                        />
                    </div>
                    <div className={styles.meta}>
                        <p className={styles.theme}>{station.theme}</p>
                        <h3 className={styles.stationTitle}>{station.name}</h3>
                        <p className={styles.djLine}>DJ {dj.name}</p>
                        <p className={styles.intro}>{station.intro}</p>
                    </div>
                </div>

                <div className={styles.trackBlock}>
                    <p className={styles.kicker}>{playlist.length ? 'Now playing' : 'This station'}</p>
                    <p className={styles.songTitle}>{activeTrack?.title ?? 'More songs coming'}</p>
                    {activeTrack && <p className={styles.artist}>{activeTrack.artist}</p>}
                    <p className={styles.note}>
                        {note.primary}
                        {note.moreComing && playlist.length > 0 ? ' More songs coming.' : ''}
                    </p>
                </div>

                <div className={styles.seek}>
                    <label htmlFor={`${uid}-seek`} className={styles.srOnly}>Playback position</label>
                    <input
                        id={`${uid}-seek`}
                        type="range"
                        min={0}
                        max={duration || 1}
                        step={0.1}
                        value={Math.min(position, duration || 1)}
                        disabled={!duration}
                        aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
                        onChange={(event) => {
                            const next = Number(event.target.value);
                            if (audioRef.current && duration) {
                                audioRef.current.currentTime = next;
                                setPosition(next);
                            }
                        }}
                    />
                    <div className={styles.times} aria-hidden="true">
                        <span>{formatTime(position)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.transport}>
                        <button type="button" className={styles.iconButton} onClick={() => moveTrack(-1)} disabled={!playlist.length} aria-label="Previous song">
                            <SkipBack size={22} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={styles.playButton}
                            onClick={togglePlayback}
                            disabled={!activeTrack}
                            aria-label={playing || loading ? `Pause ${activeTrack?.title ?? 'song'}` : `Play ${activeTrack?.title ?? 'song'}`}
                        >
                            {loading
                                ? <Loader2 size={28} className={reduceMotion ? undefined : 'animate-spin'} aria-hidden="true" />
                                : playing
                                    ? <Pause size={28} fill="currentColor" aria-hidden="true" />
                                    : <Play size={28} fill="currentColor" aria-hidden="true" />}
                        </button>
                        <button type="button" className={styles.iconButton} onClick={() => moveTrack(1)} disabled={!playlist.length} aria-label="Next song">
                            <SkipForward size={22} aria-hidden="true" />
                        </button>
                    </div>
                    <div className={styles.volume}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
                            aria-pressed={muted || volume === 0}
                            onClick={() => {
                                const audio = audioRef.current;
                                const nextMuted = !(muted || volume === 0);
                                if (nextMuted) {
                                    setMuted(true);
                                    if (audio) audio.muted = true;
                                    return;
                                }
                                const restored = volume > 0 ? volume : 0.8;
                                setMuted(false);
                                setVolume(restored);
                                if (audio) {
                                    audio.muted = false;
                                    audio.volume = restored;
                                }
                            }}
                        >
                            {muted || volume === 0 ? <VolumeX size={22} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
                        </button>
                        <label htmlFor={`${uid}-volume`} className={styles.srOnly}>Volume</label>
                        <input
                            id={`${uid}-volume`}
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={muted ? 0 : volume}
                            aria-valuetext={muted || volume === 0 ? 'Muted' : `${Math.round(volume * 100)} percent`}
                            onChange={(event) => {
                                const next = Number(event.target.value);
                                setVolume(next);
                                setMuted(next === 0);
                                const audio = audioRef.current;
                                if (audio) {
                                    audio.volume = next;
                                    audio.muted = next === 0;
                                }
                            }}
                        />
                    </div>
                </div>
                <p role="status" aria-live="polite" className={styles.srOnly}>{status}</p>
            </div>

            {playlist.length > 0 && (
                <ol className={styles.playlist} aria-label={`${station.name} songs`}>
                    {playlist.map((track, index) => {
                        const selected = track.id === activeTrack?.id;
                        return (
                            <li key={track.id}>
                                <button
                                    type="button"
                                    className={styles.songButton}
                                    aria-current={selected ? 'true' : undefined}
                                    aria-label={`${selected && (playing || loading) ? 'Pause' : 'Play'} ${track.title}`}
                                    onClick={() => {
                                        if (selected) {
                                            togglePlayback();
                                            return;
                                        }
                                        setTrackIndex(index);
                                        void startTrack(track, true);
                                    }}
                                >
                                    <span className={styles.songIndex} aria-hidden="true">
                                        {selected && playing ? <Pause size={12} fill="currentColor" /> : String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className={styles.songLabel}>{track.title}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            )}

            {error && (
                <div role="alert" className={styles.error}>
                    <p>{error}</p>
                    <button type="button" className={styles.retry} onClick={() => { if (activeTrack) void startTrack(activeTrack, true); }}>
                        Try again
                    </button>
                </div>
            )}

            <p className={styles.srOnly}>Recorded songs from the Likkle Legends library.</p>

            <audio
                ref={audioRef}
                preload="metadata"
                src={initialSrcRef.current || undefined}
                onLoadedMetadata={(event) => {
                    if (!activeTrackRef.current) return;
                    const value = event.currentTarget.duration;
                    setDuration(Number.isFinite(value) ? value : 0);
                }}
                onDurationChange={(event) => {
                    if (!activeTrackRef.current) return;
                    const value = event.currentTarget.duration;
                    setDuration(Number.isFinite(value) ? value : 0);
                }}
                onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
                onPlaying={(event) => {
                    if (!event.currentTarget.paused && wantsPlaybackRef.current) {
                        setPlaying(true);
                        setLoading(false);
                    }
                }}
                onPause={(event) => {
                    if (event.currentTarget.paused) setPlaying(false);
                }}
                onWaiting={() => {
                    if (wantsPlaybackRef.current) setLoading(true);
                }}
                onEnded={() => {
                    if (wantsPlaybackRef.current) moveTrack(1);
                }}
                onError={(event) => {
                    const audio = event.currentTarget;
                    if (!audio.error || audio.error.code === MediaError.MEDIA_ERR_ABORTED || !audio.getAttribute('src')) return;
                    playAttemptRef.current += 1;
                    wantsPlaybackRef.current = false;
                    setPlaying(false);
                    setLoading(false);
                    setError('This song could not load. Try again, or pick another station.');
                }}
            />
        </div>
    );
}
