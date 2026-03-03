"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
    X, Volume2, VolumeX, ChevronLeft, ChevronRight,
    Loader2, Play, Pause, HelpCircle, Star,
    Trophy, Sparkles, BookOpen, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateCharacterAudioWithMetadata } from '@/app/actions/voice';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';
import BadgeUnlockModal from './gamification/BadgeUnlockModal';

interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    glossaryWords?: string[];
    question?: string;
}

interface Story {
    id: string;
    title: string;
    summary: string;
    cover_image_url: string;
    content_json: {
        pages: StoryPage[];
        glossary: { word: string; meaning: string }[];
    };
    reading_time_minutes: number;
}

type GuideId = 'tanty' | 'roti' | 'dilly';

interface PremiumStoryReaderProps {
    story: Story;
    onClose: () => void;
    onComplete: (xpEarned: number) => void;
}

const GUIDE_META: Record<GuideId, { name: string; avatar: string; tagline: string }> = {
    tanty: {
        name: 'Tanty Spice',
        avatar: '/images/tanty_spice_avatar.jpg',
        tagline: 'Warm island storytelling',
    },
    roti: {
        name: 'R.O.T.I.',
        avatar: '/images/roti-new.jpg',
        tagline: 'Curious learning buddy',
    },
    dilly: {
        name: 'Dilly Doubles',
        avatar: '/images/dilly-doubles.jpg',
        tagline: 'Rhythm and reading',
    },
};

function buildTextTokens(text: string) {
    const parts = text.split(/(\s+)/);
    let wordIndex = 0;
    return parts.map((part) => {
        if (/^\s+$/.test(part)) {
            return { text: part, isWord: false, wordIndex: null as number | null };
        }
        const token = { text: part, isWord: true, wordIndex };
        wordIndex += 1;
        return token;
    });
}

export default function PremiumStoryReader({ story, onClose, onComplete }: PremiumStoryReaderProps) {
    const { user, activeChild, triggerBadgeUnlock, unlockedBadge, clearUnlockedBadge } = useUser();
    const [currentPage, setCurrentPage] = useState(0);
    const [readingMode, setReadingMode] = useState<'read-to-me' | 'read-by-myself'>('read-to-me');
    const [guide, setGuide] = useState<GuideId>('tanty');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

    // Audio refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wordTimingsRef = useRef<{ text: string; start: number; end: number }[]>([]);
    const lastWordIndexRef = useRef(0);
    const pages = story.content_json?.pages || [];
    const currentPageData = pages[currentPage] || { text: '', pageNumber: 1 };
    const textTokens = useMemo(() => buildTextTokens(currentPageData.text || ''), [currentPageData.text]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        setCurrentWordIndex(null);
    }, []);

    const handleComplete = useCallback(() => {
        stopAudio();
        setShowCompletion(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#1E90FF', '#32CD32']
        });
        // Wait for animation then call onComplete
        if (user && activeChild) {
            logActivity(user.id, activeChild.id, 'story', story.id, 100, 0, { title: story.title }).then(result => {
                if (result?.unlockedBadge) {
                    triggerBadgeUnlock(result.unlockedBadge);
                }
            }).catch(console.error);
        }

        setTimeout(() => {
            onComplete(100); // 100 XP fixed reward
        }, 5000);
    }, [stopAudio, onComplete]);

    const nextPage = useCallback(() => {
        if (currentPage < pages.length - 1) {
            stopAudio();
            setCurrentPage(currentPage + 1);
        } else {
            handleComplete();
        }
    }, [currentPage, pages.length, stopAudio, handleComplete]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            stopAudio();
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage, stopAudio]);

    // Voice Narration Logic
    const playNarration = useCallback(async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        setIsLoadingAudio(true);
        try {
            const res = await generateCharacterAudioWithMetadata(currentPageData?.text || "", guide);
            if (res.success && res.audio) {
                // If it's a base64 string, we need to handle it properly
                const audioSrc = res.audio.startsWith('data:') ? res.audio : `data:audio/mp3;base64,${res.audio}`;
                const audio = new Audio(audioSrc);
                audio.muted = isMuted;

                audio.onplay = () => {
                    setIsPlaying(true);
                    setIsLoadingAudio(false);
                };

                audio.onended = () => {
                    setIsPlaying(false);
                    setCurrentWordIndex(null);
                    if (isAutoPlaying && currentPage < pages.length - 1) {
                        setTimeout(nextPage, 1500); // Pause before next page
                    }
                };

                if (res.words && res.words.length > 0) {
                    wordTimingsRef.current = res.words;
                    lastWordIndexRef.current = 0;
                    setCurrentWordIndex(0);
                } else {
                    wordTimingsRef.current = [];
                    lastWordIndexRef.current = 0;
                    setCurrentWordIndex(null);
                }

                audio.ontimeupdate = () => {
                    const timings = wordTimingsRef.current;
                    if (!timings.length) return;
                    const currentTime = audio.currentTime;
                    let idx = lastWordIndexRef.current;
                    if (currentTime < timings[idx]?.start) idx = 0;
                    while (idx < timings.length && currentTime > timings[idx].end) {
                        idx += 1;
                    }
                    if (idx >= timings.length) idx = timings.length - 1;
                    if (idx !== lastWordIndexRef.current) {
                        lastWordIndexRef.current = idx;
                        setCurrentWordIndex(idx);
                    }
                };

                audioRef.current = audio;
                await audio.play();
            }
        } catch (error) {
            console.error("Narration error:", error);
            setIsLoadingAudio(false);
        }
    }, [isPlaying, currentPageData?.text, isMuted, isAutoPlaying, currentPage, pages.length, nextPage, stopAudio, guide]);

    // Auto-start narration on page change if in "Read to Me" mode
    useEffect(() => {
        if (readingMode === 'read-to-me' && !showCompletion) {
            playNarration();
        }
        return () => stopAudio();
    }, [currentPage, readingMode, showCompletion, playNarration, stopAudio]);

    return (
        <div className="fixed inset-0 z-[1000] bg-sky-950 flex items-center justify-center p-0 md:p-8 select-none">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/images/island-pattern.png')] bg-repeat opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-orange-500/20"></div>
            </div>

            <AnimatePresence mode="wait">
                {showCompletion ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 w-full max-w-2xl bg-white rounded-[4rem] p-12 text-center shadow-2xl border-8 border-orange-400"
                    >
                        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                            <Trophy size={64} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-black text-blue-900 mb-4 tracking-tight">GREAT READING!</h2>
                        <p className="text-xl text-blue-700/60 mb-8 font-bold">You've completed another Caribbean adventure!</p>

                        <div className="bg-blue-50 rounded-[3rem] p-8 mb-8 border-4 border-blue-100 relative overflow-hidden">
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">XP Earned</p>
                                    <p className="text-5xl font-black text-blue-900">+100</p>
                                </div>
                                <div className="w-px h-16 bg-blue-200"></div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Time Read</p>
                                    <p className="text-5xl font-black text-blue-900">{story.reading_time_minutes}m</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-orange-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            Return to Portal
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full max-w-[1400px] max-h-[900px] bg-white rounded-none md:rounded-[4rem] shadow-2xl flex flex-col relative overflow-hidden"
                    >
                        {/* Top Bar Controls */}
                        <div className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-50 bg-white/10 backdrop-blur-md border-b border-black/5">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-lg hover:bg-red-500 hover:text-white transition-all group"
                                    title="Close Reader"
                                    aria-label="Close Reader"
                                >
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                                <div className="hidden md:block">
                                    <h2 className="font-black text-blue-900 text-lg line-clamp-1">{story.title}</h2>
                                    <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Likkle Legends Island Tales</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 bg-blue-50 p-2 rounded-2xl">
                                <button
                                    onClick={() => {
                                        if (readingMode === 'read-to-me') {
                                            stopAudio();
                                            setReadingMode('read-by-myself');
                                        } else {
                                            setReadingMode('read-to-me');
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${readingMode === 'read-to-me' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-400'}`}
                                    title={readingMode === 'read-to-me' ? 'Switch to Read by Myself' : 'Switch to Read to Me'}
                                    aria-label={readingMode === 'read-to-me' ? 'Switch to Read by Myself' : 'Switch to Read to Me'}
                                >
                                    <Volume2 size={16} /> {readingMode === 'read-to-me' ? 'Read to Me' : 'Read to Myself'}
                                </button>
                                <div className="w-px h-6 bg-blue-200"></div>
                                <button
                                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${isAutoPlaying ? 'text-green-600' : 'text-blue-400'}`}
                                    title={isAutoPlaying ? 'Turn off Auto-Turn' : 'Turn on Auto-Turn'}
                                    aria-label={isAutoPlaying ? 'Turn off Auto-Turn' : 'Turn on Auto-Turn'}
                                >
                                    {isAutoPlaying ? 'Auto-Turn ON' : 'Auto-Turn OFF'}
                                </button>
                                <div className="hidden lg:flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-blue-100">
                                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Guide</span>
                                    {(['tanty', 'roti', 'dilly'] as GuideId[]).map((id) => (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                setGuide(id);
                                                stopAudio();
                                            }}
                                            className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all ${guide === id ? 'bg-blue-600 text-white' : 'text-blue-400 hover:text-blue-600'}`}
                                            title={`Switch to ${GUIDE_META[id].name}`}
                                            aria-label={`Switch to ${GUIDE_META[id].name}`}
                                        >
                                            {GUIDE_META[id].name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Story Content Area */}
                        <div className="flex-1 flex flex-col lg:flex-row relative">
                            {/* Illustration Side */}
                            <div className="flex-1 relative bg-sky-50 overflow-hidden group">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPage}
                                        initial={{ opacity: 0, x: 50, scale: 1.05 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                        transition={{ duration: 0.6, ease: "circOut" }}
                                        className="absolute inset-0"
                                    >
                                        {currentPageData.imageUrl ? (
                                            <Image
                                                src={currentPageData.imageUrl}
                                                alt={`Page ${currentPage + 1}`}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 to-blue-300">
                                                <div className="w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                                                <BookOpen size={120} className="text-white/30" />
                                            </div>
                                        )}
                                        {/* Subtle overlay for text legibility if needed, but here it's split */}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Page Number Overlay */}
                                <div className="absolute bottom-8 left-8 p-4 bg-black/20 backdrop-blur-md rounded-2xl text-white font-black text-sm">
                                    {currentPage + 1} / {pages.length}
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="lg:w-[45%] flex flex-col justify-center bg-white p-8 md:p-16 lg:p-20 relative border-l border-blue-50">
                                {/* Tanty Spice Guiding Avatar */}
                                <div className="absolute top-10 right-10 flex items-center gap-3">
                                    <div className={`relative w-16 h-16 rounded-full border-4 ${isPlaying ? 'border-green-400 animate-pulse' : 'border-blue-100'}`}>
                                        <Image
                                            src={GUIDE_META[guide].avatar}
                                            alt={GUIDE_META[guide].name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                        {isPlaying && (
                                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                                <Volume2 size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-2xl hidden md:block">
                                        <p className="text-[10px] font-black text-blue-900 uppercase">Listening Guide</p>
                                        <p className="text-[12px] font-bold text-blue-400">{GUIDE_META[guide].name}</p>
                                        <p className="text-[10px] font-bold text-blue-300">{GUIDE_META[guide].tagline}</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="lg:hidden flex flex-wrap items-center gap-2 bg-blue-50 p-3 rounded-2xl border border-blue-100">
                                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Guide</span>
                                        {(['tanty', 'roti', 'dilly'] as GuideId[]).map((id) => (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    setGuide(id);
                                                    stopAudio();
                                                }}
                                                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all ${guide === id ? 'bg-blue-600 text-white' : 'text-blue-400 hover:text-blue-600'}`}
                                                title={`Switch to ${GUIDE_META[id].name}`}
                                                aria-label={`Switch to ${GUIDE_META[id].name}`}
                                            >
                                                {GUIDE_META[id].name}
                                            </button>
                                        ))}
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentPage}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="min-h-[200px]"
                                        >
                                            <h3 className={`text-4xl md:text-5xl font-black leading-[1.3] tracking-tight whitespace-pre-wrap ${isPlaying ? 'text-blue-900 underline decoration-primary/30 decoration-8 underline-offset-8' : 'text-blue-900/80'}`}>
                                                {textTokens.map((token, i) => {
                                                    if (!token.isWord) {
                                                        return <span key={`space-${i}`}>{token.text}</span>;
                                                    }
                                                    const isActive = currentWordIndex !== null && token.wordIndex === currentWordIndex;
                                                    return (
                                                        <span
                                                            key={`word-${i}`}
                                                            className={isActive ? 'bg-yellow-200 text-blue-900 rounded-md px-1 shadow-sm' : ''}
                                                        >
                                                            {token.text}
                                                        </span>
                                                    );
                                                })}
                                            </h3>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Glossary Hotspots if any */}
                                    {currentPageData.glossaryWords && currentPageData.glossaryWords.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                            {currentPageData.glossaryWords.map((word, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setShowGlossary(true)}
                                                    className="px-6 py-3 bg-orange-50 text-orange-600 rounded-2xl font-black text-sm border-2 border-orange-100 hover:bg-orange-100 transition-colors flex items-center gap-2"
                                                >
                                                    <HelpCircle size={18} /> {word}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Interactive Button Group */}
                                    <div className="flex items-center gap-6 pt-12">
                                        <button
                                            onClick={playNarration}
                                            disabled={isLoadingAudio}
                                            className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 text-white shadow-red-200' : 'bg-orange-500 text-white shadow-orange-200'}`}
                                            title={isPlaying ? 'Pause Narration' : 'Start Narration'}
                                            aria-label={isPlaying ? 'Pause Narration' : 'Start Narration'}
                                        >
                                            {isLoadingAudio ? <Loader2 size={40} className="animate-spin" /> : (isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />)}
                                        </button>

                                        <div className="flex-1 h-3 bg-blue-50 rounded-full overflow-hidden relative">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="h-32 bg-white border-t border-blue-50 px-8 flex items-center justify-between">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 0}
                                className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xl transition-all ${currentPage === 0 ? 'text-blue-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                <ChevronLeft size={32} /> Back
                            </button>

                            <div className="flex gap-2">
                                {pages.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentPage ? 'w-10 bg-primary' : (i < currentPage ? 'bg-primary/40' : 'bg-blue-100')}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextPage}
                                className={`flex items-center gap-4 px-12 py-5 rounded-[2rem] font-black text-xl transition-all bg-gradient-to-r from-primary to-accent text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95`}
                            >
                                {currentPage === pages.length - 1 ? 'Finish!' : 'Next'} <ChevronRight size={32} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glossary Sidebar Overlays */}
            <AnimatePresence>
                {showGlossary && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowGlossary(false)}
                            className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-[1100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[1200] flex flex-col"
                        >
                            <div className="p-10 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-black text-blue-900 tracking-tight">Island Words</h3>
                                    <p className="text-orange-600 font-bold uppercase text-[10px] tracking-widest">Glossary & Meaning</p>
                                </div>
                                <button
                                    onClick={() => setShowGlossary(false)}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm"
                                    title="Close Glossary"
                                    aria-label="Close Glossary"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                {(story.content_json?.glossary || []).map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">🌴</span>
                                            <p className="text-2xl font-black text-blue-900 group-hover:text-orange-600 transition-colors uppercase">{item.word}</p>
                                        </div>
                                        <p className="text-lg text-blue-700/60 leading-relaxed font-bold pl-8 border-l-4 border-orange-100">
                                            {item.meaning}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
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
