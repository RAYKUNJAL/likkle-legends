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

    const handleSave = async () => {
        if (!onSave || isSaving || isSaved) return;
        setIsSaving(true);
        try {
            const res = await onSave();
            if (res.success) {
                setIsSaved(true);
                toast.success("Story tucked away in your library! 📚");
            } else {
                toast.error("Bookshelf is a bit wobbly... try again!");
            }
        } catch (err) {
            toast.error("Island magic failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            stopAudio();
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            stopAudio();
            setCurrentPage(currentPage - 1);
        }
    };

    const stopAudio = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const playNarration = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        const text = pages[currentPage].text;
        setIsLoadingAudio(true);

        try {
            const res = await getTantyVoice(text);
            if (res.success && res.audio) {
                const newAudio = new Audio(res.audio);
                newAudio.onended = () => setIsPlaying(false);
                setAudio(newAudio);
                setIsPlaying(true);
                newAudio.play().catch(e => {
                    console.error("Audio playback error:", e);
                    toast.error("Audio format not supported by your browser");
                    setIsPlaying(false);
                });
            } else {
                console.error("Voice generation failed:", res.error);
                toast.error("Tanty is clearing her throat... try again in a moment! (Voice Error)");
            }
        } catch (error) {
            console.error("Failed to play narration:", error);
            toast.error("Something went wrong with the island magic.");
        } finally {
            setIsLoadingAudio(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, [audio]);

    return (
        <div className="fixed inset-0 z-[200] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
            <div className="bg-white w-full max-w-6xl aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-500">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 bg-blue-950/10 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-xl font-black z-20 transition-all"
                    title="Close Story"
                    aria-label="Close Story"
                >
                    <X size={24} />
                </button>

                {/* Story Content */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    <div className="md:w-1/2 relative bg-blue-50 overflow-hidden shrink-0">
                        {pages[currentPage].imageUrl ? (
                            <img
                                key={pages[currentPage].imageUrl}
                                src={pages[currentPage].imageUrl!}
                                className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                                alt={`Page ${currentPage + 1}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-300">
                                <span className="text-6xl animate-pulse">🌴</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
                    </div>

                    <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center space-y-8 bg-white relative overflow-y-auto">
                        <div className="absolute top-10 left-10">
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{title}</span>
                            <p className="text-xs font-bold opacity-20">Page {currentPage + 1} of {pages.length}</p>
                        </div>

                        <p className="text-2xl md:text-3xl font-black text-blue-950 leading-tight">
                            "{pages[currentPage].text}"
                        </p>

                        <div className="pt-10 flex items-center gap-4">
                            <button
                                onClick={playNarration}
                                disabled={isLoadingAudio}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all hover:scale-110 active:scale-95 ${isPlaying ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}
                                title={isPlaying ? "Stop Narration" : "Play Narration"}
                                aria-label={isPlaying ? "Stop Narration" : "Play Narration"}
                            >
                                {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Volume2 size={32} />}
                            </button>

                            <div className="flex-1 flex gap-4 overflow-hidden">
                                {onSave && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || isSaved}
                                        className={`px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-md flex items-center gap-2 ${isSaved ? 'bg-green-100 text-green-600 cursor-default' : 'bg-primary text-white hover:scale-105 active:scale-95'}`}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? '✓ Saved' : 'Save to Library'}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={prevPage}
                                disabled={currentPage === 0}
                                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl ${currentPage === 0 ? 'bg-blue-50 text-blue-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:scale-105 border-b-8 border-blue-800'}`}
                                title="Previous Page"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={40} />
                            </button>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === pages.length - 1}
                                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl ${currentPage === pages.length - 1 ? 'bg-blue-50 text-blue-200 cursor-not-allowed' : 'bg-orange-600 text-white hover:scale-105 border-b-8 border-orange-800'}`}
                                title="Next Page"
                                aria-label="Next Page"
                            >
                                <ChevronRight size={40} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    className="h-4 bg-blue-50 w-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(((currentPage + 1) / pages.length) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={`Progress: ${Math.round(((currentPage + 1) / pages.length) * 100)}%`}
                >
                    <div
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
