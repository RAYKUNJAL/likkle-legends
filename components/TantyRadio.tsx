"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Track } from '../lib/types';
import { BRAND_NAME, RADIO_CHANNELS, RADIO_TRACKS as DEFAULT_TRACKS } from '../lib/constants';
import { getGlobalAudioContext, kickstartMobileAudio, narrateText } from '../services/geminiService';
import { getGlobalPlaylist } from '../services/storageService';

interface TantyRadioProps {
    isLite?: boolean;
    featuredTracks?: Track[];   // If provided, skips DB fetch and uses these tracks directly
    defaultChannel?: string;    // Channel to activate on mount
}

const DJ_SNIPPETS: Record<string, string[]> = {
    tanty_spice: ["Eh-eh!", "Mmm-hmmm!", "Irie!", "Bless up, family!", "Turn up de tunes!"],
    roti: ["Systems green.", "Ready to learn!", "Legend mode activated.", "Math and rhythm together!"],
    dilly_doubles: ["Energy up!", "Big flavor, big vibes!", "Dance break incoming!", "We outside!"],
    steelpan_sam: ["Feel de rhythm.", "Tap the pan and follow me.", "Heartbeat on tempo.", "Steelpan magic time!"],
};

const TantyRadio: React.FC<TantyRadioProps> = ({ isLite = false, featuredTracks, defaultChannel }) => {
    // Start empty to prevent flash of defaults if user has cleared playlist
    const [allTracks, setAllTracks] = useState<Track[]>(featuredTracks ?? []);
    const [isInitializing, setIsInitializing] = useState(!featuredTracks);
    const [activeChannel, setActiveChannel] = useState(defaultChannel ?? RADIO_CHANNELS[0]?.id ?? 'tanty_spice');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isNarrating, setIsNarrating] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const snippetSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        // If featuredTracks were passed as props, skip DB fetch entirely
        if (featuredTracks) return;

        const fetchMusic = async () => {
            try {
                const customTracks = await getGlobalPlaylist();
                // Strict check: if customTracks is not null (even if empty array), use it.
                // Only use DEFAULT_TRACKS if customTracks is explicitly null (never configured).
                if (customTracks && customTracks.length > 0) {
                    setAllTracks(customTracks);
                } else {
                    console.log("No custom tracks found, using defaults");
                    setAllTracks(DEFAULT_TRACKS);
                }
            } catch (e) {
                console.warn("Failed to fetch playlist", e);
                setAllTracks(DEFAULT_TRACKS);
            } finally {
                setIsInitializing(false);
            }
        };
        fetchMusic();
    }, []);

    // Only show channels that actually have tracks — prevents "No Track Loaded" on empty channels
    const availableChannels = RADIO_CHANNELS.filter(ch => allTracks.some(t => t.channel === ch.id));

    // Auto-correct active channel if it has no tracks (e.g. default 'story' with no story tracks)
    const resolvedChannel = allTracks.some(t => t.channel === activeChannel)
        ? activeChannel
        : (availableChannels[0]?.id ?? activeChannel);

    const channelTracks = allTracks.filter(t => t.channel === resolvedChannel);
    const activeSegment = RADIO_CHANNELS.find((segment) => segment.id === resolvedChannel) ?? RADIO_CHANNELS[0];
    const safeIndex = currentTrackIndex >= channelTracks.length ? 0 : currentTrackIndex;
    const currentTrack = channelTracks[safeIndex]; // Can be undefined if list empty
    const isVideo = currentTrack?.url?.toLowerCase().includes('.mp4') || currentTrack?.url?.includes('video');

    useEffect(() => {
        setHasError(false);
        setLoadingStatus('');
        setIsPlaying(false);
        setRetryCount(0);
    }, [currentTrack?.id]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted, currentTrack?.id]);

    const stopVisualizer = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const setupVisualizer = async () => {
        if (!audioRef.current || isVideo || mediaSourceRef.current) return;

        // Skip Web Audio connection for cross-origin tracks.
        // createMediaElementSource on a cross-origin element throws SecurityError
        // which silently captures the element and sends audio to a disconnected
        // destination — resulting in the player showing "playing" but no sound.
        const trackUrl = currentTrack?.url || '';
        const isCrossOrigin = trackUrl.startsWith('http') && !trackUrl.startsWith(window.location.origin);
        if (isCrossOrigin) {
            // Still draw the idle visualizer animation, just no frequency data
            stopVisualizer();
            drawVisualizer();
            return;
        }

        try {
            const ctx = getGlobalAudioContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const analyzer = ctx.createAnalyser();
            // Wrap in try/catch because some browsers (Safari) or HMR might still complain
            try {
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyzer);
                analyzer.connect(ctx.destination);
                mediaSourceRef.current = source;
            } catch (authErr) {
                console.warn("Audio node connection already exists - ignoring", authErr);
            }

            analyzer.fftSize = 256;
            analyzerRef.current = analyzer;

            stopVisualizer();
            drawVisualizer();
        } catch (e) {
            console.warn("Visualizer setup failed:", e);
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current) return;
        if (!analyzerRef.current) {
            // Cross-origin: draw idle sparkle animation only
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const sparkle = () => {
                animationFrameRef.current = requestAnimationFrame(sparkle);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < 20; i++) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    ctx.beginPath();
                    ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            };
            sparkle();
            return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyzer = analyzerRef.current;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            animationFrameRef.current = requestAnimationFrame(render);
            analyzer.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            if (!isPlaying && !isNarrating) {
                for (let i = 0; i < 20; i++) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const size = Math.random() * 2;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                return;
            }

            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, '#00B48B'); // Teal
            gradient.addColorStop(0.5, '#FFBB00'); // Gold
            gradient.addColorStop(1, '#FF6B00'); // Orange

            ctx.fillStyle = gradient;

            const barCount = bufferLength / 1.5;
            const barWidth = (width / barCount) / 2;

            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i];
                const percent = value / 255;
                const barHeight = Math.max(4, percent * height * 0.9);

                const xPosRight = (width / 2) + (i * barWidth);
                const xPosLeft = (width / 2) - (i * barWidth) - barWidth;
                const yPos = height - barHeight;

                ctx.shadowBlur = percent * 20;
                ctx.shadowColor = percent > 0.8 ? '#FB8500' : '#00B4D8';

                ctx.beginPath();
                ctx.roundRect(xPosRight + 1, yPos, barWidth - 2, barHeight, [4, 4, 0, 0]);
                ctx.roundRect(xPosLeft + 1, yPos, barWidth - 2, barHeight, [4, 4, 0, 0]);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        };
        render();
    };

    const togglePlay = async () => {
        if (!navigator.onLine) {
            setHasError(true);
            setLoadingStatus("Offline - Check Connection");
            return;
        }

        await kickstartMobileAudio();
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement) return;

        if (isPlaying) {
            mediaElement.pause();
            setIsPlaying(false);
            return;
        }

        if (hasError) { handleNextTrack(); return; }

        // Start play immediately — don't block on visualizer setup
        // This eliminates the "laggy" pause between tap and audio starting
        if (!isVideo) setupVisualizer(); // fire-and-forget

        try {
            const ctx = getGlobalAudioContext();
            if (ctx.state === 'suspended') ctx.resume(); // fire-and-forget

            const playPromise = mediaElement.play();
            if (playPromise !== undefined) {
                setIsPlaying(true); // optimistic — instant button feedback
                playPromise.catch((err) => {
                    console.error("[RADIO] Playback failed:", err);
                    setIsPlaying(false);
                    setHasError(true);
                    setLoadingStatus(err.message?.includes('supported sources') ? "Format Not Supported" : "Playback Error");
                });
            }
        } catch (err) {
            console.error("[RADIO] Play error:", err);
            setIsPlaying(false);
            setHasError(true);
        }
    };

    const handleNextTrack = () => {
        if (channelTracks.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % channelTracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(false);
    };

    const handlePrevTrack = () => {
        if (channelTracks.length === 0) return;
        const prevIndex = (currentTrackIndex - 1 + channelTracks.length) % channelTracks.length;
        setCurrentTrackIndex(prevIndex);
        setIsPlaying(false);
    };

    const handleMediaError = (e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
        const target = e.currentTarget;
        const error = target.error;
        console.warn("Media failed to load:", error);

        if (retryCount < 2) {
            setLoadingStatus(`Signal weak, skipping...`);
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                handleNextTrack();
            }, 1500);
        } else {
            setHasError(true);
            setIsLoading(false);
            setLoadingStatus(error?.code === 4 ? "Source Not Found" : "Station Offline");
        }
    };

    const handleVisualizerClick = async () => {
        if (isVideo) return;

        await kickstartMobileAudio();
        if (isNarrating) return;
        const ctx = getGlobalAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();

        setIsNarrating(true);
        try {
            const bank = DJ_SNIPPETS[resolvedChannel] || DJ_SNIPPETS.tanty_spice;
            const phrase = bank[Math.floor(Math.random() * bank.length)];
            const buffer = await narrateText(phrase);

            if (snippetSourceRef.current) {
                try { snippetSourceRef.current.stop(); } catch (e) { }
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => setIsNarrating(false);
            snippetSourceRef.current = source;
            source.start();
        } catch (e) {
            setIsNarrating(false);
        }
    };

    useEffect(() => {
        return () => {
            stopVisualizer();
            if (snippetSourceRef.current) try { snippetSourceRef.current.stop(); } catch (e) { }
        };
    }, []);

    if (isInitializing) {
        return (
            <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 py-16 opacity-60">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-black uppercase text-xs tracking-widest text-white/60">Tuning Radio...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto" role="region" aria-label="Likkle Legends Radio">

            {/* ── Channel tabs (full mode only) ─────────────────────────────── */}
            {!isLite && availableChannels.length > 1 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                    {availableChannels.map(ch => (
                        <button
                            key={ch.id}
                            type="button"
                            onClick={() => { setActiveChannel(ch.id); setCurrentTrackIndex(0); setIsPlaying(false); }}
                            className={`py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all text-center
                                ${resolvedChannel === ch.id
                                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30 scale-105'
                                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}
                        >
                            <span className="text-2xl leading-none" aria-hidden="true">{ch.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider">{ch.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Main Player Card ────────────────────────────────────────────── */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)' }}>

                {/* Header bar */}
                <div className="flex items-center justify-between px-5 py-3.5" style={{ background: 'linear-gradient(90deg, #c2410c, #991b1b)' }}>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl" aria-hidden="true">{activeSegment?.icon || 'DJ'}</span>
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-[0.15em] leading-none">Likkle Legends Radio</p>
                            <p className="text-orange-200/80 text-[9px] font-bold uppercase tracking-widest mt-0.5">{activeSegment?.label || 'Live Segment'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                        <span className="text-white/70 text-[9px] font-black uppercase tracking-widest">
                            {isPlaying ? 'LIVE' : 'READY'}
                        </span>
                    </div>
                </div>

                {/* Body: visualizer + info/controls */}
                <div className="flex flex-col sm:flex-row">

                    {/* ── Visualizer panel ──────────────────────────────────────── */}
                    <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0 bg-black/40">
                        {isVideo ? (
                            <video
                                ref={videoRef}
                                src={currentTrack?.url}
                                className="w-full h-full object-cover"
                                onEnded={handleNextTrack}
                                onError={handleMediaError}
                                playsInline
                                controls={false}
                                aria-label="Video Player"
                            />
                        ) : (
                            <canvas
                                ref={canvasRef}
                                onClick={handleVisualizerClick}
                                className="w-full h-full"
                                width={400}
                                height={300}
                                aria-label="Audio Visualizer"
                            />
                        )}

                        {/* Tanty mascot overlay */}
                        {!isVideo && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                <span className={`text-5xl drop-shadow-lg ${isPlaying ? 'animate-bounce' : ''}`} aria-hidden="true">{activeSegment?.icon || 'DJ'}</span>
                                {!isPlaying && (
                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em]">Tap Play</p>
                                )}
                            </div>
                        )}

                        {/* Error overlay */}
                        {(hasError || isNarrating) && (
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-auto">
                                {hasError ? (
                                    <button type="button" onClick={handleNextTrack} className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                                        <span className="text-3xl">⚠️</span>
                                        <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">Tap to Skip</p>
                                    </button>
                                ) : (
                                    <div className="text-orange-300 text-[9px] font-black uppercase tracking-widest">Speaking...</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Info + Controls panel ──────────────────────────────────── */}
                    <div className="flex-1 flex flex-col justify-between p-5 gap-5">

                        {/* Track info */}
                        <div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-white font-black text-xl md:text-2xl leading-tight truncate">
                                        {currentTrack?.title || 'No Track Loaded'}
                                    </h3>
                                    <p className="text-orange-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                        {currentTrack?.artist || 'Likkle Legends'}
                                    </p>
                                </div>
                                {channelTracks.length > 1 && (
                                    <span className="text-white/25 text-xs font-black tabular-nums flex-shrink-0 pt-1">
                                        {safeIndex + 1}&nbsp;/&nbsp;{channelTracks.length}
                                    </span>
                                )}
                            </div>

                            {/* Track list pills */}
                            {channelTracks.length > 1 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {channelTracks.map((t, i) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => { setCurrentTrackIndex(i); setIsPlaying(false); }}
                                            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all truncate max-w-[120px]
                                                ${i === safeIndex
                                                    ? 'bg-orange-500 border-orange-400 text-white'
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {t.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePrevTrack}
                                disabled={channelTracks.length <= 1}
                                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                                aria-label="Previous Track"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                            </button>

                            <button
                                type="button"
                                onClick={togglePlay}
                                disabled={!currentTrack}
                                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: isPlaying ? '0 0 24px rgba(249,115,22,0.5)' : '0 4px 16px rgba(249,115,22,0.3)' }}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying
                                    ? <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    : <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                                }
                            </button>

                            <button
                                type="button"
                                onClick={handleNextTrack}
                                disabled={channelTracks.length <= 1}
                                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                                aria-label="Next Track"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" /></svg>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsMuted((prev) => !prev)}
                                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                aria-label={isMuted ? "Unmute" : "Mute"}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.05A4.485 4.485 0 0 0 16.5 12zM19 12c0 2.53-1.45 4.73-3.56 5.79l1.43 1.43A8 8 0 0 0 21 12c0-2.21-.9-4.21-2.36-5.64l-1.42 1.42A5.944 5.944 0 0 1 19 12zM3.27 2 2 3.27 6.73 8H3v8h4l5 5V13.27l4.73 4.73 1.27-1.27L3.27 2z" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05A4.485 4.485 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                )}
                            </button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-24 accent-orange-500"
                                aria-label="Volume"
                                title="Volume"
                            />

                            {/* Loading status text (non-blocking) */}
                            {loadingStatus && !hasError && (
                                <span className="text-orange-300/60 text-[9px] font-black uppercase tracking-widest">{loadingStatus}</span>
                            )}
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Playlist</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {channelTracks.length === 0 && (
                                    <p className="text-xs text-white/50 font-semibold">No tracks available on this channel yet.</p>
                                )}
                                {channelTracks.map((track, index) => (
                                    <button
                                        key={track.id}
                                        type="button"
                                        onClick={() => { setCurrentTrackIndex(index); setIsPlaying(false); }}
                                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${index === safeIndex
                                            ? 'bg-orange-500/80 text-white'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {index + 1}. {track.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden audio element */}
            {!isVideo && currentTrack && (
                <audio
                    key={currentTrack.id}
                    ref={audioRef}
                    src={currentTrack.url}
                    preload="auto"
                    referrerPolicy="no-referrer"
                    onEnded={handleNextTrack}
                    onError={handleMediaError}
                />
            )}
        </div>
    );
};

export default TantyRadio;


