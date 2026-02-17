"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Track } from '../lib/types';
import { BRAND_NAME, RADIO_CHANNELS, RADIO_TRACKS as DEFAULT_TRACKS } from '../lib/constants';
import { getGlobalAudioContext, kickstartMobileAudio, narrateText } from '../services/geminiService';
import { getGlobalPlaylist } from '../services/storageService';

interface TantyRadioProps {
    isLite?: boolean;
}

const TantySnippets = ["Eh-eh!", "Mmm-hmmm!", "Irie!", "Sweet!", "Yes, suh!", "Look at me star!", "Turn up de tunes!"];

const TantyRadio: React.FC<TantyRadioProps> = ({ isLite = false }) => {
    // Start empty to prevent flash of defaults if user has cleared playlist
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [activeChannel, setActiveChannel] = useState('story');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isNarrating, setIsNarrating] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const snippetSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        const fetchMusic = async () => {
            try {
                const customTracks = await getGlobalPlaylist();
                // Strict check: if customTracks is not null (even if empty array), use it.
                // Only use DEFAULT_TRACKS if customTracks is explicitly null (never configured).
                if (customTracks !== null) {
                    setAllTracks(customTracks);
                } else {
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

    const channelTracks = allTracks.filter(t => t.channel === activeChannel);
    const safeIndex = currentTrackIndex >= channelTracks.length ? 0 : currentTrackIndex;
    const currentTrack = channelTracks[safeIndex]; // Can be undefined if list empty
    const isVideo = currentTrack?.url?.toLowerCase().includes('.mp4') || currentTrack?.url?.includes('video');

    useEffect(() => {
        setHasError(false);
        setLoadingStatus('');
        setIsPlaying(false);
        setRetryCount(0);
    }, [currentTrack?.id]);

    const stopVisualizer = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const setupVisualizer = async () => {
        if (!audioRef.current || isVideo) return;

        try {
            const ctx = getGlobalAudioContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            if (!mediaSourceRef.current) {
                const analyzer = ctx.createAnalyser();
                // NOTE: createMediaElementSource requires the audio to be CORS-accessible.
                // If this fails due to CORS, we catch the error but allow playback to continue without visuals.
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyzer);
                analyzer.connect(ctx.destination);

                analyzer.fftSize = 256;
                analyzerRef.current = analyzer;
                mediaSourceRef.current = source;
            }

            stopVisualizer();
            drawVisualizer();
        } catch (e) {
            console.warn("[RADIO] Visualizer setup skipped (likely CORS):", e);
            // Do not stop playback here; visualizer is optional
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyzerRef.current) return;
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
        } else {
            if (hasError) {
                handleNextTrack();
                return;
            }

            setIsLoading(true);
            setLoadingStatus('Tuning in...');

            try {
                if (!isVideo) await setupVisualizer();

                const ctx = getGlobalAudioContext();
                if (ctx.state === 'suspended') await ctx.resume();

                const playPromise = mediaElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsPlaying(true);
                        setIsLoading(false);
                    }).catch((err) => {
                        console.error("[RADIO] Playback failed:", err);
                        setIsPlaying(false);
                        setIsLoading(false);
                        setHasError(true);
                        if (err.message.includes('supported sources')) {
                            setLoadingStatus("Format Not Supported");
                        }
                    });
                }
            } catch (err) {
                console.error("[RADIO] Setup error:", err);
                setIsPlaying(false);
                setIsLoading(false);
                setHasError(true);
            }
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
            const phrase = TantySnippets[Math.floor(Math.random() * TantySnippets.length)];
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
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-20 text-center opacity-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-black uppercase text-xs tracking-widest text-blue-900">Tuning Radio...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10" role="region" aria-label="Tanty's Radio Station">
            {!isLite && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="tablist">
                    {RADIO_CHANNELS.map(ch => (
                        <button
                            key={ch.id}
                            role="tab"
                            aria-selected={activeChannel === ch.id}
                            onClick={() => { setActiveChannel(ch.id); setCurrentTrackIndex(0); setIsPlaying(false); }}
                            className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-4 transition-all ${activeChannel === ch.id ? 'bg-orange-500 text-white border-white shadow-xl scale-105' : 'bg-white text-blue-950 border-blue-50 hover:bg-blue-50'}`}
                        >
                            <span className="text-4xl" role="img" aria-hidden="true">{ch.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">{ch.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className={`bg-deep rounded-[3rem] md:rounded-[4rem] flex flex-col md:flex-row items-center relative overflow-hidden shadow-premium-xl border-4 border-white/5 ${isLite ? 'p-6 sm:p-8 gap-6' : 'p-10 md:p-16 gap-10'}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none"></div>

                <div className={`${isLite ? 'w-full md:w-[280px]' : 'w-full md:w-1/2'} aspect-video bg-zinc-950 rounded-[2rem] border-4 border-white/10 relative overflow-hidden shadow-2xl group cursor-pointer active:scale-[0.98] transition-transform`}>
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={currentTrack?.url}
                            className="w-full h-full object-cover"
                            onEnded={handleNextTrack}
                            onError={handleMediaError}
                            playsInline
                            controls={false}
                            crossOrigin="anonymous"
                            aria-label="Video Player"
                        />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            onClick={handleVisualizerClick}
                            className="w-full h-full opacity-90"
                            width={600}
                            height={300}
                            aria-label="Audio Visualizer"
                        />
                    )}

                    {!isVideo && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6 pointer-events-none">
                            <span className={`text-6xl ${isPlaying ? 'animate-bounce' : ''}`} role="img" aria-hidden="true">
                                {isLite ? "📻" : RADIO_CHANNELS.find(c => c.id === activeChannel)?.icon}
                            </span>
                            {isLite && !isPlaying && (
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">Tap for Island Vibes</p>
                            )}
                        </div>
                    )}

                    <div className={`absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 transition-opacity duration-300 ${isPlaying && isVideo ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        <h3 className={`${isLite ? 'text-sm' : 'text-xl'} font-quicksand font-black text-primary-light uppercase tracking-tighter truncate`}>{currentTrack?.title || "Station Offline"}</h3>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{currentTrack?.artist || (currentTrack ? "Unknown Artist" : "No Tracks Available")}</p>
                    </div>

                    {(isNarrating || isLoading || hasError) && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white p-6 pointer-events-auto">
                            {hasError ? (
                                <button onClick={handleNextTrack} className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                                    <div className="text-4xl">⚠️</div>
                                    <p className="text-xs font-black uppercase tracking-widest text-error">Media Error - Tap to Skip</p>
                                </button>
                            ) : (
                                <>
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary-light">{loadingStatus || 'Buffering...'}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className={`${isLite ? 'flex-grow items-start' : 'w-full md:w-1/2 items-center'} flex flex-col gap-6 relative z-10`}>
                    <div className="flex items-center gap-6">
                        <button onClick={handlePrevTrack} disabled={!currentTrack} className="text-white/60 text-xl hover:text-white transition-colors disabled:opacity-20" aria-label="Previous Track">⏮️</button>
                        <button
                            onClick={togglePlay}
                            disabled={isLoading || !currentTrack}
                            className={`${isLite ? 'w-16 h-16 text-2xl' : 'w-24 h-24 text-4xl'} bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-90 transition-all border-4 border-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button onClick={handleNextTrack} disabled={!currentTrack} className="text-white/60 text-xl hover:text-white transition-colors disabled:opacity-20" aria-label="Next Track">⏭️</button>
                    </div>
                </div>
            </div>

            {!isVideo && currentTrack && (
                <audio
                    ref={audioRef}
                    src={currentTrack?.url}
                    crossOrigin="anonymous"
                    onEnded={handleNextTrack}
                    onError={handleMediaError}
                />
            )}
        </div>
    );
};

export default TantyRadio;
