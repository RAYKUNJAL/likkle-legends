"use client";

import React, { useState, useEffect } from 'react';
import { getTantyVoice } from '@/app/actions/voice';
import { X, Volume2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { StoryPage } from '@/lib/types';
import toast from 'react-hot-toast';

interface StoryReaderProps {
    title: string;
    pages: StoryPage[];
    onClose: () => void;
    onSave?: () => Promise<{ success: boolean; id?: string }>;
}

export default function StoryReader({ title, pages, onClose, onSave }: StoryReaderProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const stopAudio = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            stopAudio();
            setCurrentPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            stopAudio();
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleSave = async () => {
        if (!onSave || isSaving || isSaved) return;
        setIsSaving(true);
        try {
            const res = await onSave();
            if (res.success) {
                setIsSaved(true);
                toast.success('Story tucked away in your library!');
            } else {
                toast.error('Bookshelf is a bit wobbly. Try again.');
            }
        } catch {
            toast.error('Island magic failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    const playNarration = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        const text = pages[currentPage]?.text || '';
        if (!text) return;

        setIsLoadingAudio(true);
        try {
            const res = await getTantyVoice(text);
            if (res.success && res.audio) {
                const newAudio = new Audio(res.audio);
                newAudio.onended = () => setIsPlaying(false);
                setAudio(newAudio);
                setIsPlaying(true);
                await newAudio.play();
            } else {
                toast.error('Voice is unavailable right now.');
            }
        } catch {
            toast.error('Something went wrong with narration.');
            setIsPlaying(false);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audio) audio.pause();
        };
    }, [audio]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') nextPage();
            if (event.key === 'ArrowLeft') prevPage();
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const page = pages[currentPage];

    return (
        <div className="fixed inset-0 z-[200] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8">
            <div className="bg-white w-full max-w-6xl h-[95vh] md:h-[92vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">
                <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b border-blue-100 bg-white">
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-xs font-black uppercase text-orange-500 tracking-widest truncate">{title}</p>
                        <p className="text-xs md:text-sm font-bold text-blue-900/40">Page {currentPage + 1} of {pages.length}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 md:w-12 md:h-12 bg-blue-950/10 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all shrink-0"
                        title="Exit Story"
                        aria-label="Exit Story"
                    >
                        <X size={22} />
                    </button>
                </header>

                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    <div className="md:w-1/2 h-[34vh] md:h-auto relative bg-blue-50 overflow-hidden shrink-0">
                        {page?.imageUrl ? (
                            <img
                                key={page.imageUrl}
                                src={page.imageUrl}
                                className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                                alt={`Page ${currentPage + 1}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-300">
                                <span className="text-6xl animate-pulse">Story</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col min-h-0 bg-white">
                        <div className="flex-1 overflow-y-auto">
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-[2rem] font-black text-blue-950 leading-snug whitespace-pre-wrap break-words">
                                "{page?.text || ''}"
                            </p>
                        </div>

                        <div className="pt-4 md:pt-6 flex flex-wrap items-center gap-3 md:gap-4 border-t border-blue-100 mt-4">
                            <button
                                onClick={playNarration}
                                disabled={isLoadingAudio}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}
                                title={isPlaying ? 'Stop Narration' : 'Play Narration'}
                                aria-label={isPlaying ? 'Stop Narration' : 'Play Narration'}
                            >
                                {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Volume2 size={24} />}
                            </button>

                            <div className="flex-1 flex flex-wrap gap-2 md:gap-3">
                                {onSave && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || isSaved}
                                        className={`px-4 md:px-5 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-md flex items-center gap-2 ${isSaved ? 'bg-green-100 text-green-600 cursor-default' : 'bg-primary text-white hover:scale-105 active:scale-95'}`}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? 'Saved' : 'Save to Library'}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-4 md:px-5 py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-all"
                                >
                                    Exit Story
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 py-3 md:py-4 border-t border-blue-100 bg-white flex items-center justify-between gap-3">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className={`min-w-[120px] md:min-w-[150px] h-11 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wider transition-all ${currentPage === 0 ? 'bg-blue-50 text-blue-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:scale-[1.02]'}`}
                        title="Previous Page"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                    <p className="text-xs md:text-sm font-black text-blue-900/50 text-center">Turn the page</p>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === pages.length - 1}
                        className={`min-w-[120px] md:min-w-[150px] h-11 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wider transition-all ${currentPage === pages.length - 1 ? 'bg-blue-50 text-blue-200 cursor-not-allowed' : 'bg-orange-600 text-white hover:scale-[1.02]'}`}
                        title="Next Page"
                        aria-label="Next Page"
                    >
                        Next <ChevronRight size={20} />
                    </button>
                </div>

                <div className="h-3 md:h-4 bg-blue-50 w-full overflow-hidden" title={`Progress: ${Math.round(((currentPage + 1) / pages.length) * 100)}%`}>
                    <div
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
