
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Star, Mic, BookOpen, Music, Video } from 'lucide-react';
import Image from 'next/image';
import InteractiveReader from '../InteractiveReader';

// Mock Data (until we hook up Supabase)
const STORIES = [
    {
        id: '1',
        title: "The Boy Who Chose Milk",
        author: "Tanty Spice",
        cover: "https://images.unsplash.com/photo-1629248457635-7798c89c898c?q=80&w=800",
        summary: "A little boy learns that milk makes him strong like a true legend!",
        tags: ["Healthy Habits", "Grenada"],
        level: "Beginner",
        duration: "5 min",
        character: "tanty"
    },
    {
        id: '2',
        title: "Anansi & The Pot of Wisdom",
        author: "R.O.T.I.",
        cover: "https://images.unsplash.com/photo-1605367069726-27ab97c995bd?q=80&w=800",
        summary: "Anansi tries to keep all the wisdom for himself, but disaster strikes!",
        tags: ["Folklore", "Jamaica"],
        level: "Intermediate",
        duration: "8 min",
        character: "roti"
    },
    {
        id: '3',
        title: "Carnival of Colors",
        author: "Tanty Spice",
        cover: "https://images.unsplash.com/photo-1518709911914-dc4c9951664f?q=80&w=800",
        summary: "Join the parade and learn about the vibrant colors of Carnival.",
        tags: ["Culture", "Trinidad"],
        level: "Beginner",
        duration: "4 min",
        character: "tanty"
    }
];

export default function LibraryGrid() {
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'tanty' | 'roti'>('all');
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLibrary() {
            try {
                const response = await fetch('/api/library/stories');
                const data = await response.json();

                if (data.stories) {
                    const formattedDetails = data.stories.map((s: any) => {
                        // DB schema mapping
                        const content = typeof s.content_json === 'string' ? JSON.parse(s.content_json) : s.content_json;
                        return {
                            id: s.id,
                            title: s.title,
                            author: "You!", // User Generated
                            cover: s.cover_image_url || "https://images.unsplash.com/photo-1629248457635-7798c89c898c?q=80&w=800",
                            summary: s.summary,
                            tags: [s.island_theme, s.age_track],
                            level: s.difficulty_level <= 3 ? "Beginner" : "Legend",
                            duration: `${s.reading_time_minutes || 5} min`,
                            character: 'roti', // Default for now
                            pages: content.pages // Pass pages for reader
                        };
                    });
                    setStories(formattedDetails);
                }
            } catch (e) {
                console.error("Failed to load library", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLibrary();
    }, []);

    const filteredStories = stories.filter(s =>
        filter === 'all' ? true : s.character === filter
    );

    return (
        <section className="bg-[#FFFBF5] min-h-screen py-8 pb-32">
            <div className="container mx-auto px-4 lg:px-8">

                {/* ═══ Header ═══ */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-orange-950 tracking-tight mb-2">
                            My Creations 🎨
                        </h1>
                        <p className="text-lg text-orange-800/60 font-medium">
                            {stories.length} Legendary Stories Crafted
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-orange-100">
                        {['all', 'tanty', 'roti'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === f
                                    ? 'bg-orange-500 text-white shadow-md transform scale-105'
                                    : 'text-orange-400 hover:bg-orange-50 hover:text-orange-600'
                                    }`}
                            >
                                {f === 'all' ? 'All Stories' : f === 'tanty' ? '👵🏽 Tanty Spice' : '🤖 R.O.T.I.'}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <>
                        {/* ═══ Featured Hero (First Story) ═══ */}
                        {filter === 'all' && stories.length > 0 && (
                            <div className="mb-16 relative group cursor-pointer" onClick={() => setSelectedStory(stories[0])}>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-[2.5rem] transform rotate-1 opacity-20 group-hover:rotate-2 transition-transform duration-500" />
                                <div className="relative bg-white rounded-[2.5rem] p-6 md:p-12 border-4 border-orange-100 shadow-xl flex flex-col md:flex-row gap-8 md:gap-16 items-center overflow-hidden">

                                    {/* Image Side */}
                                    <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500">
                                        <Image
                                            src={stories[0].cover}
                                            alt={stories[0].title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute bottom-4 left-4 flex gap-2">
                                            <span className="bg-white/90 backdrop-blur text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Sparkles size={12} /> Newest
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full md:w-1/2 md:pr-8 flex flex-col items-center md:items-start text-center md:text-left">
                                        <span className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-3">Your Latest Masterpiece</span>
                                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-orange-950 mb-6 leading-[0.9]">
                                            {stories[0].title}
                                        </h2>
                                        <p className="text-xl text-orange-900/60 mb-8 max-w-md line-clamp-3">
                                            {stories[0].summary}
                                        </p>

                                        <button className="group relative px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-1 transition-all flex items-center gap-3 overflow-hidden">
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <Play fill="currentColor" size={24} />
                                            <span>Read Now</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* ═══ Story Grid ═══ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredStories.map((story) => (
                                <motion.div
                                    key={story.id}
                                    layoutId={story.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="group cursor-pointer"
                                    onClick={() => setSelectedStory(story)}
                                >
                                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 shadow-md border-[3px] border-white group-hover:border-orange-400 transition-all duration-300">
                                        <Image
                                            src={story.cover}
                                            alt={story.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Floating Badges */}
                                        <div className="absolute top-4 left-4 right-4 flex justifying-between items-start">
                                            <span className="bg-white/95 backdrop-blur text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                {story.level}
                                            </span>
                                        </div>

                                        {/* Bottom Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md line-clamp-2">
                                                {story.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] border border-white">
                                                    {story.character === 'tanty' ? '👵🏽' : '🤖'}
                                                </div>
                                                <span>You</span>
                                                <span className="w-1 h-1 bg-white/50 rounded-full" />
                                                <span>{story.duration}</span>
                                            </div>
                                        </div>

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                                                <Play fill="currentColor" size={32} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* ═══ Empty State if filtered ═══ */}
                        {filteredStories.length === 0 && (
                            <div className="text-center py-20 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                                <div className="text-6xl mb-4">🔦</div>
                                <h3 className="text-2xl font-black text-orange-950 mb-2">No stories yet!</h3>
                                <p className="text-orange-800">You haven't created any stories yet. Go to the Studio!</p>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* ═══ Reader Overlay ═══ */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
                    >
                        <InteractiveReader
                            title={selectedStory.title}
                            guide={selectedStory.character}
                            onClose={() => setSelectedStory(null)}
                            // Passing mock data for now - Phase 3 will hook to API
                            pages={selectedStory.pages || []}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
