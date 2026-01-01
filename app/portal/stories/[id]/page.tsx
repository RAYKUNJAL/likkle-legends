"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Volume2,
    Bookmark, Share2, Home, Star, HelpCircle
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import VoiceNarrator from '@/components/VoiceNarrator';
import { supabase } from '@/lib/storage';
import { logActivity } from '@/lib/database';
import { XP_ACTIONS } from '@/lib/gamification';

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
    audio_narration_url?: string;
    character_id?: string;
    reading_time_minutes: number;
}

export default function StoryReaderPage() {
    const params = useParams();
    const router = useRouter();
    const { user, activeChild, canAccess } = useUser();
    const storyId = params.id as string;

    const [story, setStory] = useState<Story | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showGlossary, setShowGlossary] = useState(false);
    const [isNarrating, setIsNarrating] = useState(false);
    const [readingStartTime] = useState(Date.now());

    useEffect(() => {
        loadStory();
    }, [storyId]);

    const loadStory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('storybooks')
                .select('*')
                .eq('id', storyId)
                .single();

            if (error) throw error;
            setStory(data as Story);
        } catch (error) {
            console.error('Failed to load story:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextPage = () => {
        if (!story) return;
        if (currentPage < story.content_json.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            // Story completed
            handleStoryComplete();
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleStoryComplete = async () => {
        if (!user || !activeChild) return;

        // Calculate reading time
        const readingTime = Math.round((Date.now() - readingStartTime) / 1000);

        // Log activity and award XP
        await logActivity(
            user.id,
            activeChild.id,
            'story',
            storyId,
            XP_ACTIONS.STORY_COMPLETED,
            readingTime,
            { title: story?.title }
        );

        // Show completion modal or redirect
        router.push('/portal?completed=story');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-primary mb-4 mx-auto animate-pulse" />
                    <p className="text-gray-500 font-medium">Loading story...</p>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-100 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Story not found</p>
                    <Link href="/portal" className="text-primary font-bold">
                        Back to Portal
                    </Link>
                </div>
            </div>
        );
    }

    const pages = story.content_json?.pages || [];
    const page = pages[currentPage];
    const totalPages = pages.length;
    const progress = ((currentPage + 1) / totalPages) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/portal"
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-gray-900 line-clamp-1">{story.title}</h1>
                            <p className="text-xs text-gray-400">
                                Page {currentPage + 1} of {totalPages}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowGlossary(!showGlossary)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Glossary"
                        >
                            <HelpCircle size={22} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Bookmark" aria-label="Bookmark">
                            <Bookmark size={22} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-1 bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Story Page */}
                    <div className="relative">
                        {/* Page Image */}
                        {page?.imageUrl && (
                            <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-secondary/10">
                                <img
                                    src={page.imageUrl}
                                    alt={`Page ${currentPage + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Page Content */}
                        <div className="p-8 md:p-12">
                            {/* Voice Narrator */}
                            {page?.text && (
                                <div className="mb-6">
                                    <VoiceNarrator
                                        text={page.text}
                                        voice="tanty_spice"
                                        onStart={() => setIsNarrating(true)}
                                        onEnd={() => setIsNarrating(false)}
                                    />
                                </div>
                            )}

                            {/* Story Text */}
                            <p className={`text-xl md:text-2xl leading-relaxed text-gray-800 font-serif ${isNarrating ? 'bg-primary/5 p-4 rounded-xl' : ''
                                }`}>
                                {page?.text}
                            </p>

                            {/* Glossary Words */}
                            {page?.glossaryWords && page.glossaryWords.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {page.glossaryWords.map((word, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium cursor-pointer hover:bg-amber-200 transition-colors"
                                            onClick={() => setShowGlossary(true)}
                                        >
                                            🌴 {word}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Interactive Question */}
                            {page?.question && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                    <p className="font-bold text-purple-800 mb-2">🤔 Think About It:</p>
                                    <p className="text-purple-700">{page.question}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentPage === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                }`}
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        {/* Page Dots */}
                        <div className="flex gap-1">
                            {pages.slice(
                                Math.max(0, currentPage - 3),
                                Math.min(totalPages, currentPage + 4)
                            ).map((_, i) => {
                                const pageIndex = Math.max(0, currentPage - 3) + i;
                                return (
                                    <button
                                        key={pageIndex}
                                        onClick={() => setCurrentPage(pageIndex)}
                                        className={`w-2 h-2 rounded-full transition-all ${pageIndex === currentPage
                                            ? 'w-6 bg-primary'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        aria-label={`Go to page ${pageIndex + 1}`}
                                    />
                                );
                            })}
                        </div>

                        <button
                            onClick={handleNextPage}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            {currentPage === totalPages - 1 ? (
                                <>
                                    <Star size={20} />
                                    Complete Story
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* Glossary Sidebar */}
            {showGlossary && story.content_json?.glossary && (
                <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900">🌴 Glossary</h3>
                            <button
                                onClick={() => setShowGlossary(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {story.content_json.glossary.map((item, i) => (
                                <div key={i} className="p-4 bg-amber-50 rounded-xl">
                                    <p className="font-bold text-amber-800 mb-1">{item.word}</p>
                                    <p className="text-amber-700 text-sm">{item.meaning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
