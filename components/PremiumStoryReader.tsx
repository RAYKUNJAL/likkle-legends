"use client";

/**
 * PremiumStoryReader v2 — rebuilt for reliability.
 *
 * Design rules:
 * 1. Page turns NEVER depend on audio. Buttons, swipe, and arrow keys always work.
 * 2. Audio is the warm island narrator only: a saved warm file, else ElevenLabs, else Gemini TTS.
 *    If no voice key is set, playback fail-closes. Browser speech synthesis is not used.
 * 3. Auto-turn only happens when narration actually finishes (audio.onended / utterance.onend).
 *    No blind timers.
 * 4. All audio lifecycle lives in refs — React re-renders can never kill playback.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    X, ChevronLeft, ChevronRight, Volume2, VolumeX,
    Loader2, Play, Pause, Star, Trophy, BookOpen, Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { narrateWarmPage } from '@/app/actions/warm-narration';
import { isWarmNarration, warmNarrationLabel, estimateNarrationTimings, scaleNarrationTimingsToDuration } from '@/lib/story-narration-policy';

interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    image_url?: string;
    illustration_url?: string;
    illustrationUrl?: string;
    glossaryWords?: string[];
    question?: string;
    audioUrl?: string;
    audioWords?: { text: string; start: number; end: number }[];
}

interface Story {
    id: string;
    title: string;
    summary: string;
    cover_image_url: string;
    character_id?: string;
    content_json: {
        pages: StoryPage[];
        glossary: { word: string; meaning: string }[];
    };
    reading_time_minutes: number;
    slug?: string;
    narrated_by?: string | null;
}

interface PremiumStoryReaderProps {
    story: Story;
    onClose: () => void;
    onComplete: (xpEarned: number) => void;
}

type NarrationState = 'idle' | 'loading' | 'playing' | 'paused';

function splitWords(text: string) {
    return text.split(/(\s+)/).reduce<{ text: string; isWord: boolean; wordIndex: number | null }[]>((acc, part) => {
        if (!part) return acc;
        if (/^\s+$/.test(part)) {
            acc.push({ text: part, isWord: false, wordIndex: null });
        } else {
            const wordIndex = acc.filter(t => t.isWord).length;
            acc.push({ text: part, isWord: true, wordIndex });
        }
        return acc;
    }, []);
}

export default function PremiumStoryReader({ story, onClose, onComplete }: PremiumStoryReaderProps) {
    const pages = useMemo(() => story.content_json?.pages || [], [story]);
    const [currentPage, setCurrentPage] = useState(0);
    const [narration, setNarration] = useState<NarrationState>('idle');
    const hasWarmFiles = pages.some((page) => Boolean(page.audioUrl));
    const [readAloud, setReadAloud] = useState(hasWarmFiles);
    const [narrationNote, setNarrationNote] = useState(
        isWarmNarration(story.narrated_by)
            ? warmNarrationLabel(story.narrated_by?.includes('gemini') ? 'gemini' : story.narrated_by?.includes('elevenlabs') ? 'elevenlabs' : null)
            : 'Warm island narrator'
    );
    const [autoTurn, setAutoTurn] = useState(true);
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const [pageAudio, setPageAudio] = useState<Record<number, { audioUrl: string; words: { text: string; start: number; end: number }[] }>>({});

    // ---- refs: audio lifecycle lives OUTSIDE the render cycle ----
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playTokenRef = useRef(0);          // increments to invalidate stale async playback
    const voiceBlockedRef = useRef(false);
    const currentPageRef = useRef(0);
    const autoTurnRef = useRef(true);
    const readAloudRef = useRef(hasWarmFiles);
    const completedRef = useRef(false);

    useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
    useEffect(() => { autoTurnRef.current = autoTurn; }, [autoTurn]);
    useEffect(() => { readAloudRef.current = readAloud; }, [readAloud]);

    const stopNarration = useCallback(() => {
        playTokenRef.current += 1;
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.ontimeupdate = null;
            audioRef.current.pause();
            audioRef.current = null;
        }
        setHighlightIndex(null);
        setNarration('idle');
    }, []);

    const finishStory = useCallback(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        stopNarration();
        setShowCompletion(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#1E90FF', '#32CD32'],
        });
    }, [stopNarration]);

    const goToPage = useCallback((index: number) => {
        stopNarration();
        if (index >= pages.length) {
            finishStory();
            return;
        }
        if (index < 0) return;
        setCurrentPage(index);
    }, [pages.length, stopNarration, finishStory]);

    const nextPage = useCallback(() => goToPage(currentPageRef.current + 1), [goToPage]);
    const prevPage = useCallback(() => goToPage(currentPageRef.current - 1), [goToPage]);

    const handleNarrationEnd = useCallback(() => {
        setHighlightIndex(null);
        setNarration('idle');
        if (autoTurnRef.current) {
            // Turn the page ~1s after narration finishes.
            const token = playTokenRef.current;
            setTimeout(() => {
                if (playTokenRef.current === token) {
                    goToPage(currentPageRef.current + 1);
                }
            }, 1000);
        }
    }, [goToPage]);

    /** Warm narrator only. Saved warm files play immediately; otherwise the server generates. */
    const playNarration = useCallback(async () => {
        const pageIndex = currentPageRef.current;
        const pageData = pages[pageIndex];
        const text = (pageData?.text || '').trim();
        if (!text) return;

        if (voiceBlockedRef.current) {
            setNarration('idle');
            setNarrationNote('Warm narrator needs a voice key. Read this page together.');
            return;
        }

        stopNarration();
        const token = ++playTokenRef.current;
        setNarration('loading');
        setNarrationNote('Warm island narrator');

        let resolved = pageAudio[pageIndex] || null;
        if (!resolved && pageData.audioUrl) {
            resolved = { audioUrl: pageData.audioUrl, words: pageData.audioWords?.length ? pageData.audioWords : estimateNarrationTimings(text) };
        }

        if (!resolved) {
            try {
                const result = await narrateWarmPage({ text });
                if (playTokenRef.current !== token) return;
                if (result.success && result.audioUrl) {
                    resolved = { audioUrl: result.audioUrl, words: result.words || [] };
                    setPageAudio(prev => ({ ...prev, [pageIndex]: resolved! }));
                    setNarrationNote(warmNarrationLabel(result.provider));
                } else if (result.code === 'missing_key') {
                    voiceBlockedRef.current = true;
                    setNarration('idle');
                    setNarrationNote(result.error || 'Warm narrator needs a voice key.');
                    return;
                } else {
                    setNarration('idle');
                    setNarrationNote(result.error || 'Narration did not start.');
                    return;
                }
            } catch {
                if (playTokenRef.current !== token) return;
                setNarration('idle');
                setNarrationNote('Narration did not start. You can still read this page.');
                return;
            }
        }

        if (playTokenRef.current !== token) return;

        if (resolved?.audioUrl) {
            const audio = new Audio(resolved.audioUrl);
            audio.preload = 'auto';
            // Seed from saved/live word timings when present; otherwise estimate from text.
            // Always rescale to the real clip duration so karaoke tracks speech.
            let timings = (resolved.words && resolved.words.length)
                ? resolved.words
                : estimateNarrationTimings(text);
            const timingsRef = { current: timings };

            const syncHighlight = () => {
                const list = timingsRef.current;
                if (playTokenRef.current !== token || !list.length) return;
                const t = audio.currentTime;
                let idx = list.findIndex(w => t >= w.start && t <= w.end);
                if (idx === -1 && t > (list[list.length - 1]?.end || 0)) idx = list.length - 1;
                if (idx >= 0) setHighlightIndex(idx);
            };

            audio.onloadedmetadata = () => {
                if (playTokenRef.current !== token) return;
                const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
                timingsRef.current = scaleNarrationTimingsToDuration(text, duration, timingsRef.current);
            };
            audio.ontimeupdate = syncHighlight;
            audio.onended = () => {
                if (playTokenRef.current !== token) return;
                handleNarrationEnd();
            };

            audioRef.current = audio;
            try {
                await audio.play();
                if (playTokenRef.current === token) setNarration('playing');
                return;
            } catch {
                audioRef.current = null;
                if (playTokenRef.current === token) {
                    setNarration('idle');
                    setNarrationNote('Tap play again to hear Tanty Spice.');
                }
                return;
            }
        }

        if (playTokenRef.current === token) {
            setNarration('idle');
            setNarrationNote('Narration did not start. You can still read this page.');
        }
    }, [pages, pageAudio, stopNarration, handleNarrationEnd]);

    const toggleNarration = useCallback(() => {
        if (narration === 'playing') {
            if (audioRef.current) {
                audioRef.current.pause();
                setNarration('paused');
            }
        } else if (narration === 'paused') {
            if (audioRef.current) {
                void audioRef.current.play();
                setNarration('playing');
            }
        } else if (narration === 'idle') {
            void playNarration();
        }
    }, [narration, playNarration]);

    // Auto-start narration when the page changes (only if Read-Aloud is on).
    // NOTE: keyed ONLY on currentPage — playNarration identity changes never re-fire this.
    useEffect(() => {
        if (showCompletion) return;
        if (!readAloudRef.current) return;
        const timer = setTimeout(() => { void playNarration(); }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, showCompletion]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextPage();
            else if (e.key === 'ArrowLeft') prevPage();
            else if (e.key === ' ') { e.preventDefault(); toggleNarration(); }
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [nextPage, prevPage, toggleNarration, onClose]);

    // Swipe navigation (mobile-first)
    const touchStartX = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < 50) return;
        if (dx < 0) nextPage(); else prevPage();
    };

    // Cleanup on unmount only
    useEffect(() => () => {
        playTokenRef.current += 1;
        if (audioRef.current) audioRef.current.pause();
    }, []);

    const pageData = pages[currentPage] || { text: '', pageNumber: 1 };
    const tokens = useMemo(() => splitWords(pageData.text || ''), [pageData.text]);
    const imageUrl = pageData.imageUrl || pageData.image_url || pageData.illustration_url || pageData.illustrationUrl || story.cover_image_url;
    const progress = pages.length ? ((currentPage + 1) / pages.length) * 100 : 0;

    if (!pages.length) {
        return (
            <div className="fixed inset-0 z-[1000] bg-sky-950 flex items-center justify-center p-6">
                <div className="text-center bg-white rounded-[2rem] p-10 shadow-2xl max-w-sm">
                    <BookOpen size={56} className="text-amber-400 mx-auto mb-5" />
                    <h2 className="text-2xl font-black text-blue-900 mb-2">Book is Empty</h2>
                    <p className="text-blue-700/60 mb-6 font-bold">Tanty is still writing this one!</p>
                    <button onClick={onClose} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[1000] bg-sky-950 flex flex-col select-none">
            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 shrink-0">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <AnimatePresence mode="wait">
                {showCompletion ? (
                    <motion.div
                        key="completion"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl border-8 border-orange-400">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Trophy size={56} className="text-white" />
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-blue-900 mb-3">GREAT READING!</h2>
                            <p className="text-lg text-blue-700/60 mb-6 font-bold">You finished “{story.title}”!</p>
                            <div className="bg-blue-50 rounded-3xl p-6 mb-6 flex items-center justify-center gap-8 border-4 border-blue-100">
                                <div>
                                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">XP Earned</p>
                                    <p className="text-4xl font-black text-blue-900">+100</p>
                                </div>
                                <div className="w-px h-14 bg-blue-200" />
                                <div>
                                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Pages</p>
                                    <p className="text-4xl font-black text-blue-900">{pages.length}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onComplete(100)}
                                className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Collect 100 XP ⭐
                            </button>
                            <button onClick={onClose} className="mt-4 text-blue-400 font-bold hover:text-blue-600">
                                Back to Library
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`page-${currentPage}`}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="flex-1 flex flex-col min-h-0"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Top bar */}
                        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/30 backdrop-blur-md">
                            <button
                                onClick={onClose}
                                aria-label="Close Reader"
                                className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                            >
                                <X size={22} />
                            </button>
                            <div className="min-w-0 text-center px-3">
                                <h2 className="text-white font-black text-sm sm:text-lg truncate">{story.title}</h2>
                                <p className="text-white/50 text-xs font-bold">Page {currentPage + 1} of {pages.length}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAutoTurn(v => !v)}
                                    aria-label="Toggle auto page turn"
                                    title={autoTurn ? 'Auto-turn ON' : 'Auto-turn OFF'}
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${autoTurn ? 'bg-amber-400 text-blue-950' : 'bg-white/10 text-white/50'}`}
                                >
                                    <Repeat size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        const next = !readAloud;
                                        setReadAloud(next);
                                        if (!next) stopNarration();
                                        else void playNarration();
                                    }}
                                    aria-label="Toggle read aloud"
                                    title={readAloud ? 'Read-aloud ON' : 'Read-aloud OFF'}
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${readAloud ? 'bg-amber-400 text-blue-950' : 'bg-white/10 text-white/50'}`}
                                >
                                    {readAloud ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Page content */}
                        <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-stretch gap-0 lg:gap-6 lg:px-8 lg:py-6 max-w-6xl w-full mx-auto">
                            {/* Illustration */}
                            <div className="relative h-[32vh] lg:h-auto lg:flex-1 shrink-0 lg:rounded-[2rem] overflow-hidden bg-sky-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 via-transparent to-transparent lg:hidden" />
                                <AnimatePresence>
                                    {(narration === 'playing' || narration === 'loading') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 rounded-full bg-black/55 backdrop-blur-md border border-amber-300/40 pl-1.5 pr-3 py-1.5 shadow-xl"
                                            role="status"
                                            aria-label="Tanty Spice is narrating"
                                        >
                                            <motion.span
                                                className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-amber-300 shrink-0"
                                                animate={{ scale: [1, 1.06, 1] }}
                                                transition={{ repeat: Infinity, duration: 0.85 }}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src="/images/tanty_spice_avatar.jpg" alt="" className="w-full h-full object-cover" draggable={false} />
                                            </motion.span>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-200 leading-none">Tanty Spice</p>
                                                <p className="text-xs font-bold text-white leading-tight">
                                                    {narration === 'loading' ? 'Getting ready…' : 'Reading aloud'}
                                                </p>
                                            </div>
                                            <span className="flex gap-0.5 ml-1" aria-hidden>
                                                {[0, 1, 2].map((i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-1 rounded-full bg-amber-300"
                                                        animate={{ height: [4, 14, 4] }}
                                                        transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.12 }}
                                                    />
                                                ))}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-h-0 overflow-y-auto bg-white lg:rounded-[2rem] px-6 sm:px-10 py-6 sm:py-10 flex flex-col">
                                <p className="text-xl sm:text-2xl lg:text-3xl leading-relaxed font-bold text-blue-950">
                                    {tokens.map((token, i) => token.isWord ? (
                                        <span
                                            key={i}
                                            className={`transition-colors duration-150 rounded-md px-0.5 ${token.wordIndex === highlightIndex ? 'bg-amber-300 text-blue-950' : ''}`}
                                        >
                                            {token.text}
                                        </span>
                                    ) : (
                                        <span key={i}>{token.text}</span>
                                    ))}
                                </p>
                                {pageData.question && (
                                    <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-amber-900 font-bold text-base">
                                        🤔 {pageData.question}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom controls — big, kid-friendly */}
                        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-black/30 backdrop-blur-md">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                                className="flex-1 max-w-[140px] py-4 bg-white/10 text-white rounded-2xl font-black flex items-center justify-center gap-1 disabled:opacity-30 active:scale-95 transition-all"
                            >
                                <ChevronLeft size={24} /> <span className="hidden sm:inline">Back</span>
                            </button>

                            <div className="flex flex-col items-center gap-1 min-w-0 max-w-[220px] sm:max-w-xs">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200">
                                    Tanty Spice narrator
                                </span>
                                <div className="relative flex items-center justify-center">
                                    {/* Animated Tanty Spice narrator avatar while audio plays/loads */}
                                    <motion.div
                                        aria-hidden
                                        className="absolute -left-14 sm:-left-16 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-300 shadow-lg bg-amber-100"
                                        animate={
                                            narration === 'playing'
                                                ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }
                                                : narration === 'loading'
                                                    ? { scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }
                                                    : { scale: 1, rotate: 0, opacity: 1 }
                                        }
                                        transition={
                                            narration === 'playing' || narration === 'loading'
                                                ? { repeat: Infinity, duration: narration === 'playing' ? 0.9 : 1.2, ease: 'easeInOut' }
                                                : { duration: 0.2 }
                                        }
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/images/tanty_spice_avatar.jpg"
                                            alt=""
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                        {(narration === 'playing' || narration === 'loading') && (
                                            <span className="absolute inset-0 rounded-full ring-2 ring-amber-400/70 animate-ping pointer-events-none" />
                                        )}
                                    </motion.div>
                                    <button
                                        onClick={toggleNarration}
                                        aria-label={narration === 'playing' ? 'Pause Tanty Spice narration' : 'Play Tanty Spice narration'}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 active:scale-90 transition-all"
                                    >
                                        {narration === 'loading' ? (
                                            <Loader2 size={30} className="animate-spin" />
                                        ) : narration === 'playing' ? (
                                            <Pause size={30} />
                                        ) : (
                                            <Play size={30} className="ml-1" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-[11px] sm:text-xs text-white/80 text-center leading-snug font-bold" role="status">
                                    {narrationNote}
                                </p>
                            </div>

                            <button
                                onClick={nextPage}
                                aria-label={currentPage >= pages.length - 1 ? 'Finish story' : 'Next page'}
                                className="flex-1 max-w-[140px] py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
                            >
                                <span className="hidden sm:inline">{currentPage >= pages.length - 1 ? 'Finish' : 'Next'}</span> <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
