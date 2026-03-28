"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft, Book, Clock, Star, Lock, Play, Pickaxe, Check,
    Search, Map, Heart, Sparkles, BookOpen, Compass, Award, Tag, Sparkle
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getStorybooks } from '@/lib/database';
import { STARTER_STORIES } from '@/lib/story-starter-pack';
import { trackEvent } from '@/lib/analytics';
import { normalizeParentalControls } from '@/lib/parental-controls';

interface Story {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    island_origin: string;
    category: string;
    age_group: string;
    reading_time: number;
    tier_required: string;
    progress?: number;
    completed?: boolean;
}

import {
    ISLANDS as CONFIG_ISLANDS,
    CATEGORIES as CONFIG_CATEGORIES,
    TARGET_AGE_GROUPS,
} from '@/lib/islandStoriesConfig';

const ISLANDS = [
    { name: 'All Islands', flag: '🌍' },
    ...CONFIG_ISLANDS.map(name => {
        // Simple flag mapping heuristic for known islands
        const flagMap: Record<string, string> = {
            'Trinidad and Tobago': '🇹🇹',
            'Jamaica': '🇯🇲',
            'Barbados': '🇧🇧',
            'Dominican Republic': '🇩🇴',
            'Haiti': '🇭🇹',
            'Grenada': '🇬🇩',
            'St Lucia': '🇱🇨',
            'Antigua': '🇦🇬',
            'Bahamas': '🇧🇸',
            'Guyana': '🇬🇾'
        };
        return { name, flag: flagMap[name] || '🏝️' };
    })
];

const CATEGORIES = ["All Categories", ...CONFIG_CATEGORIES];

const AGE_GROUPS = [
    { id: 'all', label: 'All Ages' },
    ...TARGET_AGE_GROUPS.map(ag => ({ id: ag.range, label: `Ages ${ag.range}` }))
];

export default function StoriesLibraryPage() {
    const { activeChild, canAccess, user } = useUser();
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIsland, setSelectedIsland] = useState('All Islands');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
    
    // Passport GAMIFICATION
    const [earnedStamps, setEarnedStamps] = useState<string[]>(['Jamaica']); // Example default stamp

    useEffect(() => {
        loadStories();
    }, []);

    const parentalControls = normalizeParentalControls((user as any)?.parental_controls);

    if (!parentalControls.allow_stories) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Stories Are Locked</h2>
                    <p className="text-slate-500 font-semibold">Your parent controls currently disable story access.</p>
                    <Link href="/portal/settings" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black">
                        Open Parent Controls
                    </Link>
                </div>
            </div>
        );
    }

    const loadStories = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const data = await Promise.race([
                getStorybooks(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out.')), 12000)
                ),
            ]);

            const mappedStories: Story[] = (data as any[]).map((sb: any) => ({
                id: sb.id,
                title: sb.title,
                description: sb.summary,
                cover_image: sb.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                island_origin: sb.island_theme || sb.island_category || 'Jamaica',
                category: sb.category || 'Adventure',
                age_group: sb.age_track === 'big' ? '7-9' : '5-6', // Mapping existing age tracks
                tier_required: sb.tier_required,
                reading_time: sb.reading_time_minutes || 5,
                completed: false
            }));

            if (mappedStories.length > 0) {
                setStories(mappedStories);
            } else {
                // Fallback to offline starter pack if DB is empty
                setStories(STARTER_STORIES.map(sb => ({
                    id: sb.id,
                    title: sb.title,
                    description: sb.summary,
                    cover_image: sb.cover_image_url,
                    island_origin: 'Jamaica',
                    category: 'Story',
                    age_group: '5-6',
                    tier_required: sb.tier_required,
                    reading_time: sb.reading_time_minutes,
                    completed: false
                })));
            }

            // Hydrate Passport gamification from local storage
            const stamps = localStorage.getItem('island_passport_stamps');
            if (stamps) {
                setEarnedStamps(JSON.parse(stamps));
            }

        } catch (error) {
            console.error('Failed to load stories:', error);
            setLoadError('We could not load stories right now.');
            trackEvent('stories_page_load_failed');
        } finally {
            setIsLoading(false);
        }
    };


    // Filter Logic
    const filteredStories = stories.filter(story => {
        const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            story.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIsland = selectedIsland === 'All Islands' || story.island_origin === selectedIsland;
        const matchesCategory = selectedCategory === 'All Categories' || story.category === selectedCategory;
        const matchesAge = selectedAgeGroup === 'all' || story.age_group === selectedAgeGroup;

        return matchesSearch && matchesIsland && matchesCategory && matchesAge;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 font-sans pb-20">
            {/* 1. Hero Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
                    <div className="flex flex-col mb-8 items-start">
                        <Link href="/portal" className="bg-white/10 hover:bg-white/20 p-3 rounded-full mb-6 transition-all backdrop-blur-sm">
                            <ArrowLeft size={20} />
                        </Link>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Sparkles size={14} /> New books every week
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Island Stories Library</h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl font-medium mb-8">Tales from across the Caribbean featuring magical characters, rich history, and brilliant adventures.</p>

                        <button className="bg-white text-indigo-900 px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                            <BookOpen size={20} /> Start Reading
                        </button>
                    </div>

                    {/* Quick Search */}
                    <div className="relative max-w-xl group mt-8">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white" size={24} />
                        <input
                            type="text"
                            placeholder="Search by title or character..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border-2 border-white/20 rounded-full py-4 pl-16 pr-6 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 backdrop-blur-md text-lg transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Island Passport Gamification Widget */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-indigo-50 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                            <Compass className="text-indigo-600" size={28} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg">My Island Passport</h3>
                            <p className="text-slate-500 font-medium text-sm">Read stories from different islands to collect stamps!</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {ISLANDS.slice(1, 6).map((island, idx) => {
                            const isEarned = earnedStamps.includes(island.name);
                            return (
                                <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isEarned ? 'bg-indigo-600 text-white shadow-lg hover:scale-110 cursor-pointer' : 'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200'}`} title={island.name}>
                                    {isEarned ? island.flag : '?'}
                                </div>
                            );
                        })}
                        <button className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 font-black text-xs border border-slate-200 hover:bg-slate-100">
                            +{ISLANDS.length - 6}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Filters Sidebar */}
                <aside className="lg:col-span-1 space-y-8">
                    {/* Browse by Island */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Map className="text-indigo-500" size={20} />
                            <h3 className="font-black text-slate-800">Browse by Island</h3>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {ISLANDS.map(island => (
                                <button
                                    key={island.name}
                                    onClick={() => setSelectedIsland(island.name)}
                                    className={`w-full flex items-center text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${selectedIsland === island.name ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span className="mr-3 text-xl">{island.flag}</span> {island.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Age Filters */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="text-emerald-500" size={20} />
                            <h3 className="font-black text-slate-800">Age Group</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {AGE_GROUPS.map(age => (
                                <button
                                    key={age.id}
                                    onClick={() => setSelectedAgeGroup(age.id)}
                                    className={`py-2 px-3 rounded-xl font-bold text-sm text-center transition-all ${selectedAgeGroup === age.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
                                >
                                    {age.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="lg:col-span-3">

                    {/* Categories Tabs */}
                    <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
                        <div className="flex gap-2">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all focus:outline-none ${selectedCategory === category ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                                >
                                    {category === 'All Categories' ? <Sparkle className="inline mr-2 w-4 h-4" /> : null}
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Story Library Grid */}
                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-3xl h-[360px] animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : loadError ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <BookOpen className="text-slate-200 mx-auto mb-4" size={64} />
                            <h4 className="text-2xl font-black text-slate-800 mb-2">Story shelf is resting</h4>
                            <p className="text-slate-500 max-w-sm mx-auto">{loadError}</p>
                            <button
                                onClick={() => {
                                    trackEvent('stories_page_retry_clicked');
                                    loadStories();
                                }}
                                className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredStories.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStories.map((story) => {
                                const isLocked = !canAccess(story.tier_required);
                                const islandData = ISLANDS.find(i => i.name === story.island_origin);

                                return (
                                    <div
                                        key={story.id}
                                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                            <Image
                                                src={story.cover_image}
                                                alt={story.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />

                                            {/* Top badges */}
                                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-black shadow-sm text-slate-800">
                                                {islandData?.flag || '🌍'} {story.island_origin.substring(0, 12)}{story.island_origin.length > 12 ? '...' : ''}
                                            </div>

                                            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-black shadow-sm">
                                                {story.age_group}
                                            </div>

                                            {/* Locked Overlay */}
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                                                    <Lock size={32} className="mb-2 text-indigo-300" />
                                                    <p className="font-black text-center text-white">Unlock with Legends+</p>
                                                </div>
                                            )}

                                            {/* Reading Time Badge Bottom Left Image */}
                                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Clock size={12} /> {story.reading_time}m
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{story.category}</span>
                                            </div>

                                            <h3 className="font-black text-xl text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{story.title}</h3>
                                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{story.description}</p>

                                            <div className="mt-auto">
                                                {!isLocked ? (
                                                    <Link
                                                        href={`/portal/stories/${story.id}`}
                                                        className="w-full py-3.5 bg-indigo-50 text-indigo-700 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all group-hover:shadow-md"
                                                    >
                                                        <Play size={18} />
                                                        Read Story
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/checkout?plan=legends_plus"
                                                        className="w-full py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 border border-slate-200"
                                                    >
                                                        <Lock size={18} /> Get Access
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <BookOpen className="text-slate-200 mx-auto mb-4" size={64} />
                            <h4 className="text-2xl font-black text-slate-800 mb-2">No stories found</h4>
                            <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find more Caribbean adventures.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedIsland('All Islands'); setSelectedCategory('All Categories'); setSelectedAgeGroup('all'); }}
                                className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
