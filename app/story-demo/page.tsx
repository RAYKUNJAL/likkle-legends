"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryData {
    title: string;
    summary: string;
    moral: string;
    character_id: string;
    pages: Array<{
        text: string;
        imagePrompt?: string;
        audioUrl?: string;
        words?: Array<{ text: string; start: number; end: number }>;
    }>;
}

export default function StoryDemoPage() {
    const [story, setStory] = useState<StoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [readerOpen, setReaderOpen] = useState(false);
    const [ReaderComponent, setReaderComponent] = useState<any>(null);

    useEffect(() => {
        fetch('/api/story-data')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setStory(data);
                }
            })
            .catch(err => setError(err.message || 'Failed to load story'))
            .finally(() => setLoading(false));
    }, []);

    // Lazy load InteractiveReader only when needed to optimize initial load
    useEffect(() => {
        if (readerOpen && !ReaderComponent) {
            import('@/components/InteractiveReader').then(mod => {
                setReaderComponent(() => mod.default);
            });
        }
    }, [readerOpen]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 size={48} className="text-orange-500" />
                </motion.div>
                <p className="ml-4 text-xl font-bold text-orange-800">Loading story magic...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-md">
                    <BookOpen size={64} className="mx-auto text-orange-300 mb-4" />
                    <h2 className="text-2xl font-black text-orange-900 mb-2">No Stories Yet</h2>
                    <p className="text-orange-600">{error}</p>
                    <p className="mt-4 text-sm text-orange-400">
                        Run <code className="bg-orange-50 px-2 py-1 rounded font-mono">npx tsx scripts/verify-story-agent.ts</code> to generate one!
                    </p>
                </div>
            </div>
        );
    }

    if (readerOpen && ReaderComponent && story) {
        const pages = story.pages.map(page => ({
            text: page.text,
            imageUrl: undefined,
            audioUrl: page.audioUrl || '',
            words: page.words
        }));

        return (
            <ReaderComponent
                title={story.title}
                pages={pages}
                guide={story.character_id === 'roti' ? 'roti' : 'tanty'}
                onClose={() => setReaderOpen(false)}
            />
        );
    }

    if (!story) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            <div className="max-w-4xl mx-auto py-16 px-6">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
                        <Sparkles size={16} /> Interactive Story Studio
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-orange-950 mb-4 leading-tight">
                        {story.title}
                    </h1>
                    <p className="text-xl text-orange-700 max-w-2xl mx-auto leading-relaxed">
                        {story.summary}
                    </p>
                </motion.div>

                {/* Story Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Cover Image Area */}
                    <div className="h-64 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300 flex items-center justify-center relative overflow-hidden">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="text-[120px]"
                        >
                            📖
                        </motion.div>
                        <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-orange-900">
                            {story.pages.length} Pages • Narrated by {story.character_id === 'roti' ? 'R.O.T.I.' : 'Tanty Spice'}
                        </div>
                    </div>

                    {/* Story Info */}
                    <div className="p-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-12 bg-orange-400 rounded-full" />
                            <div>
                                <p className="text-xs uppercase tracking-widest text-orange-400 font-bold">Moral of the Story</p>
                                <p className="text-lg font-bold text-orange-900">{story.moral}</p>
                            </div>
                        </div>

                        {/* Page Preview */}
                        <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                            <p className="text-sm font-bold text-orange-400 mb-2">Preview — Page 1</p>
                            <p className="text-orange-800 leading-relaxed">
                                {story.pages[0]?.text.substring(0, 200)}...
                            </p>
                        </div>

                        {/* Audio & Words Status */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-black text-green-600">{story.pages.length}</p>
                                <p className="text-xs text-green-500 font-bold">Pages</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-black text-blue-600">
                                    {story.pages.filter((p: any) => p.audioUrl).length}
                                </p>
                                <p className="text-xs text-blue-500 font-bold">Audio Ready</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-black text-purple-600">
                                    {story.pages.reduce((sum: number, p: any) => sum + (p.words?.length || 0), 0)}
                                </p>
                                <p className="text-xs text-purple-500 font-bold">Words Aligned</p>
                            </div>
                        </div>

                        {/* Open Reader Button */}
                        <button
                            onClick={() => setReaderOpen(true)}
                            className="w-full py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-black rounded-2xl shadow-lg shadow-orange-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <BookOpen size={28} />
                            Start Reading Adventure
                            <Sparkles size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
