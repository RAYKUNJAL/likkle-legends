"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
    X, Volume2, ChevronLeft, ChevronRight,
    Play, Pause, RotateCcw, SkipForward,
    Loader2, Home, Star, Turtle, Rabbit, Music, Zap, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { awardStars } from '@/lib/services/user-progress';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';
import StoryCharacterPartner from './library/StoryCharacterPartner';
import BadgeUnlockModal from './gamification/BadgeUnlockModal';
import { saveGeneratedStory } from '@/app/actions/content-actions';
import { generateCharacterAudio as generateAudioAction } from '@/app/actions/voice';

interface WordAlignment {
    text: string;
    start: number;
    end: number;
}

interface Page {
    text: string;
    imageUrl?: string;
    audioUrl?: string;
    audio?: {
        alignment?: {
            words?: { text: string; startTimeSeconds: number; endTimeSeconds: number }[];
        };
    };
    words?: WordAlignment[];
}

interface InteractiveReaderProps {
    title?: string;
    pages: Page[];
    guide: 'tanty' | 'roti';
    onClose: () => void;
    storyId?: string;
}

export default function InteractiveReader({ title, pages, guide, onClose, storyId }: InteractiveReaderProps) {
    const { user, activeChild, triggerBadgeUnlock, unlockedBadge, clearUnlockedBadge } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [activeWordIndex, setActiveWordIndex] = useState(-1);
    const [volume, setVolume] = useState(1);
    const [bgmVolume, setBgmVolume] = useState(0.15); // Low background volume
    const [isBgmMuted, setIsBgmMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(0.85); // Slower, kid-friendly pace
    const [autoPlay] = useState(false);
    const [showPlayOverlay, setShowPlayOverlay] = useState(true);
    const [showReward, setShowReward] = useState(false); // Gamification State
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioProgress, setAudioProgress] = useState(0);
    const [showPartner, setShowPartner] = useState(false);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // For future visualizer if needed
    const lastWordIndexRef = useRef<number>(-1);

    // BGM Management
    useEffect(() => {
        if (!bgmRef.current) return;

        bgmRef.current.volume = isBgmMuted ? 0 : bgmVolume;

        if (isPlaying && !isBgmMuted && bgmRef.current.paused) {
            bgmRef.current.play().catch(() => { });
        } else if (!isPlaying && !bgmRef.current.paused) {
            bgmRef.current.pause();
        }
    }, [isPlaying, bgmVolume, isBgmMuted]);

    // Confetti Effect
    useEffect(() => {
        if (showReward) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            // Award Stars
            awardStars('story-completed', 5).catch(console.error);

            // Log real activity and check for badges
            if (user && activeChild) {
                logActivity(user.id, activeChild.id, 'story', title, 50).then(result => {
                    if (result?.unlockedBadge) {
                        triggerBadgeUnlock(result.unlockedBadge);
                    }
                }).catch(console.error);
            }

            return () => clearInterval(interval);
        }
    }, [showReward]);

    // Safety check for pages
    // Safety check for pages handle
    const safePages = pages && pages.length > 0 ? pages : [{
        text: "No pages available",
        words: []
    }];
    const pageData = safePages[currentPage] || safePages[0];

    // Ultra-High-Quality Weighted Word Map
    const words = useMemo(() => {
        // 1. Support for new rigorous JSON format with exact timestamps
        if (pageData.audio?.alignment?.words) {
            return pageData.audio.alignment.words.map((w) => ({
                text: w.text,
                start: w.startTimeSeconds,
                end: w.endTimeSeconds
            }));
        }

        // 2. Legacy/Simple format support
        if (pageData.words && pageData.words.length > 0) return pageData.words;

        // 3. Fallback: Weighted Simulation
        const tokens = pageData.text ? pageData.text.split(/\s+/) : [];
        if (tokens.length === 0) return [];

        // Tuned weights for "Storyteller" cadence
        const weights = tokens.map(token => {
            let w = token.length; // Base weight = characters
            if (/[.!?]/.test(token)) w += 8; // Major pause for sentence end
            else if (/[,;:]/.test(token)) w += 4; // Minor pause for clauses
            return Math.max(w, 2);
        });

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        // Use audioDuration if available, otherwise estimate 0.5s per "average" word
        const duration = audioDuration > 0 ? audioDuration : tokens.length * 0.5;

        // Distribution
        let currentTime = 0;
        return tokens.map((token, i) => {
            const wordDuration = (weights[i] / totalWeight) * duration;
            const start = currentTime;
            const end = currentTime + wordDuration;
            currentTime = end;
            return { text: token, start, end };
        });
    }, [pageData, audioDuration]);

    const wordsRef = useRef(words);
    useEffect(() => {
        wordsRef.current = words;
        lastWordIndexRef.current = -1; // Reset efficient tracking on new words
    }, [words]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let active = true; // Prevent race conditions

        const setupAudio = async () => {
            setAudioError(null);
            setIsBuffering(true);
            setIsPlaying(false);
            setAudioProgress(0);
            setActiveWordIndex(-1);
            lastWordIndexRef.current = -1;

            let source = pageData.audioUrl;

            // If no pre-generated audio, generate on the fly
            if (!source && pageData.text) {
                try {
                    const res = await generateAudioAction(pageData.text, guide);
                    if (active && res.success && res.audio) {
                        source = res.audio.startsWith('data:') ? res.audio : `data:audio/mp3;base64,${res.audio}`;
                    } else if (active && !res.success) {
                        console.warn("Audio generation failed:", res.error);
                        setAudioError("Audio unavailable");
                        setIsBuffering(false);
                        return;
                    }
                } catch (e) {
                    if (active) {
                        console.error("Audio generation exception:", e);
                        setAudioError("Audio unavailable");
                        setIsBuffering(false);
                    }
                    return;
                }
            }

            if (active && source && audio.src !== source) {
                audio.src = source;
                audio.load();
            } else if (active && !source) {
                setIsBuffering(false);
            }
        };

        setupAudio();

        // Optimized Tick Function
        const tick = () => {
            if (!audio.paused) {
                const time = audio.currentTime;
                setAudioProgress(time);

                // Optimized Index Finding: Start from last known index
                // Unless we jumped backwards (time < last known start), then reset
                let startIndex = lastWordIndexRef.current;
                if (startIndex !== -1 && startIndex < wordsRef.current.length) {
                    if (time < wordsRef.current[startIndex].start) startIndex = 0;
                } else {
                    startIndex = 0;
                }

                // Linear scan forward is usually faster than full findIndex for continuous playback
                let foundIndex = -1;
                for (let i = startIndex; i < wordsRef.current.length; i++) {
                    const w = wordsRef.current[i];
                    if (time >= w.start && time < w.end) {
                        foundIndex = i;
                        break;
                    }
                    // Optimization: If we've passed the current time, no need to look further (assumes sorted)
                    if (w.start > time) break;
                }

                if (foundIndex !== -1) {
                    if (foundIndex !== activeWordIndex) {
                        setActiveWordIndex(foundIndex);
                        lastWordIndexRef.current = foundIndex;
                    }
                }

                rafRef.current = requestAnimationFrame(tick);
            }
        };

        const onPlay = () => {
            setIsPlaying(true);
            setIsBuffering(false);
            rafRef.current = requestAnimationFrame(tick);
        };

        const onPause = () => {
            setIsPlaying(false);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };

        const onMetadata = () => {
            setAudioDuration(audio.duration);
            setIsBuffering(false);
            audio.playbackRate = playbackRate; // Force speed on new track
            if (autoPlay && !showPlayOverlay) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => { });
                }
            }
        };

        const onEnd = () => {
            setIsPlaying(false);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            // Allow BGM to keep playing during transition delay

            if (autoPlay) {
                if (currentPage < pages.length - 1) {
                    setTimeout(() => setCurrentPage(p => p + 1), 2000);
                } else {
                    setShowReward(true);
                }
            }
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('loadedmetadata', onMetadata);
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('waiting', () => setIsBuffering(true));
        audio.addEventListener('playing', () => setIsBuffering(false));
        audio.addEventListener('error', () => {
            setAudioError("Unable to play sound");
            setIsBuffering(false);
        });

        return () => {
            active = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('loadedmetadata', onMetadata);
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('waiting', () => setIsBuffering(true));
            audio.removeEventListener('playing', () => setIsBuffering(false));
            audio.removeEventListener('error', () => { });
        };
    }, [pageData, currentPage, autoPlay, showPlayOverlay, pages.length, playbackRate, guide]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = playbackRate;
        }
    }, [volume, playbackRate]);

    const handlePlayPause = async () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            try {
                await audioRef.current.play();
            } catch (e) { setShowPlayOverlay(true); }
        }
    };

    const guideInfo = guide === 'tanty'
        ? { name: 'Tanty Spice', avatar: '/images/tanty_spice_avatar.jpg', color: 'bg-orange-500' }
        : { name: 'R.O.T.I.', avatar: '/images/roti-new.jpg', color: 'bg-blue-500' };

    if (!pages || pages.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#FFFBF5] flex flex-col overflow-hidden select-none">
            {/* ═══ Top Nav ═══ */}
            <header className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 bg-white border-b-2 border-orange-50 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.href = '/'} className="p-1.5 lg:p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                        <Home size={18} />
                    </button>
                    <div>
                        <h1 className="text-sm lg:text-base font-black text-orange-950 uppercase tracking-tight truncate max-w-[120px]">{title || 'Story'}</h1>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-orange-200'}`} />
                            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">{guideInfo.name} Reading</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* BGM Toggle */}
                    <button
                        onClick={() => setIsBgmMuted(!isBgmMuted)}
                        className={`p-1.5 lg:p-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${!isBgmMuted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                        title="Background Music"
                    >
                        <Music size={16} />
                    </button>

                    <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                        <Volume2 size={12} className="text-orange-400" />
                        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-12 lg:w-20 h-1 accent-orange-500" />
                    </div>
                    <button onClick={onClose} className="p-1.5 lg:p-2 bg-red-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* ═══ Main Adventure Area ═══ */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 lg:p-4 gap-3 lg:gap-4 lg:max-h-[calc(100vh-120px)] relative">
                {/* Visual Content (Only show if imageUrl exists) */}
                {pageData.imageUrl && (
                    <div className="flex-1 bg-white rounded-[2.5rem] border-4 border-orange-50 p-6 flex flex-col relative shadow-xl overflow-hidden min-h-[300px]">
                        <div className="flex-1 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPage}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.1, opacity: 0 }}
                                    className="w-full h-full flex items-center justify-center relative"
                                >
                                    {isBuffering && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                                            <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
                                            <p className="text-xs font-black text-orange-950 uppercase tracking-widest">Loading Magic...</p>
                                        </div>
                                    )}

                                    <div className="relative w-full h-full max-h-[550px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group">
                                        <Image
                                            src={pageData.imageUrl}
                                            alt={`Illustration for page ${currentPage + 1}`}
                                            fill
                                            className={`object-cover transition-all duration-700 group-hover:scale-105 ${isBuffering ? 'blur-lg' : 'blur-0'}`}
                                            onLoad={() => setIsBuffering(false)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Text Story Section */}
                <div className="flex-1 lg:flex-[1.2] bg-white rounded-[2rem] border-2 border-orange-100 shadow-xl flex flex-col overflow-hidden relative">
                    {/* Guide Character Mini-Card (Overlay if no image, nested if image) */}
                    <div className={`${pageData.imageUrl ? 'absolute top-6 left-6' : 'm-6'} bg-white/95 backdrop-blur px-4 py-3 rounded-3xl border-2 border-orange-50 shadow-xl flex items-center gap-3 self-start z-20`}>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200 shadow-inner">
                            <Image src={guideInfo.avatar} alt={guideInfo.name} width={48} height={48} className="object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Guide</p>
                            <p className="text-sm font-black text-orange-950">{guideInfo.name}</p>
                        </div>
                        {isPlaying && (
                            <div className="flex gap-1 h-4 items-center pl-2 border-l border-orange-100">
                                {[1, 2, 3].map(i => <motion.div key={i} animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} className="w-1 bg-orange-500 rounded-full" />)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-6 lg:p-10 overflow-y-auto overflow-x-hidden scrollbar-hide">
                        <div className="flex flex-wrap gap-x-2 gap-y-3 lg:gap-y-4 text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 pb-12">
                            {words.map((word: WordAlignment, i: number) => (
                                <motion.span
                                    key={i}
                                    animate={{
                                        color: i === activeWordIndex ? '#FFFFFF' : (i < activeWordIndex ? '#1E3A8A' : 'rgba(24, 24, 27, 0.4)'),
                                        backgroundColor: i === activeWordIndex ? '#F97316' : 'transparent',
                                        scale: i === activeWordIndex ? 1.05 : 1,
                                        boxShadow: i === activeWordIndex ? '0 10px 15px -3px rgba(249, 115, 22, 0.3)' : 'none'
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="px-2 py-0.5 rounded-xl cursor-default transition-colors duration-200"
                                >
                                    {word.text}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    {/* Controls Footer Overlay */}
                    <div className="bg-gradient-to-t from-white via-white to-white/0 p-4 lg:p-8 pt-10 shrink-0">
                        <div className="max-w-xl mx-auto flex flex-col gap-6">
                            {/* Pro Progress Bar */}
                            <div className="relative group">
                                <div className="h-3 bg-orange-100 rounded-full overflow-hidden cursor-pointer shadow-inner" onClick={e => {
                                    if (!audioRef.current) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
                                }}>
                                    <motion.div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" animate={{ width: `${(audioProgress / (audioDuration || 1)) * 100}%` }} transition={{ duration: 0.1 }} />
                                </div>
                                {audioError && <p className="absolute -top-6 left-0 right-0 text-center text-[9px] font-black text-red-500 uppercase tracking-widest">{audioError}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} className="w-10 h-10 flex items-center justify-center text-orange-200 hover:text-orange-500 transition-colors">
                                        <RotateCcw size={20} />
                                    </button>
                                    <div className="px-3 py-1 bg-orange-50 rounded-full text-[10px] font-black text-orange-400 hidden sm:block">PAGE {currentPage + 1}</div>
                                </div>

                                <button
                                    onClick={handlePlayPause}
                                    className="w-20 h-20 bg-orange-500 text-white rounded-3xl shadow-lg shadow-orange-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
                                >
                                    {isBuffering ? <Loader2 size={32} className="animate-spin" /> : (isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1.5" />)}
                                </button>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => setPlaybackRate(playbackRate === 1 ? 0.8 : 1)} className="p-2 text-orange-300 hover:text-orange-500 transition-colors">
                                        {playbackRate === 0.8 ? <Turtle size={18} /> : <Rabbit size={18} className="opacity-20 hover:opacity-100" />}
                                    </button>
                                    <button onClick={() => currentPage < pages.length - 1 && setCurrentPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center text-orange-200 hover:text-orange-600 transition-colors">
                                        <SkipForward size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══ Navigation Bar ═══ */}
            <footer className="h-16 lg:h-20 bg-white border-t border-orange-50 flex items-center justify-between px-6 lg:px-12 shrink-0">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="flex items-center gap-2 font-black text-sm lg:text-base text-zinc-400 hover:text-orange-500 disabled:opacity-30 transition-all group"
                >
                    <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> <span className="hidden sm:inline">PREVIOUS</span>
                </button>

                <div className="flex gap-2">
                    {pages.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'w-8 bg-orange-500 shadow-sm' : 'w-2 bg-orange-100'}`} />
                    ))}
                </div>

                <button
                    onClick={() => currentPage < pages.length - 1 ? setCurrentPage(p => p + 1) : setShowReward(true)}
                    className={`flex items-center gap-2 px-6 lg:px-10 py-3 lg:py-4 rounded-2xl font-black text-sm lg:text-base shadow-xl transition-all group ${currentPage === pages.length - 1
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105'
                        : 'bg-zinc-900 text-white hover:bg-orange-500'
                        }`}
                >
                    <span>{currentPage === pages.length - 1 ? 'FINISH & CLAIM STAR' : 'NEXT PAGE'}</span>
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>

            {/* Audio Elements */}
            <audio ref={audioRef} playsInline preload="auto" />
            <audio ref={bgmRef} src="/audio/calypso-loop.mp3" loop playsInline preload="auto" />

            {/* Commercial Grade Tap-to-Start Overlay */}
            <AnimatePresence>
                {showPlayOverlay && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-orange-950/40 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full relative">
                            <button onClick={() => setShowPlayOverlay(false)} className="absolute top-8 right-8 text-zinc-300 hover:text-zinc-600">
                                <X size={24} />
                            </button>

                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white shadow-2xl mb-10 border-8 border-orange-50/50"
                            >
                                <Play size={56} fill="white" className="ml-2" />
                            </motion.div>

                            <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 mb-2 leading-tight">Ready to Listen?</h2>
                            <p className="text-orange-600 font-bold mb-10 text-lg">{guideInfo.name} is getting ready to read!</p>

                            <button onClick={async () => {
                                setShowPlayOverlay(false);
                                if (audioRef.current) {
                                    try {
                                        await audioRef.current.play();
                                        if (!isBgmMuted && bgmRef.current) await bgmRef.current.play();
                                    } catch (e) { }
                                }
                            }} className="w-full py-5 text-center bg-zinc-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-orange-600 transition-all">
                                START READING
                            </button>
                            <p className="mt-6 text-[10px] text-zinc-300 uppercase font-black tracking-widest">A Likkle Legends Adventure</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Star Reward Overlay ═══ */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full relative text-center border-4 border-yellow-300"
                        >
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                className="mb-6"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 rounded-full" />
                                    <Star size={120} fill="#FACC15" className="text-yellow-400 relative z-10 drop-shadow-lg" />
                                </div>
                            </motion.div>

                            <h2 className="text-4xl lg:text-5xl font-black text-orange-950 mb-2 leading-tight">YOU DID IT!</h2>
                            <p className="text-orange-600 font-bold mb-8 text-xl">You earned a Story Star!</p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all mb-4"
                            >
                                COLLECT REWARD 🌟
                            </button>

                            {storyId && !isSaved && (
                                <button
                                    onClick={async () => {
                                        setIsSaving(true);
                                        setSaveError(null);
                                        try {
                                            const res = await saveGeneratedStory(storyId);
                                            if (res.success) {
                                                setIsSaved(true);
                                            }
                                        } catch (e: any) {
                                            setSaveError(e.message || "Failed to save");
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            SAVING...
                                        </>
                                    ) : (
                                        <>
                                            <Star size={24} fill="white" />
                                            SAVE TO MY LIBRARY
                                        </>
                                    )}
                                </button>
                            )}

                            {isSaved && (
                                <div className="p-4 bg-green-50 rounded-2xl border-2 border-green-200">
                                    <p className="text-green-700 font-black flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" />
                                        SAVED TO YOUR ACCOUNT!
                                    </p>
                                </div>
                            )}

                            {saveError && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">{saveError}</p>}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ═══ Badge Unlock Celebration ═══ */}
            <BadgeUnlockModal
                badge={unlockedBadge}
                onClose={() => clearUnlockedBadge()}
            />
        </div>
    );
}
