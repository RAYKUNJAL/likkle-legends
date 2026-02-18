
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateStoryAction } from '@/app/actions/generate-story';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Search, BookOpen, Loader } from 'lucide-react';

const ISLANDS = [
    { id: 'Jamaica', name: 'Jamaica', emoji: '🇯🇲' },
    { id: 'Trinidad and Tobago', name: 'Trinidad & Tobago', emoji: '🇹🇹' },
    { id: 'Barbados', name: 'Barbados', emoji: '🇧🇧' },
    { id: 'Guyana', name: 'Guyana', emoji: '🇬🇾' },
    { id: 'Saint Lucia', name: 'St. Lucia', emoji: '🇱🇨' },
    { id: 'Grenada', name: 'Grenada', emoji: '🇬🇩' },
];

const LOADING_MESSAGES = [
    "Calling Tanty Spice...",
    "Gathering folklore...",
    "Mixing the colours...",
    "Learning the dialect...",
    "Waking up the characters...",
    "Adding Caribbean sunshine...",
    "Almost ready!"
];

export default function StoryStudioPage() {
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [island, setIsland] = useState('Trinidad and Tobago'); // Default for now
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        setError(null);
        setLoadingMessageIndex(0);

        // Fun loading message cycle
        const interval = setInterval(() => {
            setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 4000);

        try {
            const result = await generateStoryAction({
                topic,
                island_override: island
            });

            clearInterval(interval);

            if (result.success && result.storyId) {
                router.push(`/library/stories/${result.storyId}`);
            } else {
                setError(result.error || 'Failed to generate story.');
                setLoading(false);
            }
        } catch (err) {
            clearInterval(interval);
            setError('An unexpected error occurred.');
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-6 font-fredoka overflow-hidden relative">

            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <svg className="absolute top-10 left-10 w-64 h-64 text-orange-500 animate-spin-slow" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                </svg>
                <div className="absolute bottom-20 right-20 text-9xl">🌴</div>
            </div>

            <div className="max-w-3xl w-full bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-8 md:p-12 border-8 border-white/50 relative z-10 transition-all">

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]"
                        >
                            <div className="relative mb-12">
                                <div className="w-40 h-40 bg-primary/20 rounded-full animate-ping absolute top-0 left-0"></div>
                                <div className="w-40 h-40 bg-primary text-white rounded-full flex items-center justify-center text-6xl shadow-xl relative z-10 animate-bounce">
                                    ✨
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-blue-900 mb-4 animate-pulse">
                                Making Magic...
                            </h2>
                            <p className="text-xl text-primary font-bold">
                                {LOADING_MESSAGES[loadingMessageIndex]}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-10">
                                <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    Beta Studio
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-4">
                                    Story Studio
                                </h1>
                                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                                    Create a personalized Caribbean adventure in seconds!
                                </p>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-6">

                                {/* Topic Input */}
                                <div className="relative group">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-5 text-gray-400 group-focus-within:text-primary transition-colors">
                                        <Search size={24} />
                                    </div>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="What is the story about? (e.g. A turtle who loves soca)"
                                        className="w-full pl-14 pr-6 py-6 rounded-3xl bg-gray-50 border-4 border-transparent focus:border-primary focus:bg-white outline-none text-xl font-bold text-gray-800 placeholder:text-gray-300 transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>

                                {/* Island Select */}
                                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-3xl border-2 border-blue-100/50">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-black text-blue-300 uppercase tracking-wider block mb-1">Set the Scene</label>
                                        <select
                                            value={island}
                                            onChange={(e) => setIsland(e.target.value)}
                                            className="w-full bg-transparent font-black text-blue-900 text-lg outline-none cursor-pointer"
                                        >
                                            {ISLANDS.map(isle => (
                                                <option key={isle.id} value={isle.id}>
                                                    {isle.emoji} {isle.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center font-bold border-2 border-red-100 animate-shake">
                                    Error: {error}
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!topic || loading}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Sparkles className="animate-pulse" />
                                    CREATE ADVENTURE
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <p className="text-center text-sm text-gray-400 font-medium">
                                Takes about 30 seconds to write & illustrate.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
