"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Gamepad2, Star, Lock, Play, Trophy, Clock,
    Users, Sparkles, Brain, Palette, Zap, Crown, Gift, Wand2,
    Puzzle, Music, BookOpen, Map as MapIcon, Heart, Target, CheckCircle, Search
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getGames, getRecentActivities } from '@/lib/database';
import { getGameProgressMap, type GameProgressEntry } from '@/lib/game-progress';
import { normalizeParentalControls } from '@/lib/parental-controls';

interface Game {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    game_url?: string;
    category?: string;
    tier_required?: string;
    tier?: string;
    play_count?: number;
    best_score?: number;
    estimated_time?: string;
    age_range?: string;
    // From FEATURED_GAMES
    emoji?: string;
    gradient?: string;
    xp?: number;
    time?: string;
    isNew?: boolean;
    isPopular?: boolean;
    learningFocus?: string;
    reward_xp?: number;
}

const GAME_CATEGORIES = [
    { id: 'all', label: 'All Games', icon: Gamepad2, color: 'from-primary to-accent', emoji: '🎮' },
    { id: 'trivia', label: 'Trivia', icon: Brain, color: 'from-purple-500 to-indigo-600', emoji: '🧠' },
    { id: 'memory', label: 'Memory', icon: Puzzle, color: 'from-green-500 to-emerald-600', emoji: '🧩' },
    { id: 'word', label: 'Words', icon: BookOpen, color: 'from-blue-500 to-cyan-600', emoji: '📖' },
    { id: 'math', label: 'Math', icon: Target, color: 'from-red-500 to-orange-600', emoji: '🔢' },
    { id: 'adventure', label: 'Adventure', icon: MapIcon, color: 'from-orange-500 to-amber-600', emoji: '🗺️' },
    { id: 'creative', label: 'Creative', icon: Palette, color: 'from-pink-500 to-rose-600', emoji: '🎨' },
    { id: 'music', label: 'Music', icon: Music, color: 'from-violet-500 to-purple-600', emoji: '🎵' },
];

// Maps admin game-builder game_type values to hub category tabs
const GAME_TYPE_TO_CATEGORY: Record<string, string> = {
    trivia: 'trivia',
    quiz: 'trivia',
    memory: 'memory',
    matching: 'memory',
    spelling: 'word',
    word_search: 'word',
    word_builder: 'word',
    'word-match': 'word',
    math: 'math',
    number_game: 'math',
    drag_drop: 'creative',
    music: 'music',
};

// Featured games with premium styling
const FEATURED_GAMES = [
    {
        id: 'island-memory',
        title: 'Island Memory Match',
        description: 'Match Caribbean fruits, animals, and landmarks!',
        emoji: '🧠',
        gradient: 'from-emerald-400 via-green-500 to-teal-600',
        tier: 'free',
        category: 'memory',
        xp: 100,
        time: '5 min',
        learningFocus: 'Visual memory and island vocabulary',
        isNew: false,
        isPopular: true,
    },
    {
        id: 'patois-wizard',
        title: 'Patois Word Wizard',
        description: 'Learn Jamaican words and their meanings!',
        emoji: '🔤',
        gradient: 'from-blue-400 via-indigo-500 to-purple-600',
        tier: 'free',
        category: 'word',
        xp: 80,
        time: '5 min',
        learningFocus: 'Jamaican Patois and reading comprehension',
        isNew: false,
        isPopular: false,
    },
    {
        id: 'island-trivia',
        title: 'Island Trivia Quest',
        description: 'Answer fun questions about Caribbean culture!',
        emoji: '🎯',
        gradient: 'from-amber-400 via-orange-500 to-red-600',
        tier: 'free',
        category: 'trivia',
        xp: 150,
        time: '8 min',
        learningFocus: 'Geography, culture facts, and recall',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'story-library',
        title: 'Story Library Adventure',
        description: 'Read guided Caribbean adventures with Tanty and R.O.T.I.!',
        emoji: '📚',
        gradient: 'from-purple-400 via-pink-500 to-rose-600',
        tier: 'free',
        category: 'adventure',
        xp: 160,
        time: '8-12 min',
        learningFocus: 'Reading fluency, vocabulary, and comprehension',
        isNew: false,
        isPopular: true,
    },
    {
        id: 'cultural-quiz',
        title: 'Cultural Champion',
        description: 'Become an expert on Caribbean traditions!',
        emoji: '🏆',
        gradient: 'from-yellow-400 via-amber-500 to-orange-600',
        tier: 'starter_mailer',
        category: 'trivia',
        xp: 250,
        time: '10 min',
        learningFocus: 'Traditions, festivals, and identity',
        isNew: false,
        isPopular: true,
    },
    {
        id: 'island-explorer',
        title: 'Caribbean Flag Explorer',
        description: 'Explore real Caribbean flags and learn each island!',
        emoji: '🌴',
        gradient: 'from-cyan-400 via-teal-500 to-green-600',
        tier: 'legends_plus',
        category: 'adventure',
        xp: 300,
        time: '8-10 min',
        learningFocus: 'Flag recognition and country knowledge',
        isNew: false,
        isPopular: false,
    },


    {
        id: 'color-match',
        title: 'Island Color Match',
        description: 'Help Tanty Spice match the beautiful colors of the island!',
        emoji: '🎨',
        gradient: 'from-pink-400 via-purple-500 to-indigo-600',
        tier: 'free',
        category: 'creative',
        xp: 100,
        time: '5 min',
        learningFocus: 'Color recognition and object grouping',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'flag-match',
        title: 'Caribbean Flag Match',
        description: 'Match flags to islands and learn cool Caribbean facts!',
        emoji: '🌍',
        gradient: 'from-blue-400 via-cyan-500 to-teal-600',
        tier: 'free',
        category: 'trivia',
        xp: 200,
        time: '10 min',
        learningFocus: 'Country identification and map literacy',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'counting-market',
        title: 'Counting Market',
        description: 'Count fruits and veggies at the Caribbean market stall!',
        emoji: '🍉',
        gradient: 'from-lime-400 via-green-500 to-emerald-600',
        tier: 'free',
        category: 'math',
        xp: 120,
        time: '5 min',
        learningFocus: 'Counting and early number sense',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'math-adventure',
        title: 'Math Adventure',
        description: 'Solve island math puzzles and level up your skills!',
        emoji: '➕',
        gradient: 'from-red-400 via-rose-500 to-pink-600',
        tier: 'free',
        category: 'math',
        xp: 180,
        time: '8 min',
        learningFocus: 'Addition, subtraction, and problem solving',
        isNew: true,
        isPopular: true,
    },
    {
        id: 'word-builder',
        title: 'Island Word Builder',
        description: 'Build Caribbean words letter by letter!',
        emoji: '🔠',
        gradient: 'from-sky-400 via-blue-500 to-indigo-600',
        tier: 'free',
        category: 'word',
        xp: 150,
        time: '6 min',
        learningFocus: 'Spelling and phonics',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'recipe-scramble',
        title: 'Recipe Scramble',
        description: 'Unscramble the steps to cook real Caribbean dishes!',
        emoji: '🥘',
        gradient: 'from-orange-400 via-amber-500 to-yellow-600',
        tier: 'free',
        category: 'creative',
        xp: 140,
        time: '7 min',
        learningFocus: 'Sequencing and Caribbean cuisine',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'ingredient-sort',
        title: 'Ingredient Sort',
        description: 'Sort the right ingredients for island favourites!',
        emoji: '🧺',
        gradient: 'from-teal-400 via-emerald-500 to-green-600',
        tier: 'free',
        category: 'creative',
        xp: 100,
        time: '5 min',
        learningFocus: 'Categorising and food knowledge',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'rhythm-matcher',
        title: 'Rhythm Matcher',
        description: 'Listen and repeat soca and calypso rhythms!',
        emoji: '🥁',
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
        tier: 'free',
        category: 'music',
        xp: 150,
        time: '6 min',
        learningFocus: 'Listening skills and Caribbean music',
        isNew: true,
        isPopular: true,
    },
    {
        id: 'speed-shapes',
        title: 'Speed Shapes',
        description: 'Match the shapes before the timer runs out!',
        emoji: '🔷',
        gradient: 'from-cyan-400 via-sky-500 to-blue-600',
        tier: 'free',
        category: 'memory',
        xp: 100,
        time: '4 min',
        learningFocus: 'Shape recognition and quick thinking',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'island-passport-explorer',
        title: 'Island Passport Explorer',
        description: 'Travel the islands and stamp your explorer passport!',
        emoji: '🛂',
        gradient: 'from-amber-400 via-orange-500 to-red-500',
        tier: 'free',
        category: 'adventure',
        xp: 200,
        time: '10 min',
        learningFocus: 'Geography and island culture',
        isNew: true,
        isPopular: true,
    },
    // Game Zone arcade games (full-screen games outside the portal)
    {
        id: 'island-hop',
        title: "Mango's Island Hop",
        description: 'Hop across the islands answering trivia with Mango Moko!',
        emoji: '🏝️',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
        tier: 'free',
        category: 'trivia',
        xp: 150,
        time: '8 min',
        learningFocus: 'Geography, flags, and capitals',
        isNew: true,
        isPopular: true,
        game_url: '/games/island-hop',
    },
    {
        id: 'tantys-kitchen',
        title: "Tanty's Kitchen",
        description: 'Cook 5 real Caribbean dishes with Tanty Spice!',
        emoji: '🍲',
        gradient: 'from-orange-400 via-red-500 to-rose-600',
        tier: 'free',
        category: 'creative',
        xp: 150,
        time: '8 min',
        learningFocus: 'Cooking, sorting, and following steps',
        isNew: true,
        isPopular: true,
        game_url: '/games/tantys-kitchen',
    },
    {
        id: 'math-market',
        title: "R.O.T.I.'s Math Market",
        description: 'Count fruit and make change at the market with R.O.T.I.!',
        emoji: '🧮',
        gradient: 'from-blue-400 via-indigo-500 to-violet-600',
        tier: 'free',
        category: 'math',
        xp: 180,
        time: '8 min',
        learningFocus: 'Counting, money, and mental math',
        isNew: true,
        isPopular: false,
        game_url: '/games/math-market',
    },
    {
        id: 'spelling-blaze',
        title: "Scorcha's Spelling Blaze",
        description: 'Spell Caribbean words before the fire timer burns out!',
        emoji: '🔥',
        gradient: 'from-red-400 via-orange-500 to-amber-600',
        tier: 'free',
        category: 'word',
        xp: 160,
        time: '6 min',
        learningFocus: 'Spelling under pressure',
        isNew: true,
        isPopular: false,
        game_url: '/games/spelling-blaze',
    },
    {
        id: 'doubles-dash',
        title: 'Doubles Dash',
        description: 'Dash through the streets collecting tasty doubles!',
        emoji: '🫓',
        gradient: 'from-yellow-400 via-amber-500 to-orange-600',
        tier: 'free',
        category: 'adventure',
        xp: 150,
        time: '5 min',
        learningFocus: 'Reflexes and Trini street food culture',
        isNew: true,
        isPopular: true,
        game_url: '/games/doubles-dash',
    },
];

import { EmptyState } from '@/components/EmptyState';

export default function GamesHubPage() {
    const { activeChild, user } = useUser();
    const [games, setGames] = useState<Game[]>(FEATURED_GAMES as Game[]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showOnlyAccessible, setShowOnlyAccessible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [progressMap, setProgressMap] = useState<Record<string, GameProgressEntry>>({});
    const parentalControls = normalizeParentalControls((user as any)?.parental_controls);

    useEffect(() => {
        let cancelled = false;
        let idleHandle: number | null = null;
        let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

        const featuredById = new Map((FEATURED_GAMES as Game[]).map((game) => [game.id, game]));

        const hydrateGames = async () => {
            try {
                const data = await Promise.race([
                    getGames() as Promise<Game[]>,
                    new Promise<Game[]>((resolve) => setTimeout(() => resolve([]), 1200)),
                ]);

                if (cancelled || !Array.isArray(data) || data.length === 0) {
                    return;
                }

                // The featured list always shows. DB games from the admin game
                // builder are appended, unless they just point at a game we
                // already show (matched by id or by the route in game_url).
                const routeKeyOf = (game: Game) => {
                    const url = typeof game.game_url === 'string' ? game.game_url : '';
                    const tail = url.split('?')[0].split('/').filter(Boolean).pop();
                    return tail || String(game.id);
                };

                const extras = data
                    .filter((game) => !featuredById.has(String(game.id)) && !featuredById.has(routeKeyOf(game)))
                    .map((game) => ({
                        ...game,
                        category: GAME_TYPE_TO_CATEGORY[(game as any).category || (game as any).game_type || ''] || 'adventure',
                        emoji: game.emoji ?? '🎮',
                        gradient: game.gradient ?? 'from-primary to-accent',
                        xp: game.xp ?? game.reward_xp ?? 100,
                        time: game.time ?? game.estimated_time ?? '5 min',
                    }));

                setGames([...(FEATURED_GAMES as Game[]), ...extras]);
            } catch (error) {
                console.error('Failed to hydrate games:', error);
            }
        };

        const runWhenIdle = () => {
            void hydrateGames();
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            idleHandle = window.requestIdleCallback(runWhenIdle, { timeout: 1500 });
        } else {
            timeoutHandle = setTimeout(runWhenIdle, 250);
        }

        return () => {
            cancelled = true;
            if (idleHandle !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idleHandle);
            }
            if (timeoutHandle !== null) {
                clearTimeout(timeoutHandle);
            }
        };
    }, []);

    useEffect(() => {
        const localMap = getGameProgressMap();
        setProgressMap(localMap);

        if (!activeChild?.id) return;
        (async () => {
            try {
                const recent = await getRecentActivities(activeChild.id, 150);
                const gameRows = recent.filter((row: any) => row.activity_type === 'game' && row.content_id);
                if (!gameRows.length) return;

                const merged = { ...localMap };
                gameRows.forEach((row: any) => {
                    const key = String(row.content_id);
                    const score = Number(row?.metadata?.score || row?.xp_earned || 0);
                    const existing = merged[key];
                    merged[key] = {
                        gameId: key,
                        plays: (existing?.plays || 0) + 1,
                        bestScore: Math.max(existing?.bestScore || 0, score),
                        lastPlayedAt: existing?.lastPlayedAt || row.created_at || new Date().toISOString(),
                    };
                });
                setProgressMap(merged);
            } catch (error) {
                console.error('Failed to load backend game progress:', error);
            }
        })();
    }, [activeChild?.id]);

    const canPlayGame = (_tier?: string) => true;

    const getDurationBucket = (value?: string) => {
        const parsed = parseInt((value || '').replace(/[^0-9]/g, ''), 10);
        if (!Number.isFinite(parsed)) return 'medium';
        if (parsed <= 5) return 'short';
        if (parsed <= 10) return 'medium';
        return 'long';
    };

    const getDifficultyBucket = (xp?: number) => {
        const value = xp || 0;
        if (value <= 100) return 'easy';
        if (value <= 200) return 'medium';
        return 'hard';
    };

    const filteredGames = useMemo(() => {
        const categoryFiltered = activeCategory === 'all'
            ? games
            : games.filter(g => (g as any).category === activeCategory);

        return categoryFiltered
            .filter(g => !showOnlyAccessible || canPlayGame((g as any).tier_required || (g as any).tier))
            .filter((g) => {
                if (!searchQuery.trim()) return true;
                const hay = `${g.title} ${g.description} ${g.learningFocus || ''}`.toLowerCase();
                return hay.includes(searchQuery.toLowerCase());
            })
            .filter((g) => durationFilter === 'all' || getDurationBucket(g.time) === durationFilter)
            .filter((g) => difficultyFilter === 'all' || getDifficultyBucket(g.xp) === difficultyFilter);
    }, [activeCategory, games, showOnlyAccessible, searchQuery, durationFilter, difficultyFilter]);

    const totalXP = activeChild?.total_xp || 0;
    const unlockedGames = filteredGames.filter(g => canPlayGame((g as any).tier_required || (g as any).tier));

    if (!parentalControls.allow_games) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Games Are Locked</h2>
                    <p className="text-slate-500 font-semibold">Your parent controls currently disable game access.</p>
                    <Link href="/portal/settings" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black">
                        Open Parent Controls
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/portal"
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                                title="Back to Portal"
                            >
                                <ArrowLeft size={22} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                    <span className="text-3xl">🎮</span>
                                    Island Games
                                </h1>
                                <p className="text-white/50 text-sm">Learn, Play, Explore!</p>
                            </div>
                        </div>

                        {/* XP & Stats */}
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-2">
                                <Star className="text-amber-400" size={20} />
                                <span className="font-black text-amber-400">{totalXP.toLocaleString()}</span>
                                <span className="text-amber-400/60 text-sm">XP</span>
                            </div>
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-2">
                                <Trophy className="text-green-400" size={20} />
                                <span className="font-black text-green-400">{unlockedGames.length}</span>
                                <span className="text-green-400/60 text-sm">Unlocked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Category Filter */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search games or learning focus..."
                            aria-label="Search games"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                        />
                    </label>
                    <select
                        value={durationFilter}
                        onChange={(e) => setDurationFilter(e.target.value as 'all' | 'short' | 'medium' | 'long')}
                        aria-label="Filter by duration"
                        className="bg-white/5 border border-white/10 rounded-2xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white/30"
                    >
                        <option value="all" className="text-black">All Durations</option>
                        <option value="short" className="text-black">Short (≤5 min)</option>
                        <option value="medium" className="text-black">Medium (6-10 min)</option>
                        <option value="long" className="text-black">Long (10+ min)</option>
                    </select>
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                        aria-label="Filter by difficulty"
                        className="bg-white/5 border border-white/10 rounded-2xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white/30"
                    >
                        <option value="all" className="text-black">All Difficulty</option>
                        <option value="easy" className="text-black">Easy</option>
                        <option value="medium" className="text-black">Medium</option>
                        <option value="hard" className="text-black">Hard</option>
                    </select>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
                    {/* Accessibility Filter */}
                    <button
                        onClick={() => setShowOnlyAccessible(!showOnlyAccessible)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border ${showOnlyAccessible
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'}`}
                    >
                        {showOnlyAccessible ? <CheckCircle size={20} /> : <Lock size={20} />}
                        My Plan
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block" />

                    {GAME_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-primary/20 scale-105`
                                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            <span className="text-lg">{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Hero Game */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 mb-8">
                <div className="relative bg-gradient-to-r from-primary via-secondary to-accent rounded-[2.5rem] p-8 overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24 blur-2xl" />
                    <Sparkles className="absolute top-6 right-6 text-white/30 w-16 h-16 animate-pulse" />

                    <div className="relative z-10 flex items-center gap-8">
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-7xl shadow-2xl group-hover:scale-110 transition-transform">
                            ✨
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                                    R.O.T.I. Guided
                                </span>
                                <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Kid Favorite
                                </span>
                            </div>
                            <h2 className="text-3xl font-black mb-2">Story Library Adventure</h2>
                            <p className="text-white/80 text-lg mb-4">
                                Jump into island stories with guided reading, fun vocabulary, and cultural lessons.
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Zap className="text-yellow-300" size={16} />
                                    <span className="font-bold">160 XP</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-white/60" />
                                    <span>8-12 min</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Wand2 size={16} className="text-white/60" />
                                    <span>Read & Learn</span>
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/portal/stories"
                            className="px-8 py-4 bg-white text-primary rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Play size={22} /> Start Reading
                        </Link>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Gamepad2 size={24} className="text-primary" />
                        {activeCategory === 'all' ? 'All Games' : GAME_CATEGORIES.find(c => c.id === activeCategory)?.label}
                        <span className="text-white/40 font-normal ml-2">({filteredGames.length})</span>
                    </h2>
                </div>

                {filteredGames.length === 0 ? (
                    <div className="py-20">
                        <EmptyState
                            icon="🎮"
                            title="No Games Found"
                            message="Tanty's game box is currently being tidied. Try another category or check back later!"
                            actionLabel="See All Games"
                            onAction={() => setActiveCategory('all')}
                        />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGames.map((game) => {
                            const tier = (game as any).tier_required || (game as any).tier;
                            const isLocked = !canPlayGame(tier);
                            const progress = progressMap[game.id];

                            return (
                                <div
                                    key={game.id}
                                    className={`group relative bg-gradient-to-br ${(game as any).gradient || 'from-primary to-accent'} rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-2xl hover:z-10 ${isLocked ? 'opacity-70' : ''}`}
                                >
                                    {/* Glass overlay */}
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                                        {game.isNew && (
                                            <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Sparkles size={12} /> NEW
                                            </span>
                                        )}
                                        {game.isPopular && (
                                            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                <Heart size={12} /> HOT
                                            </span>
                                        )}
                                    </div>

                                    {/* Lock Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                                            <Lock size={40} className="text-white mb-3" />
                                            <p className="text-white font-bold mb-2">Upgrade to Play</p>
                                            <Link
                                                href="/#pricing"
                                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                See Plans
                                            </Link>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 p-6 h-full flex flex-col">
                                        {/* Icon */}
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                            {game.emoji}
                                        </div>

                                        {/* Text */}
                                        <h3 className="text-xl font-black mb-2">{game.title}</h3>
                                        <p className="text-white/70 text-sm mb-4 flex-1">{game.description}</p>
                                        {game.learningFocus && (
                                            <p className="text-white/85 text-xs font-bold mb-3">
                                                Learning Focus: {game.learningFocus}
                                            </p>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Zap size={12} className="text-yellow-400" />
                                                <span className="font-bold text-yellow-400">{game.xp} XP</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {game.time}
                                            </span>
                                        </div>

                                        {progress && (
                                            <div className="mb-4 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold text-white/85">
                                                Played {progress.plays}x · Best Score {progress.bestScore}
                                            </div>
                                        )}

                                        {/* Play Button */}
                                        {!isLocked && (
                                            <Link
                                                prefetch={false}
                                                href={
                                                    game.game_url && game.game_url.startsWith('/')
                                                        ? game.game_url
                                                        : game.id === 'story-library'
                                                            ? '/portal/stories'
                                                            : game.id === 'island-explorer'
                                                                ? '/portal/games/flag-match'
                                                                : game.id === 'cultural-quiz'
                                                                    ? '/portal/games/island-trivia'
                                                                    : `/portal/games/${game.id}`
                                                }
                                                className="w-full py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 border border-white/20"
                                            >
                                                <Play size={18} /> Play Now
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Coming Soon Banner */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-8 text-center backdrop-blur-sm">
                    <Wand2 className="mx-auto mb-4 text-purple-400" size={40} />
                    <h3 className="text-2xl font-black mb-2">More R.O.T.I. Adventures Coming Soon!</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                        New educational island games from the Likkle Legends universe are on the way,
                        guided by R.O.T.I. and the crew. Stay tuned for weekly game drops.
                    </p>
                </div>
            </div>
        </div>
    );
}
