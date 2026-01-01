"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Gamepad2, Star, Lock, Play, Trophy, Clock,
    Users, Sparkles, Puzzle, Brain, Palette
} from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface Game {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: 'puzzle' | 'memory' | 'creative' | 'adventure';
    tier_required: string;
    play_count: number;
    best_score?: number;
    estimated_time: string;
    age_range: string;
}

const GAMES: Game[] = [
    {
        id: 'island-match',
        title: 'Island Match',
        description: 'Match Caribbean fruits and animals. Train your memory!',
        thumbnail: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d9?w=400',
        category: 'memory',
        tier_required: 'starter_mailer',
        play_count: 2340,
        best_score: 850,
        estimated_time: '5 min',
        age_range: '4-8',
    },
    {
        id: 'patois-puzzle',
        title: 'Patois Puzzle',
        description: 'Learn Jamaican words while solving fun puzzles!',
        thumbnail: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400',
        category: 'puzzle',
        tier_required: 'starter_mailer',
        play_count: 1890,
        best_score: 720,
        estimated_time: '8 min',
        age_range: '5-8',
    },
    {
        id: 'color-carnival',
        title: 'Color Carnival',
        description: 'Paint beautiful Caribbean scenes with vibrant colors!',
        thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
        category: 'creative',
        tier_required: 'starter_mailer',
        play_count: 3210,
        estimated_time: '10 min',
        age_range: '4-6',
    },
    {
        id: 'treasure-hunt',
        title: 'Treasure Hunt',
        description: 'Explore islands and find hidden treasures!',
        thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
        category: 'adventure',
        tier_required: 'legends_plus',
        play_count: 1560,
        best_score: 950,
        estimated_time: '15 min',
        age_range: '6-8',
    },
    {
        id: 'rhythm-steelpan',
        title: 'Rhythm Steelpan',
        description: 'Play Caribbean music on a virtual steelpan!',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        category: 'creative',
        tier_required: 'legends_plus',
        play_count: 980,
        estimated_time: '5 min',
        age_range: '4-8',
    },
    {
        id: 'heritage-quest',
        title: 'Heritage Quest',
        description: 'Journey through Caribbean history and culture!',
        thumbnail: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400',
        category: 'adventure',
        tier_required: 'family_legacy',
        play_count: 456,
        best_score: 1200,
        estimated_time: '20 min',
        age_range: '6-8',
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All Games', icon: Gamepad2 },
    { id: 'puzzle', label: 'Puzzles', icon: Puzzle },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'creative', label: 'Creative', icon: Palette },
    { id: 'adventure', label: 'Adventure', icon: Sparkles },
];

export default function GamesPage() {
    const { activeChild, canAccess } = useUser();
    const [activeCategory, setActiveCategory] = useState('all');
    const [hoveredGame, setHoveredGame] = useState<string | null>(null);

    const filteredGames = activeCategory === 'all'
        ? GAMES
        : GAMES.filter(g => g.category === activeCategory);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'puzzle': return <Puzzle size={14} />;
            case 'memory': return <Brain size={14} />;
            case 'creative': return <Palette size={14} />;
            case 'adventure': return <Sparkles size={14} />;
            default: return <Gamepad2 size={14} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/portal" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">Island Games</h1>
                            <p className="text-white/70 text-sm">Learn while having fun!</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Gamepad2 size={20} />
                                <span className="text-2xl font-black">{GAMES.length}</span>
                            </div>
                            <p className="text-xs text-white/70">Games Available</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Trophy size={20} className="text-yellow-300" />
                                <span className="text-2xl font-black">12</span>
                            </div>
                            <p className="text-xs text-white/70">Achievements</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Star size={20} className="text-amber-300" />
                                <span className="text-2xl font-black">4,520</span>
                            </div>
                            <p className="text-xs text-white/70">Total Score</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Category Filter */}
            <div className="max-w-6xl mx-auto px-4 -mt-4">
                <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex gap-2 overflow-x-auto">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <cat.icon size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map((game) => {
                        const isLocked = !canAccess(game.tier_required);

                        return (
                            <div
                                key={game.id}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                                onMouseEnter={() => setHoveredGame(game.id)}
                                onMouseLeave={() => setHoveredGame(null)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={game.thumbnail}
                                        alt={game.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 capitalize">
                                        {getCategoryIcon(game.category)}
                                        {game.category}
                                    </div>

                                    {/* Locked Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <Lock size={32} className="mx-auto mb-2" />
                                                <p className="font-bold">Upgrade to Play</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Play Button */}
                                    {!isLocked && (
                                        <Link
                                            href={`/portal/games/${game.id}`}
                                            className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors ${hoveredGame === game.id ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        >
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                                <Play className="text-blue-600 ml-1" size={32} />
                                            </div>
                                        </Link>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{game.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{game.description}</p>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {game.estimated_time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={12} /> Ages {game.age_range}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Play size={12} /> {game.play_count.toLocaleString()} plays
                                        </span>
                                    </div>

                                    {/* Best Score */}
                                    {game.best_score && !isLocked && (
                                        <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                                            <span className="text-sm text-amber-700">Your Best Score</span>
                                            <div className="flex items-center gap-1 text-amber-700 font-bold">
                                                <Trophy size={16} />
                                                {game.best_score.toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Play Button */}
                                    {!isLocked ? (
                                        <Link
                                            href={`/portal/games/${game.id}`}
                                            className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            <Gamepad2 size={18} /> Play Now
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/checkout?plan=legends_plus"
                                            className="mt-4 w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                        >
                                            <Lock size={18} /> Unlock Game
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Coming Soon Banner */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
                    <Sparkles className="mx-auto mb-4" size={40} />
                    <h3 className="text-2xl font-black mb-2">More Games Coming Soon!</h3>
                    <p className="text-white/80 max-w-md mx-auto">
                        We're crafting new educational adventures featuring Caribbean culture,
                        history, and traditions. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}
