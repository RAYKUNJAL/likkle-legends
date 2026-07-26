'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Volume2, Loader2, MapPin, Clock, Star } from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface LibraryBookPage {
    text: string;
    illustration?: string;
    image_url?: string;
}

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
    content?: { pages?: LibraryBookPage[]; audio_urls?: string[] };
}

const TRADITION_LABELS: Record<string, string> = {
    anansi: 'Anansi 🕷️',
    papa_bois: 'Papa Bois 🌿',
    river_mumma: 'River Mumma 🧜‍♀️',
    chickcharney: 'Chickcharney 🦉',
    island_adventure: 'Island Adventure 🏝️',
};

/**
 * Normalize audio URLs stored in the DB.
 * The DB was rewritten from internal Docker-network URLs (http://supabase-kong:8000)
 * to public URLs (https://www.likklelegends.com/supabase), but some rows or
 * freshly-generated entries may still carry the internal form. This guard
 * rewrites any remaining internal URLs to the public form so the browser
 * can actually fetch them.
 */
function normalizeAudioUrl(url: string | undefined | null): string | undefined {
    if (!url || typeof url !== 'string') return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    if (trimmed.includes('supabase-kong')) {
        return trimmed
            .replace(/https?:\/\/supabase-kong:8000/, 'https://www.likklelegends.com/supabase')
            .replace(/https?:\/\/supabase-kong:443/, 'https://www.likklelegends.com/supabase');
    }
    return trimmed;
}

interface WordTiming {
    start: number; // seconds
    end: number;   // seconds
}

/**
 * Split page text into individual words (whitespace-collapsed).
 */
function splitWords(text: string): string[] {
    return text.split(/\s+/).filter(Boolean);
}

/**
 * Estimate per-word timings proportionally based on the audio duration.
 * Each word's duration is weighted by its character count so longer
 * words get more time, mimicking natural narration cadence.
 */
function estimateWordTimings(words: string[], duration: number): WordTiming[] {
    if (words.length === 0 || !duration || !isFinite(duration) || duration <= 0) {
        return [];
    }

    const totalChars = words.reduce(
        (sum, w) => sum + Math.max(w.replace(/[^\w]/g, '').length, 1),
        0,
    );

    const timings: WordTiming[] = [];
    let currentTime = 0;

    for (const word of words) {
        const charLen = Math.max(word.replace(/[^\w]/g, '').length, 1);
        // per_word_duration = (charLen / totalChars) * audio_duration
        const wordDuration = (charLen / totalChars) * duration;
        timings.push({
            start: currentTime,
            end: currentTime + wordDuration,
        });
        currentTime += wordDuration;
    }

    // Ensure the last word ends exactly at the audio duration
    if (timings.length > 0) {
        timings[timings.length - 1].end = duration;
    }

    return timings;
}

export default function IslandStoriesPage() {
    const { user, activeChild } = useUser();
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [highlightedWord, setHighlightedWord] = useState(-1);

    // Refs for audio + word tracking (avoid stale closures in event handlers)
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const timingsRef = useRef<WordTiming[]>([]);
    const highlightedRef = useRef(-1);

    useEffect(() => {
        loadBooks();
    }, []);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Reset word highlighting + refs when page or book changes
    useEffect(() => {
        setHighlightedWord(-1);
        highlightedRef.current = -1;
        wordRefs.current = [];
        timingsRef.current = [];
    }, [currentPage, selectedBook]);

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
        stopAudio();
        setSelectedBook(book);
        setCurrentPage(0);
    };

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        timingsRef.current = [];
        highlightedRef.current = -1;
        setHighlightedWord(-1);
        setPlaying(false);
        // Stop browser TTS fallback too
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    // Auto-scroll the highlighted word into view (works on touch + desktop)
    useEffect(() => {
        if (highlightedWord < 0) return;
        const el = wordRefs.current[highlightedWord];
        if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [highlightedWord]);

    const playPageAudio = (pageText: string, audioUrl?: string) => {
        stopAudio();

        const normalizedUrl = normalizeAudioUrl(audioUrl);

        if (normalizedUrl) {
            const a = new Audio();
            a.src = normalizedUrl;
            a.preload = 'auto';
            audioRef.current = a;

            // Compute word timings once the audio duration is known
            a.addEventListener('loadedmetadata', () => {
                const words = splitWords(pageText);
                timingsRef.current = estimateWordTimings(words, a.duration);
            });

            // Update highlighted word on every timeupdate tick
            a.addEventListener('timeupdate', () => {
                const timings = timingsRef.current;
                if (timings.length === 0) return;

                const t = a.currentTime;
                let idx = -1;

                // Linear scan (page texts are short — typically < 100 words)
                for (let i = 0; i < timings.length; i++) {
                    if (t >= timings[i].start && t < timings[i].end) {
                        idx = i;
                        break;
                    }
                }

                // Past the last word — highlight the final word
                if (idx === -1 && t > 0 && timings.length > 0) {
                    idx = timings.length - 1;
                }

                if (idx !== highlightedRef.current) {
                    highlightedRef.current = idx;
                    setHighlightedWord(idx);
                }
            });

            a.addEventListener('ended', () => {
                highlightedRef.current = -1;
                setHighlightedWord(-1);
                setPlaying(false);
            });

            a.addEventListener('error', () => {
                console.error('[IslandStories] Audio playback error:', normalizedUrl);
                highlightedRef.current = -1;
                setHighlightedWord(-1);
                setPlaying(false);
            });

            a.play().catch((err) => {
                console.error('[IslandStories] Audio play() failed:', err);
                setPlaying(false);
            });

            setPlaying(true);
        } else {
            // Fallback: browser TTS (no word highlighting available)
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(pageText);
                utterance.rate = 0.9;
                utterance.onend = () => setPlaying(false);
                utterance.onerror = () => setPlaying(false);
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
        const currentAudioUrl = normalizeAudioUrl(audioUrls[currentPage]);
        const hasAudio = !!currentAudioUrl;
        const words = page ? splitWords(page.text) : [];

        const getWordClassName = (i: number) => {
            // Smooth color transition on all words so the highlight glides
            const base = 'transition-colors duration-300 ease-out';
            if (!playing) {
                return `${base} text-deep`;
            }
            if (i === highlightedWord) {
                return `${base} text-primary bg-primary/10 rounded px-1 -mx-1 font-black`;
            }
            if (highlightedWord >= 0 && i < highlightedWord) {
                return `${base} text-primary/60`;
            }
            return `${base} text-deep/40`;
        };

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

                        {/* Illustration — FLUX artwork if available, otherwise description placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 rounded-3xl flex items-center justify-center p-8 overflow-hidden">
                            {page.image_url ? (
                                <img
                                    src={page.image_url}
                                    alt={page.illustration || `Illustration for page ${currentPage + 1}`}
                                    className="w-full h-full object-contain rounded-3xl"
                                    loading="lazy"
                                />
                            ) : (
                                <p className="text-center text-deep/30 text-sm font-bold max-w-md">
                                    {page.illustration || '🎨 Caribbean illustration coming soon'}
                                </p>
                            )}
                        </div>

                        {/* Story text — word-by-word with karaoke highlighting */}
                        <p className="text-lg md:text-xl text-deep leading-relaxed font-bold text-center">
                            {hasAudio && words.length > 0 ? (
                                words.map((word, i) => (
                                    <span key={i}>
                                        <span
                                            ref={(el) => { wordRefs.current[i] = el; }}
                                            className={getWordClassName(i)}
                                        >
                                            {word}
                                        </span>
                                        {i < words.length - 1 ? ' ' : ''}
                                    </span>
                                ))
                            ) : (
                                page.text
                            )}
                        </p>

                        {/* Audio button — shows "Hear Tanty Read" when audio_urls exist for this page */}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => playPageAudio(page.text, audioUrls[currentPage])}
                                disabled={playing}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Volume2 size={20} />
                                {playing ? 'Playing...' : hasAudio ? 'Hear Tanty Read' : 'Read Aloud'}
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
                        const hasAudio = content?.audio_urls?.some((u: string) => normalizeAudioUrl(u));
                        const coverImage = content?.pages?.[0]?.image_url;
                        const hasIllustrations = !!(content?.pages?.some((p: any) => p.image_url));
                        return (
                            <button
                                key={book.id}
                                onClick={() => openBook(book)}
                                className="group text-left bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-primary/20"
                            >
                                {/* Cover */}
                                <div className="aspect-video bg-gradient-to-br from-sky-100 via-purple-50 to-amber-50 flex items-center justify-center p-6 relative overflow-hidden">
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover absolute inset-0"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="text-5xl">{TRADITION_LABELS[book.tradition]?.split(' ')[1] || '🏝️'}</span>
                                    )}
                                    {hasAudio && (
                                        <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-2 z-10">
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
                                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full capitalize">
                                            {TRADITION_LABELS[book.tradition]?.split(' ')[0] || book.tradition}
                                        </span>
                                        {hasAudio && (
                                            <span className="text-xs font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                                🔊 Audio
                                            </span>
                                        )}
                                        {hasIllustrations && (
                                            <span className="text-xs font-black text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                🎨 Illustrated
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
