"use client";

import { useState, useRef, useEffect } from 'react';
import {
    Sparkles, Wand2, BookOpen, User, AlertCircle, Volume2, VolumeX,
    Play, Pause, ChevronLeft, ChevronRight, Bookmark, Printer,
    Clock, BookMarked, Loader2, X, Heart, Share2, Download
} from 'lucide-react';
import { createStoryAction } from '@/app/actions/story';
import { siteContent } from '@/lib/content';
import { motion, AnimatePresence } from 'framer-motion';

import { StoryBook } from '@/types/story';

interface GeneratedStory extends Partial<StoryBook> {
    title: string;
    content: string;
    glossary?: { word: string; meaning: string }[];
    parentPrompt?: string;
}

export default function StoryGenerator() {
    const { ai_story_studio } = siteContent;
    const { form, upsell_note } = ai_story_studio;

    // Form State
    const [formData, setFormData] = useState({
        childName: "",
        primaryIsland: "Trinidad",
        guide: "Tanty Spice",
        location: "Rainforest",
        mission: "Folklore Quest",
        storyLength: "long" as 'short' | 'long'
    });

    // Story State
    const [result, setResult] = useState<GeneratedStory | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    // Player State
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<string[]>([]);
    const [isReaderMode, setIsReaderMode] = useState(false);

    // Audio State
    const [audioState, setAudioState] = useState<{
        loading: boolean;
        playing: boolean;
        currentTime: number;
        duration: number;
    }>({ loading: false, playing: false, currentTime: 0, duration: 0 });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    // Save State
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Parse story content into pages
    useEffect(() => {
        if (result?.content) {
            const paragraphs = result.content
                .split('\n\n')
                .filter(p => p.trim().length > 0)
                .map(p => cleanText(p));
            setPages(paragraphs);
            setCurrentPage(0);
        }
    }, [result]);

    // Clean text of any remaining markdown/formatting artifacts
    const cleanText = (text: string): string => {
        return text
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/\*/g, '')
            .replace(/_([^_]+)_/g, '$1')
            .replace(/^#+\s*/gm, '')
            .replace(/\[READING ASSISTANT TRIGGER\]/g, '')
            .replace(/✨/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/  +/g, ' ')
            .trim();
    };

    // Generate Story
    const handleGenerate = async () => {
        if (!formData.childName) return;
        setIsGenerating(true);
        setError("");
        setResult(null);
        setIsReaderMode(false);
        setIsSaved(false);

        try {
            const res = await createStoryAction(formData as any);
            if (res.success && res.story) {
                // Adapt StoryBook to GeneratedStory if necessary
                const story = res.story as any;
                const adaptedStory: GeneratedStory = {
                    ...story,
                    title: story.book_meta?.title || story.title || "Untitled Story",
                    content: story.structure?.pages?.map((p: any) => p.narrative_text).join('\n\n') || story.content || "",
                };
                setResult(adaptedStory);
            } else {
                setError(form.states.error_message || "Oye! The magic is sleeping.");
            }
        } catch (e) {
            setError("Something went wrong, darlin'.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Audio Controls
    const handlePlayAudio = async () => {
        if (audioState.playing) {
            audioRef.current?.pause();
            setAudioState(prev => ({ ...prev, playing: false }));
            return;
        }

        const textToRead = pages[currentPage] || result?.title || "";
        if (!textToRead) return;

        setAudioState(prev => ({ ...prev, loading: true }));

        try {
            const { readStorySegment } = await import('@/app/actions/storyteller');
            const res = await readStorySegment(textToRead);

            if (res.success && res.audio) {
                const audioSrc = res.audio.startsWith('data:') ? res.audio : `data:audio/mpeg;base64,${res.audio}`;
                const audio = new Audio(audioSrc);
                audio.playbackRate = playbackRate;
                audio.muted = isMuted;

                audio.onloadedmetadata = () => {
                    setAudioState(prev => ({ ...prev, duration: audio.duration }));
                };

                audio.ontimeupdate = () => {
                    setAudioState(prev => ({ ...prev, currentTime: audio.currentTime }));
                };

                audio.onended = () => {
                    setAudioState(prev => ({ ...prev, playing: false, currentTime: 0 }));
                    // Auto-advance to next page if available
                    if (currentPage < pages.length - 1) {
                        setTimeout(() => {
                            setCurrentPage(prev => prev + 1);
                        }, 1000);
                    }
                };

                audioRef.current = audio;
                await audio.play();
                setAudioState(prev => ({ ...prev, loading: false, playing: true }));
            } else {
                setAudioState(prev => ({ ...prev, loading: false }));
                console.error("Audio generation failed:", res.error);
            }
        } catch (e) {
            console.error("Audio error:", e);
            setAudioState(prev => ({ ...prev, loading: false }));
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setAudioState(prev => ({ ...prev, playing: false, currentTime: 0 }));
        }
    };

    // Page Navigation
    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            stopAudio();
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            stopAudio();
            setCurrentPage(prev => prev - 1);
        }
    };

    // Save Story to Account
    const handleSaveStory = async () => {
        if (!result || isSaved) return;
        setIsSaving(true);

        try {
            // Import Supabase client
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Show login prompt or redirect
                alert("Please log in to save your story!");
                setIsSaving(false);
                return;
            }

            const { error } = await supabase.from('saved_stories').insert({
                user_id: user.id,
                title: result.title,
                content: result.content,
                child_name: formData.childName,
                metadata: {
                    guide: formData.guide,
                    island: formData.primaryIsland,
                    location: formData.location,
                    mission: formData.mission,
                    length: formData.storyLength,
                    glossary: result.glossary,
                    parentPrompt: result.parentPrompt
                }
            });

            if (error) throw error;
            setIsSaved(true);
        } catch (e) {
            console.error("Save error:", e);
            alert("Could not save story. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Print Story
    const handlePrintStory = () => {
        if (!result) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const cleanContent = pages.join('\n\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${result.title} - Likkle Legends</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                    
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body {
                        font-family: 'Outfit', sans-serif;
                        max-width: 700px;
                        margin: 0 auto;
                        padding: 60px 40px;
                        color: #1a1a1a;
                        line-height: 1.8;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 30px;
                        border-bottom: 3px solid #FF6B35;
                    }
                    
                    .logo {
                        font-size: 12px;
                        font-weight: 900;
                        color: #FF6B35;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                    }
                    
                    h1 {
                        font-size: 36px;
                        font-weight: 900;
                        color: #0C3B2E;
                        margin-bottom: 10px;
                    }
                    
                    .dedication {
                        font-size: 18px;
                        color: #666;
                        font-style: italic;
                    }
                    
                    .story-content {
                        font-size: 18px;
                        margin-bottom: 40px;
                    }
                    
                    .story-content p {
                        margin-bottom: 20px;
                        text-indent: 30px;
                    }
                    
                    .story-content p:first-child {
                        text-indent: 0;
                    }
                    
                    .story-content p:first-child::first-letter {
                        font-size: 48px;
                        font-weight: 900;
                        color: #FF6B35;
                        float: left;
                        line-height: 1;
                        padding-right: 10px;
                    }
                    
                    .glossary {
                        background: #f8f8f8;
                        padding: 30px;
                        border-radius: 20px;
                        margin-top: 40px;
                    }
                    
                    .glossary h3 {
                        font-size: 14px;
                        font-weight: 900;
                        color: #FF6B35;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 15px;
                    }
                    
                    .glossary-item {
                        margin-bottom: 10px;
                    }
                    
                    .glossary-word {
                        font-weight: 700;
                        color: #0C3B2E;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 60px;
                        padding-top: 30px;
                        border-top: 1px solid #eee;
                        color: #999;
                        font-size: 12px;
                    }
                    
                    @media print {
                        body { padding: 40px 30px; }
                        .header { page-break-after: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🌴 Likkle Legends</div>
                    <h1>${result.title}</h1>
                    <p class="dedication">A story written for ${formData.childName}</p>
                </div>
                
                <div class="story-content">
                    ${pages.map(p => `<p>${p}</p>`).join('')}
                </div>
                
                ${result.glossary && result.glossary.length > 0 ? `
                    <div class="glossary">
                        <h3>🏝️ Island Words</h3>
                        ${result.glossary.map(g => `
                            <div class="glossary-item">
                                <span class="glossary-word">${g.word}:</span> ${g.meaning}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Created with love by Likkle Legends AI Story Studio</p>
                    <p>likklelegends.com</p>
                </div>
                
                <script>window.print();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Helper to get field config
    const getField = (id: string) => form.fields.find(f => f.id === id);

    const nameField = getField('child_name');
    const islandField = getField('island');
    const guideField = getField('guide');
    const locationField = getField('location');
    const missionField = getField('mission');

    // Format time for display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <section id="sample-letter" className="py-12 sm:py-24 bg-zinc-50">
            <div className="container px-4">
                <div className="max-w-6xl mx-auto bg-white rounded-[2rem] sm:rounded-[4rem] border-4 sm:border-8 border-primary/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                    {/* Left Panel - Form */}
                    <div className="lg:w-2/5 p-6 sm:p-10 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-100">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> AI Story Studio
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-deep mb-4 leading-tight">
                            {ai_story_studio.title}
                        </h2>
                        <p className="text-deep/60 text-sm mb-6 sm:mb-8 font-medium">
                            {ai_story_studio.subtitle}
                        </p>

                        <div className="space-y-4">
                            {/* Child Name */}
                            <div>
                                <label htmlFor="child-name" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{nameField?.label}</label>
                                <div className="relative">
                                    <input
                                        id="child-name"
                                        type="text"
                                        value={formData.childName}
                                        onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                        placeholder={nameField?.placeholder}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-deep/20" size={18} />
                                </div>
                            </div>

                            {/* Story Length Toggle */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">Story Length</label>
                                <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl">
                                    <button
                                        onClick={() => setFormData({ ...formData, storyLength: 'short' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${formData.storyLength === 'short'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-deep/40 hover:text-deep/60'
                                            }`}
                                    >
                                        <Clock size={16} />
                                        Short (~2 min)
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, storyLength: 'long' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${formData.storyLength === 'long'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-deep/40 hover:text-deep/60'
                                            }`}
                                    >
                                        <BookMarked size={16} />
                                        Full Story (~5 min)
                                    </button>
                                </div>
                            </div>

                            {/* Island & Guide */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="island-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{islandField?.label}</label>
                                    <select
                                        id="island-select"
                                        title={islandField?.label}
                                        value={formData.primaryIsland}
                                        onChange={(e) => setFormData({ ...formData, primaryIsland: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {islandField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="guide-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{guideField?.label}</label>
                                    <select
                                        id="guide-select"
                                        title={guideField?.label}
                                        value={formData.guide}
                                        onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {guideField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Location & Mission */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{locationField?.label}</label>
                                    <select
                                        id="location-select"
                                        title={locationField?.label}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {locationField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="mission-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{missionField?.label}</label>
                                    <select
                                        id="mission-select"
                                        title={missionField?.label}
                                        value={formData.mission}
                                        onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {missionField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!formData.childName || isGenerating}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20 mt-4"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {form.states.loading_message}
                                    </span>
                                ) : (
                                    <><Wand2 size={24} /> {form.primary_button.label}</>
                                )}
                            </button>

                            {error && (
                                <p className="text-red-500 text-xs font-bold text-center mt-4 flex items-center justify-center gap-1">
                                    <AlertCircle size={14} /> {error}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Story Display/Player */}
                    <div className="lg:w-3/5 bg-deep p-8 sm:p-10 lg:p-16 relative flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-primary rounded-full -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 blur-[80px] sm:blur-[120px] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-accent rounded-full -ml-20 sm:-ml-40 -mb-20 sm:-mb-40 blur-[80px] sm:blur-[120px] opacity-10"></div>

                        <div className="relative z-10 w-full">
                            {result ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isReaderMode ? 'reader' : 'preview'}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* Story Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">
                                                    <BookOpen size={28} />
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight pr-4">
                                                    {result.title}
                                                </h3>
                                                <p className="text-white/40 text-sm">
                                                    A {formData.storyLength === 'short' ? 'quick' : 'full'} adventure for {formData.childName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Page Content */}
                                        {isReaderMode && pages.length > 0 ? (
                                            <div className="space-y-6">
                                                {/* Current Page Display */}
                                                <div className="bg-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/10">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-primary text-xs font-black uppercase tracking-widest">
                                                            Page {currentPage + 1} of {pages.length}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {/* Playback Speed */}
                                                            <select
                                                                value={playbackRate}
                                                                onChange={(e) => {
                                                                    const rate = parseFloat(e.target.value);
                                                                    setPlaybackRate(rate);
                                                                    if (audioRef.current) audioRef.current.playbackRate = rate;
                                                                }}
                                                                className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border-none"
                                                                title="Playback Speed"
                                                            >
                                                                <option value="0.75">0.75x</option>
                                                                <option value="1">1x</option>
                                                                <option value="1.25">1.25x</option>
                                                                <option value="1.5">1.5x</option>
                                                            </select>
                                                            {/* Mute Toggle */}
                                                            <button
                                                                onClick={() => {
                                                                    setIsMuted(!isMuted);
                                                                    if (audioRef.current) audioRef.current.muted = !isMuted;
                                                                }}
                                                                className={`p-2 rounded-lg transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60 hover:text-white'}`}
                                                                title={isMuted ? "Unmute" : "Mute"}
                                                            >
                                                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence mode="wait">
                                                        <motion.p
                                                            key={currentPage}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            className="text-xl sm:text-2xl font-medium text-white/90 leading-relaxed"
                                                        >
                                                            {pages[currentPage]}
                                                        </motion.p>
                                                    </AnimatePresence>

                                                    {/* Audio Waveform / Progress Bar */}
                                                    {audioState.duration > 0 && (
                                                        <div className="mt-6 space-y-2">
                                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-gradient-to-r from-primary to-accent"
                                                                    animate={{ width: `${(audioState.currentTime / audioState.duration) * 100}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between text-xs text-white/40">
                                                                <span>{formatTime(audioState.currentTime)}</span>
                                                                <span>{formatTime(audioState.duration)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Audio & Navigation Controls */}
                                                <div className="flex items-center justify-between gap-4">
                                                    {/* Prev Button */}
                                                    <button
                                                        onClick={prevPage}
                                                        disabled={currentPage === 0}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentPage === 0
                                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                            }`}
                                                        title="Previous Page"
                                                        aria-label="Previous Page"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>

                                                    {/* Play Button */}
                                                    <button
                                                        onClick={handlePlayAudio}
                                                        disabled={audioState.loading}
                                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${audioState.playing
                                                            ? 'bg-red-500 text-white shadow-red-500/30'
                                                            : 'bg-primary text-white shadow-primary/30'
                                                            } hover:scale-105 active:scale-95`}
                                                        title={audioState.playing ? "Pause" : "Play with Tanty Spice's Voice"}
                                                        aria-label={audioState.playing ? "Pause" : "Play"}
                                                    >
                                                        {audioState.loading ? (
                                                            <Loader2 className="animate-spin" size={32} />
                                                        ) : audioState.playing ? (
                                                            <Pause size={32} />
                                                        ) : (
                                                            <Play size={32} className="ml-1" />
                                                        )}
                                                    </button>

                                                    {/* Next Button */}
                                                    <button
                                                        onClick={nextPage}
                                                        disabled={currentPage === pages.length - 1}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${currentPage === pages.length - 1
                                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                            }`}
                                                        title="Next Page"
                                                        aria-label="Next Page"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                </div>

                                                {/* Page Dots */}
                                                <div className="flex justify-center gap-2">
                                                    {pages.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                stopAudio();
                                                                setCurrentPage(i);
                                                            }}
                                                            className={`h-2 rounded-full transition-all ${i === currentPage
                                                                ? 'w-8 bg-primary'
                                                                : i < currentPage
                                                                    ? 'w-2 bg-primary/40'
                                                                    : 'w-2 bg-white/20'
                                                                }`}
                                                            title={`Go to page ${i + 1}`}
                                                            aria-label={`Go to page ${i + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Preview Mode */
                                            <div className="space-y-5 sm:space-y-6 max-h-[300px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                                                {pages.slice(0, 2).map((para, i) => (
                                                    <p key={i} className="text-lg sm:text-xl font-medium text-white/80 leading-relaxed">
                                                        {para}
                                                    </p>
                                                ))}
                                                {pages.length > 2 && (
                                                    <p className="text-white/40 italic">...and more</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            {!isReaderMode ? (
                                                <button
                                                    onClick={() => setIsReaderMode(true)}
                                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30"
                                                >
                                                    <Play size={20} /> Start Reading with Tanty Spice
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsReaderMode(false)}
                                                    className="w-full py-3 bg-white/10 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                                                >
                                                    <X size={16} /> Exit Reader Mode
                                                </button>
                                            )}

                                            <div className="flex flex-wrap gap-3">
                                                {/* Save Button */}
                                                <button
                                                    onClick={handleSaveStory}
                                                    disabled={isSaving || isSaved}
                                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isSaved
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-white/10 text-white hover:bg-white/20'
                                                        }`}
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : isSaved ? (
                                                        <Heart size={16} className="fill-current" />
                                                    ) : (
                                                        <Bookmark size={16} />
                                                    )}
                                                    {isSaved ? 'Saved!' : 'Save Story'}
                                                </button>

                                                {/* Print Button */}
                                                <button
                                                    onClick={handlePrintStory}
                                                    className="flex-1 py-3 bg-white/10 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                                                >
                                                    <Printer size={16} />
                                                    Print Story
                                                </button>
                                            </div>

                                            {/* Upsell Note */}
                                            <div className="pt-4">
                                                <p className="text-primary font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Sparkles size={16} /> Magical Snippet
                                                </p>
                                                <p className="text-white/40 text-sm">{upsell_note}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                /* Empty State */
                                <div className="text-center space-y-8 opacity-20 py-12">
                                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center p-6 border-2 border-white/20">
                                        <BookOpen size={48} className="text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white text-2xl font-black">Waiting for Adventure...</p>
                                        <p className="text-white/60">{form.states.idle_message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,107,53,0.3);
                    border-radius: 10px;
                }
            `}</style>
        </section>
    );
}
