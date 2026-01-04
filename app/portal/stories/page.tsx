"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft, Book, Clock, Star, Lock, Play, Filter,
    Search, ChevronDown, Heart, Sparkles
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getStorybooks } from '@/lib/database';

interface Story {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    island_origin: string;
    age_track: 'mini' | 'big';
    tier_required: string;
    reading_time: number;
    page_count: number;
    rating: number;
    read_count: number;
    completed?: boolean;
    progress?: number;
}

const ISLANDS = ['All Islands', 'Jamaica', 'Trinidad', 'Barbados', 'Grenada', 'St. Lucia'];

export default function StoriesPage() {
    const { activeChild, canAccess } = useUser();
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIsland, setSelectedIsland] = useState('All Islands');
    const [selectedAgeTrack, setSelectedAgeTrack] = useState<'all' | 'mini' | 'big'>('all');
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function loadStories() {
            setIsLoading(true);
            try {
                // We can import getStorybooks here or at top level. I added import at top.
                const data = await getStorybooks();

                // Map database result to component interface
                const mappedStories: Story[] = data.map((sb: any) => ({
                    id: sb.id,
                    title: sb.title,
                    description: sb.summary,
                    cover_image: sb.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                    island_origin: sb.island_category || 'Caribbean',
                    age_track: sb.age_track || 'mini',
                    tier_required: sb.tier_required,
                    reading_time: sb.reading_time_minutes || 5,
                    page_count: 10, // Default if not in DB
                    rating: 4.8, // Placeholder until ratings implemented
                    read_count: 0,
                    completed: false
                }));

                setStories(mappedStories);
            } catch (error) {
                console.error('Failed to load stories:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadStories();
    }, []);

    const filteredStories = stories.filter(story => {
        const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            story.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIsland = selectedIsland === 'All Islands' || story.island_origin === selectedIsland;
        const matchesAgeTrack = selectedAgeTrack === 'all' || story.age_track === selectedAgeTrack;
        return matchesSearch && matchesIsland && matchesAgeTrack;
    }).sort((a, b) => {
        if (sortBy === 'popular') return b.read_count - a.read_count;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // Newest sort would need created_at date
    });

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/portal" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">Story Library</h1>
                            <p className="text-white/70 text-sm">{stories.length} stories • Caribbean adventures</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:outline-none"
                        />
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-wrap gap-4 items-center">
                    {/* Island Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={selectedIsland}
                            onChange={(e) => setSelectedIsland(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl font-medium text-sm"
                            aria-label="Filter by island"
                        >
                            {ISLANDS.map(island => (
                                <option key={island} value={island}>{island}</option>
                            ))}
                        </select>
                    </div>

                    {/* Age Track Filter */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                        {[
                            { id: 'all', label: 'All Ages' },
                            { id: 'mini', label: 'Mini (4-5)' },
                            { id: 'big', label: 'Big (6-8)' },
                        ].map(track => (
                            <button
                                key={track.id}
                                onClick={() => setSelectedAgeTrack(track.id as typeof selectedAgeTrack)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedAgeTrack === track.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {track.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="ml-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="px-3 py-2 border border-gray-200 rounded-xl font-medium text-sm"
                            aria-label="Sort by"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stories Grid */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => {
                        const isLocked = !canAccess(story.tier_required);

                        return (
                            <div
                                key={story.id}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                {/* Cover Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={story.cover_image}
                                        alt={story.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Isle Badge */}
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold">
                                        🏝️ {story.island_origin}
                                    </div>

                                    {/* Age Badge */}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${story.age_track === 'mini'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {story.age_track === 'mini' ? '4-5 yrs' : '6-8 yrs'}
                                    </div>

                                    {/* Locked Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <Lock size={32} className="mx-auto mb-2" />
                                                <p className="font-bold">Upgrade to Read</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    {story.progress && !story.completed && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${story.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Completed Badge */}
                                    {story.completed && (
                                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                                            ✓ Completed
                                        </div>
                                    )}

                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleFavorite(story.id); }}
                                        className="absolute bottom-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                                        aria-label={favorites.has(story.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <Heart
                                            size={16}
                                            className={favorites.has(story.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}
                                        />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{story.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{story.description}</p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {story.reading_time} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Book size={12} /> {story.page_count} pages
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="text-amber-400" /> {story.rating}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    {!isLocked ? (
                                        <Link
                                            href={`/portal/stories/${story.id}`}
                                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <Play size={18} />
                                            {story.completed ? 'Read Again' : story.progress ? 'Continue' : 'Start Reading'}
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/checkout?plan=legends_plus"
                                            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                        >
                                            <Lock size={18} /> Unlock Story
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredStories.length === 0 && (
                    <div className="text-center py-16">
                        <Book className="text-gray-300 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">No stories match your filters</p>
                    </div>
                )}
            </main>

            {/* Coming Soon */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-8 text-white text-center">
                    <Sparkles className="mx-auto mb-4" size={40} />
                    <h3 className="text-2xl font-black mb-2">New Stories Every Month!</h3>
                    <p className="text-white/80 max-w-md mx-auto">
                        Our team is always creating new Caribbean adventures. Check back soon for more tales!
                    </p>
                </div>
            </div>
        </div>
    );
}
