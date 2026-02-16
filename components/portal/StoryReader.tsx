
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Volume2, Sparkles,
    X, Info, BookOpen, Brain, Play, RotateCcw, CheckCircle2, ArrowRight,
    Loader2, Pause, VolumeX, Mic2, Star
} from 'lucide-react';
import { StoryBook } from '@/types/story';
import { generateCharacterAudio } from '@/app/actions/voice';
import { generateImagesAction, saveStoryToLibraryAction } from '@/app/actions/story-actions';
import { useUser } from '@/components/UserContext';
import { logActivity } from '@/lib/database';

interface StoryReaderProps {
    story: StoryBook;
    onClose: () => void;
}

export default function StoryReader({ story, onClose }: StoryReaderProps) {
    const { activeChild } = useUser();
    const [currentPage, setCurrentPage] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingVoice, setIsLoadingVoice] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState<'tanty' | 'roti' | null>(null);
    const [autoPlay, setAutoPlay] = useState(true);
    const [hasSaved, setHasSaved] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pages = story.structure.pages;
    const totalSteps = pages.length + 2;

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playVoice = useCallback(async (text: string, character: 'tanty' | 'roti') => {
        if (isLoadingVoice) return;

        // Stop current audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsLoadingVoice(true);
        setActiveSpeaker(character);
        setIsPlaying(true);

        try {
            const result = await generateCharacterAudio(text, character);
            if (result.success && result.audio) {
                const audio = new Audio(result.audio);
                audioRef.current = audio;

                audio.onended = () => {
                    setIsPlaying(false);
                    setActiveSpeaker(null);
                };

                await audio.play();
            } else {
                throw new Error(result.error || "Failed to load voice");
            }
        } catch (err) {
            console.error("[Voice] Error:", err);
            setIsPlaying(false);
            setActiveSpeaker(null);
        } finally {
            setIsLoadingVoice(false);
        }
    }, [isLoadingVoice]);

    // Handle Auto-Play Narration on page change
    useEffect(() => {
        if (autoPlay && currentPage > 0 && currentPage <= pages.length) {
            const pageData = pages[currentPage - 1];
            // Tanty narrates the main text
            playVoice(pageData.narrative_text, 'tanty');
        } else if (currentPage === 0 && autoPlay) {
            // Narrate cover title
            playVoice(`Welcome to ${story.book_meta.title}. Written by Tanty Spice.`, 'tanty');
        }
    }, [currentPage, autoPlay, pages, story.book_meta.title, playVoice]);

    const handleNext = () => {
        if (currentPage < totalSteps - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setActiveSpeaker(null);
    };

    // Auto-generate images if missing in background
    useEffect(() => {
        const firstPage = story.structure.pages[0];
        if (!firstPage.illustration_url && !isGeneratingImages) {
            setIsGeneratingImages(true);
            generateImagesAction(story).then(result => {
                if (result.success && result.story) {
                    // Update the local story state if we had a setStory, 
                    // but since story is a prop, we just rely on parent or local mutation (careful)
                    // For now, we'll just let the reader re-render if we can.
                    // Actually, let's keep it simple for now and just set state once.
                }
                setIsGeneratingImages(false);
            });
        }
    }, [story.id]);

    const handleSave = async () => {
        if (!activeChild || hasSaved) return;
        setIsSaving(true);
        try {
            const result = await saveStoryToLibraryAction(story, activeChild.id);
            if (result.success) {
                setHasSaved(true);
                // Log the save activity
                logActivity(activeChild.parent_id, activeChild.id, 'save_story', result.id);
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinish = async () => {
        if (activeChild) {
            await logActivity(activeChild.parent_id, activeChild.id, 'read_story', story.id, 100, 300, {
                title: story.book_meta.title,
                level: story.book_meta.reading_level
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-deep flex flex-col items-center justify-center overflow-hidden">
            {/* 🌊 Background Ambient Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* 🎩 Top Navigation */}
            <header className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-3xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 border border-white/10 shadow-xl"
                    >
                        <X size={28} />
                    </button>

                    <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen size={16} className="text-white" />
                        </div>
                        <span className="text-white font-black text-xs uppercase tracking-widest">{story.book_meta.series}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border ${autoPlay ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                    >
                        <Sparkles size={16} /> {autoPlay ? 'Auto-Voice On' : 'Auto-Voice Off'}
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2" />

                    <button
                        onClick={() => isPlaying ? stopAudio() : currentPage > 0 && currentPage <= pages.length ? playVoice(pages[currentPage - 1].narrative_text, 'tanty') : null}
                        className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all shadow-xl ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-deep hover:bg-primary hover:text-white'}`}
                    >
                        {isLoadingVoice ? <Loader2 size={24} className="animate-spin" /> : (isPlaying ? <Pause size={28} /> : <Volume2 size={28} />)}
                    </button>
                </div>
            </header>

            {/* 📖 The Story Stage */}
            <div className="relative w-full h-full max-w-7xl flex items-center justify-center p-6 md:p-12">
                <AnimatePresence mode="wait">
                    {currentPage === 0 ? (
                        /* 🎨 COVER PAGE */
                        <motion.div
                            key="cover"
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 1.1, rotateY: 10 }}
                            className="w-full h-full bg-[#FFFBEB] rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[20px] border-white overflow-hidden flex relative"
                        >
                            <div className="w-[55%] p-24 flex flex-col justify-center space-y-12 relative z-10">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 text-primary rounded-full text-sm font-black uppercase tracking-[0.3em]">
                                        <Sparkles size={16} /> An Island Legend
                                    </div>
                                    <h1 className="text-8xl font-black text-deep leading-[1.1] tracking-tight italic drop-shadow-sm">
                                        {story.book_meta.title}
                                    </h1>
                                    <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white w-fit">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                                            <Image src="/images/tanty_spice_avatar.png" alt="Tanty Spice" fill className="object-cover" />
                                        </div>
                                        <p className="text-xl text-deep/60 font-bold italic">
                                            By <span className="text-deep font-black">Tanty Spice</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-fit bg-primary hover:bg-primary/90 text-white px-16 py-8 rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-6 group"
                                >
                                    Start Reading <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                                </button>
                            </div>

                            <div className="w-[45%] relative bg-zinc-200 shadow-inner">
                                {story.book_meta.cover_image_url ? (
                                    <Image src={story.book_meta.cover_image_url} alt="Cover" fill className="object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[12rem] drop-shadow-2xl">
                                        {story.folklore_profile.core_tradition === 'Anansi' ? '🕷️' : '🌳'}
                                    </div>
                                )}
                                {/* Spine Shadow */}
                                <div className="absolute left-0 top-0 bottom-0 w-12 bg-black/10 blur-xl" />
                            </div>
                        </motion.div>
                    ) : currentPage <= pages.length ? (
                        /* 📖 INTERACTIVE PAGE */
                        <motion.div
                            key={`page-${currentPage}`}
                            initial={{ opacity: 0, x: 200, rotateY: 45 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            exit={{ opacity: 0, x: -200, rotateY: -45 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="w-full h-full bg-white rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex relative"
                        >
                            {/* 🖼️ Illustration Side */}
                            <div className="w-1/2 relative bg-zinc-50 border-r-8 border-zinc-100/50 overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 opacity-[0.03] pattern-checkered-blue-500 scale-[3]" />
                                {pages[currentPage - 1].illustration_url ? (
                                    <Image src={pages[currentPage - 1].illustration_url!} alt="Illustration" fill className="object-cover" />
                                ) : (
                                    <div className="text-[18rem] filter drop-shadow-2xl animate-float">
                                        {story.folklore_profile.core_tradition === 'Anansi' ? '🕷️' : '🌳'}
                                    </div>
                                )}

                                {/* 👵 Tanty's Narrative Bubble */}
                                <div className={`absolute bottom-12 left-12 right-12 transition-all duration-500 ${activeSpeaker === 'tanty' ? 'scale-105' : 'opacity-80'}`}>
                                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white shadow-2xl relative">
                                        <div className="absolute -top-12 -left-6 w-24 h-24 rounded-full border-8 border-white shadow-xl overflow-hidden animate-bounce-slow">
                                            <Image src="/images/tanty_spice_avatar.png" alt="Tanty Spice" fill className="object-cover" />
                                        </div>
                                        <div className="pl-16 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] italic">Tanty Spice says...</p>
                                                {activeSpeaker === 'tanty' && (
                                                    <div className="flex gap-1 h-3 items-end">
                                                        {[...Array(4)].map((_, i) => (
                                                            <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-primary rounded-full" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xl text-deep font-bold italic leading-relaxed">
                                                "{pages[currentPage - 1].guide_interventions.tanty_spice_intro}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 📝 Text & Interactive Side */}
                            <div className="w-1/2 p-24 flex flex-col justify-between relative bg-white">
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <p className="text-sm font-black text-zinc-300 uppercase tracking-[0.4em]">Reader Mode</p>
                                        <h2 className="text-6xl md:text-7xl font-black text-deep leading-[1.2] tracking-tight hover:text-primary transition-colors cursor-pointer" onClick={() => playVoice(pages[currentPage - 1].narrative_text, 'tanty')}>
                                            {pages[currentPage - 1].narrative_text}
                                        </h2>
                                    </div>

                                    {/* 🤖 R.O.T.I's Reading Challenge */}
                                    <AnimatePresence>
                                        {pages[currentPage - 1].guide_interventions.roti_prompt && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => playVoice(pages[currentPage - 1].guide_interventions.roti_prompt!, 'roti')}
                                                className={`w-full group rounded-[3rem] p-8 transition-all text-left flex items-start gap-6 border-4 ${activeSpeaker === 'roti' ? 'bg-blue-600 border-blue-400 text-white shadow-2xl scale-[1.02]' : 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100'}`}
                                            >
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:rotate-12 ${activeSpeaker === 'roti' ? 'bg-white' : 'bg-blue-500'}`}>
                                                    <Image src="/images/roti-avatar.jpg" alt="R.O.T.I" fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-xs font-black uppercase tracking-widest ${activeSpeaker === 'roti' ? 'text-white/60' : 'text-blue-500'}`}>R.O.T.I Literacy Prompt</p>
                                                        {activeSpeaker === 'roti' && (
                                                            <div className="flex gap-1 h-3 items-end">
                                                                {[...Array(4)].map((_, i) => (
                                                                    <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-white rounded-full" />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className={`text-2xl font-black italic`}>
                                                        {pages[currentPage - 1].guide_interventions.roti_prompt}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Page Footer */}
                                <div className="flex items-center justify-between pt-12 border-t border-zinc-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📖</div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">CHAPTER PROGRESS</p>
                                            <p className="text-sm font-black text-deep">Page {currentPage} / {pages.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handlePrev}
                                            className="w-16 h-16 rounded-full bg-zinc-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all disabled:opacity-20"
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={32} />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-black flex items-center gap-4 transition-all shadow-xl shadow-primary/20 active:scale-95"
                                        >
                                            {currentPage === pages.length ? 'Finish' : 'Next Page'} <ChevronRight size={32} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Center Fold Line */}
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />
                        </motion.div>
                    ) : (
                        /* 🎉 ASSESSMENT PAGE */
                        <motion.div
                            key="assessment"
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full h-full bg-teal-50 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-24 flex flex-col items-center justify-center text-center space-y-12"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[-40px] border-4 border-dashed border-teal-200 rounded-full"
                                />
                                <div className="w-48 h-48 bg-white text-teal-500 rounded-[4rem] flex items-center justify-center text-[8rem] shadow-2xl animate-bounce-slow">
                                    🌟
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-8xl font-black text-teal-900 italic tracking-tight">Legendary Job!</h1>
                                <p className="text-2xl text-teal-700 font-bold max-w-2xl px-12">
                                    You just earned <span className="text-teal-900 font-black">+100 Island XP</span> for reading about <span className="underline decoration-teal-400 italic">{story.book_meta.title}</span>.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleFinish}
                                    className="bg-teal-600 hover:bg-teal-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-teal-200 active:scale-95 transition-all flex items-center gap-6 group"
                                >
                                    Finish Adventure <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                                </button>

                                {!hasSaved && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-white hover:bg-zinc-50 text-teal-600 border-4 border-teal-100 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-xl active:scale-95 transition-all flex items-center gap-6 group"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={32} /> : <BookOpen size={32} />}
                                        Save to My Books
                                    </button>
                                )}
                                {hasSaved && (
                                    <div className="bg-emerald-100 text-emerald-600 px-12 py-6 rounded-[2.5rem] font-black text-2xl flex items-center gap-4">
                                        <CheckCircle2 size={32} /> Saved to Shelf!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 📊 Bottom Progress Rail */}
            <div className="absolute bottom-12 w-full max-w-3xl flex items-center justify-between gap-6 px-12">
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentPage / (totalSteps - 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                </div>
                <span className="text-white/40 font-black uppercase tracking-widest text-xs min-w-[100px] text-right">
                    {Math.round((currentPage / (totalSteps - 1)) * 100)}% Complete
                </span>
            </div>
        </div>
    );
}
