"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    X, Play, Pause, Volume2, VolumeX,
    Maximize, Loader2, Sparkles, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PremiumVideoPlayerProps {
    video: {
        id: string;
        title: string;
        video_url?: string;
        thumbnail_url?: string;
        reward_xp?: number;
    };
    onClose: () => void;
    onComplete: (xp: number) => void;
}

/** Returns true if the URL is a YouTube link */
function isYouTubeUrl(url: string): boolean {
    return /youtube\.com|youtu\.be/.test(url);
}

/** Converts any YouTube URL to a nocookie embed URL with JS API enabled */
function toYouTubeEmbed(url: string): string {
    // Already an embed URL
    if (url.includes('/embed/')) {
        const base = url.split('?')[0];
        return `${base}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
    }
    // youtu.be short link
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
        return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`;
    }
    // youtube.com/watch?v=
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&autoplay=1`;
    }
    return url;
}

export default function PremiumVideoPlayer({ video, onClose, onComplete }: PremiumVideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const videoUrl = video.video_url || '';
    const isYT = isYouTubeUrl(videoUrl);
    const ytEmbedUrl = isYT ? toYouTubeEmbed(videoUrl) : '';

    // YouTube IFrame API: listen for video end via postMessage
    useEffect(() => {
        if (!isYT) return;
        setIsLoading(false); // iframe handles its own loading

        const handleMessage = (event: MessageEvent) => {
            if (!event.origin.includes('youtube')) return;
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                // YT state 0 = ended, 1 = playing, 2 = paused
                if (data?.event === 'onStateChange') {
                    if (data.info === 1) { setIsPlaying(true); setIsLoading(false); }
                    if (data.info === 2) setIsPlaying(false);
                    if (data.info === 0 && !isCompleted) handleComplete();
                }
                if (data?.event === 'onReady') setIsLoading(false);
            } catch {
                // non-JSON postMessage — ignore
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isYT, isCompleted]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(p);
            if (p > 90 && !isCompleted) handleComplete();
        }
    };

    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => { onComplete(video.reward_xp || 50); }, 3000);
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    useEffect(() => {
        return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[2000] bg-black flex items-center justify-center overflow-hidden select-none"
            onMouseMove={handleMouseMove}
        >
            <div className="relative w-full h-full max-w-[1920px] flex items-center justify-center">

                {/* ── YouTube Embed ── */}
                {isYT ? (
                    <div className="relative w-full aspect-video max-h-screen">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                <Loader2 className="text-white animate-spin" size={64} />
                            </div>
                        )}
                        <iframe
                            src={ytEmbedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            onLoad={() => setIsLoading(false)}
                            title={video.title}
                        />

                        {/* Top Bar for YouTube */}
                        <AnimatePresence>
                            {showControls && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between p-6 pointer-events-none"
                                >
                                    <button
                                        onClick={onClose}
                                        className="pointer-events-auto w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all shadow-xl"
                                        title="Close"
                                    >
                                        <X size={28} />
                                    </button>
                                    <div className="text-center">
                                        <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-1">Village Cinema</p>
                                        <h2 className="text-xl font-black text-white tracking-tight">{video.title}</h2>
                                    </div>
                                    <div className="pointer-events-auto bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl flex items-center gap-2 border border-white/20">
                                        <Sparkles className="text-yellow-400" size={18} />
                                        <span className="text-white font-black text-sm">+{video.reward_xp || 50} XP</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* ── HTML5 Video ── */
                    <div className="relative w-full h-full max-w-[1920px] aspect-video">
                        <video
                            ref={videoRef}
                            src={videoUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}
                            className="w-full h-full object-contain"
                            onTimeUpdate={handleTimeUpdate}
                            onWaiting={() => setIsLoading(true)}
                            onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
                            onCanPlay={() => setIsLoading(false)}
                            muted={isMuted}
                            onClick={togglePlay}
                        >
                            {video.id && (
                                <>
                                    <track kind="captions" src={`/captions/lesson-${video.id}-en.vtt`} srcLang="en" label="English" default />
                                    <track kind="captions" src={`/captions/lesson-${video.id}-es.vtt`} srcLang="es" label="Español" />
                                </>
                            )}
                        </video>

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Loader2 className="text-white animate-spin" size={64} />
                            </div>
                        )}

                        <AnimatePresence>
                            {showControls && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-8"
                                >
                                    {/* Top Bar */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={onClose}
                                            className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all shadow-xl"
                                            title="Close Lesson"
                                        >
                                            <X size={32} />
                                        </button>
                                        <div className="text-center">
                                            <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-1">Lesson In Progress</p>
                                            <h2 className="text-2xl font-black text-white tracking-tight">{video.title}</h2>
                                        </div>
                                        <div className="w-16" />
                                    </div>

                                    {!isPlaying && !isLoading && (
                                        <button
                                            onClick={togglePlay}
                                            title="Play"
                                            aria-label="Play"
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                                        >
                                            <Play size={64} className="ml-2" />
                                        </button>
                                    )}

                                    {/* Bottom Controls */}
                                    <div className="space-y-6">
                                        <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                                                    {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                                                </button>
                                                <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white">
                                                    {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-2 border border-white/20">
                                                    <Sparkles className="text-yellow-400" size={20} />
                                                    <span className="text-white font-black">+{video.reward_xp || 50} XP</span>
                                                </div>
                                                <button className="text-white/80 hover:text-white" title="Fullscreen" aria-label="Fullscreen"><Maximize size={32} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Completion Modal — same for both YouTube + HTML5 */}
                <AnimatePresence>
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-8"
                        >
                            <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl border-8 border-primary/20 max-w-lg">
                                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
                                    <Trophy size={64} className="text-white" />
                                </div>
                                <h3 className="text-5xl font-black text-blue-900 mb-4 tracking-tighter">BRAVO!</h3>
                                <p className="text-xl text-blue-700/60 mb-12 font-bold leading-relaxed">
                                    You've learned something new about the islands! Keep going, Legend!
                                </p>
                                <button
                                    onClick={onClose}
                                    className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Next Adventure
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
