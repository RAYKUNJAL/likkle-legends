'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Volume2, Loader2, MapPin, Clock, Star } from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface LibraryBook {
    id: string;
    title: string;
    slug: string;
    summary: string;
    cover_image_url: string | null;
    tradition: string;
    reading_level: string;
    age_track: string;
    island_code: string;
    character: string;
    xp_reward: number;
    estimated_reading_time_minutes: number;
    content?: { pages?: any[]; audio_urls?: string[] };
}

const TRADITION_LABELS: Record<string, string> = {
    anansi: 'Anansi 🕷️',
    papa_bois: 'Papa Bois 🌿',
    river_mumma: 'River Mumma 🧜‍♀️',
    chickcharney: 'Chickcharney 🦉',
    island_adventure: 'Island Adventure 🏝️',
};

export default function IslandStoriesPage() {
    const { user, activeChild } = useUser();
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const res = await fetch('/api/library/stories');
            const data = await res.json();
            setBooks(data.stories || []);
        } catch (err) {
            console.error('Failed to load stories', err);
        } finally {
            setLoading(false);
        }
    };

    const openBook = (book: LibraryBook) => {
        setSelectedBook(book);
        setCurrentPage(0);
        stopAudio();
    };

    const stopAudio = () => {
        if (audio) { audio.pause(); audio.currentTime = 0; }
        setPlaying(false);
        setAudio(null);
    };

    const playPageAudio = (pageText: string, audioUrl?: string) => {
        stopAudio();
        if (audioUrl) {
            const a = new Audio(audioUrl);
            a.onended = () => setPlaying(false);
            a.play();
            setAudio(a);
            setPlaying(true);
        } else {
            // Fallback: browser TTS
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(pageText);
                utterance.rate = 0.9;
                utterance.onend = () => setPlaying(false);
                window.speechSynthesis.speak(utterance);
                setPlaying(true);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Book reader view
    if (selectedBook) {
        const content = selectedBook.content as any;
        const pages = content?.pages || [];
        const audioUrls = content?.audio_urls || [];
        const page = pages[currentPage];

        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => { stopAudio(); setSelectedBook(null); }}
                    className="text-deep/60 font-bold hover:text-primary flex items-center gap-2"
                >
                    ← Back to Library
                </button>

                <div className="text-center">
                    <h1 className="text-3xl font-black text-deep italic">{selectedBook.title}</h1>
                    {selectedBook.summary && <p className="text-deep/50 mt-2">{selectedBook.summary}</p>}
                </div>

                {page && (
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 space-y-6">
                        <div className="text-center">
                            <span className="text-xs font-black text-primary uppercase tracking-widest">
                                Page {currentPage + 1} of {pages.length}
                            </span>
                        </div>

                        {/* Illustration placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 rounded-3xl flex items-center justify-center p-8">
                            <p className="text-center text-deep/30 text-sm font-bold max-w-md">
                                {page.illustration || '🎨 Caribbean illustration coming soon'}
                            </p>
                        </div>

                        {/* Story text */}
                        <p className="text-lg md:text-xl text-deep leading-relaxed font-bold text-center">
                            {page.text}
                        </p>

                        {/* Audio button */}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => playPageAudio(page.text, audioUrls[currentPage])}
                                disabled={playing}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Volume2 size={20} />
                                {playing ? 'Playing...' : audioUrls[currentPage] ? 'Hear Tanty Read' : 'Read Aloud'}
                            </button>
                            {playing && (
                                <button
                                    onClick={stopAudio}
                                    className="px-4 py-3 bg-red-100 text-red-600 rounded-full font-bold"
                                >
                                    Stop
                                </button>
                            )}
                        </div>

                        {/* Page navigation */}
                        <div className="flex justify-between items-center pt-4">
                            <button
                                onClick={() => { stopAudio(); setCurrentPage(p => Math.max(0, p - 1)); }}
                                disabled={currentPage === 0}
                                className="px-6 py-3 bg-zinc-100 rounded-full font-bold disabled:opacity-30"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm font-black text-deep/40">
                                {currentPage + 1} / {pages.length}
                            </span>
                            <button
                                onClick={() => { stopAudio(); setCurrentPage(p => Math.min(pages.length - 1, p + 1)); }}
                                disabled={currentPage === pages.length - 1}
                                className="px-6 py-3 bg-primary text-white rounded-full font-bold disabled:opacity-30"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Lesson at the end */}
                {currentPage === pages.length - 1 && content?.audio_urls?.length > 0 && (
                    <div className="text-center bg-amber-50 rounded-2xl p-6">
                        <p className="text-sm font-black text-amber-700 uppercase tracking-widest">🔊 Narrated by Tanty Spice</p>
                    </div>
                )}
            </div>
        );
    }

    // Library grid view
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-deep italic">Island Stories</h1>
                <p className="text-deep/50 font-bold">Tales from across the Caribbean — read by Tanty Spice 📖👵</p>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-deep/40 text-lg font-bold">No stories yet — check back soon!</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => {
                        const content = book.content as any;
                        const hasAudio = content?.audio_urls?.some((u: string) => u);
                        return (
                            <button
                                key={book.id}
                                onClick={() => openBook(book)}
                                className="group text-left bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-primary/20"
                            >
                                {/* Cover */}
                                <div className="aspect-video bg-gradient-to-br from-sky-100 via-purple-50 to-amber-50 flex items-center justify-center p-6 relative">
                                    <span className="text-5xl">{TRADITION_LABELS[book.tradition]?.split(' ')[1] || '🏝️'}</span>
                                    {hasAudio && (
                                        <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-2">
                                            <Volume2 size={16} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5 space-y-2">
                                    <h3 className="text-lg font-black text-deep leading-tight">{book.title}</h3>
                                    {book.summary && <p className="text-sm text-deep/50 line-clamp-2">{book.summary}</p>}
                                    <div className="flex items-center gap-3 text-xs font-bold text-deep/40 pt-2">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} /> {book.island_code}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {book.estimated_reading_time_minutes}min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={12} /> +{book.xp_reward} XP
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full capitalize">
                                            {TRADITION_LABELS[book.tradition]?.split(' ')[0] || book.tradition}
                                        </span>
                                        {hasAudio && (
                                            <span className="text-xs font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                                🔊 Audio
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
