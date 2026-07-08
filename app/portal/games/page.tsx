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
        title: 'Caribbean Market Counting',
        description: 'Shop the island market on a budget, then make the correct change at checkout!',
        emoji: '🏪',
        gradient: 'from-teal-400 via-emerald-500 to-green-600',
        tier: 'free',
        category: 'math',
        xp: 120,
        time: '6 min',
        learningFocus: 'Budgeting, addition, subtraction, and money skills',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'math-adventure',
        title: "R.O.T.I.'s Math Adventure",
        description: 'Join R.O.T.I. on a Caribbean math quest — add, subtract, multiply and divide to deliver goods!',
        emoji: '➕',
        gradient: 'from-cyan-400 via-teal-500 to-emerald-600',
        tier: 'free',
        category: 'math',
        xp: 150,
        time: '8 min',
        learningFocus: 'Arithmetic (add, subtract, multiply, divide) through story problems',
        isNew: true,
        isPopular: true,
    },
    {
        id: 'speed-shapes',
        title: 'Speed Shapes',
        description: 'Watch the shape flash, then pick it fast! Test your memory and reflexes.',
        emoji: '🟢',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
        tier: 'free',
        category: 'memory',
        xp: 100,
        time: '5 min',
        learningFocus: 'Visual memory, shape recognition, and reaction speed',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'word-builder',
        title: 'Island Word Builder',
        description: 'Build Caribbean fruit & food words from scrambled letters — mango, cocoa, papaya and more!',
        emoji: '🔤',
        gradient: 'from-amber-400 via-yellow-500 to-orange-600',
        tier: 'free',
        category: 'word',
        xp: 100,
        time: '6 min',
        learningFocus: 'Spelling, vocabulary, and tropical food knowledge',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'recipe-scramble',
        title: 'Recipe Scramble',
        description: 'Unscramble the steps of classic Caribbean recipes and cook them in the right order!',
        emoji: '🥘',
        gradient: 'from-orange-400 via-amber-500 to-yellow-600',
        tier: 'free',
        category: 'creative',
        xp: 120,
        time: '6 min',
        learningFocus: 'Sequencing, reading comprehension, and Caribbean cuisine',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'ingredient-sort',
        title: 'Ingredient Sort',
        description: 'Drag Caribbean ingredients into the right kitchen baskets — vegetables, fruits, spices & grains!',
        emoji: '🥬',
        gradient: 'from-green-400 via-lime-500 to-emerald-600',
        tier: 'free',
        category: 'creative',
        xp: 100,
        time: '5 min',
        learningFocus: 'Categorization and Caribbean food knowledge',
        isNew: true,
        isPopular: false,
    },
    {
        id: 'rhythm-matcher',
        title: 'Rhythm Matcher',
        description: 'Listen to Caribbean beats — soca, reggae & steel drums — then tap the rhythm back!',
        emoji: '🥁',
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
        tier: 'free',
        category: 'music',
        xp: 120,
        time: '6 min',
        learningFocus: 'Auditory memory, sequencing, and Caribbean music culture',
        isNew: true,
        isPopular: true,
    },
    {
        id: 'island-passport-explorer',
        title: 'Island Passport Explorer',
        description: 'Travel to 8 Caribbean islands, learn their facts, and answer trivia to collect passport stamps!',
        emoji: '🛂',
        gradient: 'from-sky-400 via-blue-500 to-indigo-600',
        tier: 'free',
        category: 'adventure',
        xp: 160,
        time: '8-10 min',
        learningFocus: 'Caribbean geography, capitals, currencies, and culture',
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
        <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50 text-slate-800 overflow-x-hidden">
            {/* Sunny island backdrop */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full blur-2xl opacity-70" />
                <div className="absolute top-24 left-[8%] text-5xl sm:text-7xl opacity-30 select-none">☁️</div>
                <div className="absolute top-10 right-[30%] text-4xl sm:text-6xl opacity-25 select-none">☁️</div>
                <div className="absolute bottom-10 left-[3%] text-6xl sm:text-8xl opacity-20 select-none">🌴</div>
                <div className="absolute bottom-16 right-[4%] text-6xl sm:text-8xl opacity-20 select-none">🌴</div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-3 pt-3 sm:px-6 sm:pt-6">
                <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-[1.75rem] sm:rounded-[2.25rem] shadow-xl shadow-sky-200/60 border-4 border-white px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                href="/portal"
                                aria-label="Back to Portal"
                                className="w-12 h-12 shrink-0 bg-sky-100 hover:bg-sky-200 active:scale-90 rounded-2xl transition-all flex items-center justify-center text-sky-600"
                                title="Back to Portal"
                            >
                                <ArrowLeft size={24} strokeWidth={3} />
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2 leading-none">
                                    <span className="text-2xl sm:text-4xl">🏝️</span>
                                    <span className="truncate">Island Games</span>
                                </h1>
                                <p className="text-slate-400 text-xs sm:text-sm font-bold mt-0.5">Learn, play & explore the Caribbean!</p>
                            </div>
                        </div>

                        {/* XP & Stats */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="bg-gradient-to-r from-amber-300 to-yellow-400 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 shadow-md shadow-amber-200">
                                <Star className="text-white fill-white" size={18} />
                                <span className="font-black text-white text-sm sm:text-base drop-shadow-sm">{totalXP.toLocaleString()} XP</span>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-400 to-green-500 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-200">
                                <Trophy className="text-white" size={18} />
                                <span className="font-black text-white text-sm sm:text-base drop-shadow-sm">{unlockedGames.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Category pills */}
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible md:flex-wrap pb-3 scrollbar-hide items-stretch -mx-1 px-1">
                    {GAME_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 sm:px-6 min-h-[52px] rounded-full font-black text-sm sm:text-base whitespace-nowrap transition-all active:scale-95 ${activeCategory === cat.id
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105 border-4 border-white`
                                : 'bg-white/80 text-slate-500 hover:bg-white border-4 border-transparent shadow-sm'
                                }`}
                        >
                            <span className="text-xl sm:text-2xl">{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Parent search & filters */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                    <label className="relative md:col-span-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search games..."
                            aria-label="Search games"
                            className="w-full bg-white/80 border-2 border-white rounded-full py-3 pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 shadow-sm"
                        />
                    </label>
                    <select
                        value={durationFilter}
                        onChange={(e) => setDurationFilter(e.target.value as 'all' | 'short' | 'medium' | 'long')}
                        aria-label="Filter by duration"
                        className="bg-white/80 border-2 border-white rounded-full py-3 px-5 text-sm font-bold text-slate-500 focus:outline-none focus:border-sky-300 shadow-sm appearance-none"
                    >
                        <option value="all">⏱️ Any length</option>
                        <option value="short">Short (5 min or less)</option>
                        <option value="medium">Medium (6-10 min)</option>
                        <option value="long">Long (10+ min)</option>
                    </select>
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                        aria-label="Filter by difficulty"
                        className="bg-white/80 border-2 border-white rounded-full py-3 px-5 text-sm font-bold text-slate-500 focus:outline-none focus:border-sky-300 shadow-sm appearance-none"
                    >
                        <option value="all">🌟 Any difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Featured Hero Game */}
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 mt-5 sm:mt-8 mb-6 sm:mb-10">
                <div className="relative bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 overflow-hidden group border-4 border-white shadow-2xl shadow-fuchsia-200/60">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full -mr-32 -mt-32 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
                    <Sparkles className="absolute top-5 right-5 text-white/40 w-8 h-8 sm:w-14 sm:h-14 animate-pulse" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-white">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white/25 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl sm:text-6xl shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform shrink-0">
                            📚
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white/25 rounded-full text-[11px] font-black uppercase tracking-wider">
                                    ⭐ Today's Pick
                                </span>
                                <span className="px-3 py-1 bg-emerald-400/90 text-white rounded-full text-[11px] font-black uppercase tracking-wider">
                                    Kid Favorite
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black mb-1.5 drop-shadow-sm">Story Library Adventure</h2>
                            <p className="text-white/90 text-sm sm:text-lg mb-3 font-semibold">
                                Jump into island stories with guided reading, fun vocabulary, and cultural lessons.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm font-bold">
                                <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                    <Zap className="text-yellow-300" size={15} /> 160 XP
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                    <Clock size={15} /> 8-12 min
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/portal/stories"
                            className="w-full md:w-auto px-8 py-4 bg-white text-fuchsia-600 rounded-full font-black text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Play size={22} className="fill-fuchsia-600" /> Read Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-black flex items-center gap-2 text-slate-700">
                        <Gamepad2 size={26} className="text-fuchsia-500" />
                        {activeCategory === 'all' ? 'All Games' : GAME_CATEGORIES.find(c => c.id === activeCategory)?.label}
                        <span className="text-slate-400 font-bold text-base ml-1">({filteredGames.length})</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredGames.map((game) => {
                            const tier = (game as any).tier_required || (game as any).tier;
                            const isLocked = !canPlayGame(tier);
                            const progress = progressMap[game.id];
                            const playHref = game.game_url && game.game_url.startsWith('/')
                                ? game.game_url
                                : game.id === 'story-library'
                                    ? '/portal/stories'
                                    : game.id === 'island-explorer'
                                        ? '/portal/games/flag-match'
                                        : game.id === 'cultural-quiz'
                                            ? '/portal/games/island-trivia'
                                            : `/portal/games/${game.id}`;

                            return (
                                <div
                                    key={game.id}
                                    className={`group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 shadow-lg shadow-sky-100 hover:shadow-2xl hover:shadow-sky-200 hover:-translate-y-2 border-4 border-white ${isLocked ? 'opacity-80' : ''}`}
                                >
                                    {/* Colorful cover */}
                                    <div className={`relative h-32 sm:h-36 bg-gradient-to-br ${(game as any).gradient || 'from-sky-400 to-cyan-500'} flex items-center justify-center`}>
                                        <span className="text-6xl sm:text-7xl drop-shadow-lg group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300 select-none">
                                            {game.emoji}
                                        </span>
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex gap-1.5">
                                            {game.isNew && (
                                                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow">
                                                    <Sparkles size={10} /> NEW
                                                </span>
                                            )}
                                            {game.isPopular && (
                                                <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow">
                                                    <Heart size={10} className="fill-white" /> HOT
                                                </span>
                                            )}
                                        </div>
                                        {/* XP chip */}
                                        <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/25 backdrop-blur-sm text-white text-[11px] font-black rounded-full px-2.5 py-1">
                                            <Zap size={11} className="text-yellow-300" /> {game.xp} XP
                                        </span>
                                    </div>

                                    {/* Lock Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 text-white">
                                            <Lock size={36} className="mb-2" />
                                            <p className="font-black mb-2">Upgrade to Play</p>
                                            <Link
                                                href="/#pricing"
                                                className="px-4 py-2 bg-white text-slate-800 rounded-full text-sm font-black hover:scale-105 transition-transform"
                                            >
                                                See Plans
                                            </Link>
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div className="p-4 sm:p-5 flex flex-col">
                                        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-1 leading-tight">{game.title}</h3>
                                        <p className="text-slate-400 text-sm font-semibold mb-3 line-clamp-2 min-h-[2.5rem]">{game.description}</p>

                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black text-slate-400 mb-3">
                                            <span className="flex items-center gap-1 bg-slate-100 rounded-full px-2.5 py-1">
                                                <Clock size={11} /> {game.time}
                                            </span>
                                            {game.learningFocus && (
                                                <span className="flex items-center gap-1 bg-sky-50 text-sky-500 rounded-full px-2.5 py-1 truncate max-w-full">
                                                    🎓 {game.learningFocus}
                                                </span>
                                            )}
                                        </div>

                                        {progress && (
                                            <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] font-black text-amber-600">
                                                🏅 Played {progress.plays}x · Best {progress.bestScore}
                                            </div>
                                        )}

                                        {!isLocked && (
                                            <Link
                                                prefetch={false}
                                                href={playHref}
                                                className={`w-full min-h-[52px] bg-gradient-to-r ${(game as any).gradient || 'from-sky-400 to-cyan-500'} text-white rounded-full font-black text-base text-center transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95`}
                                            >
                                                <Play size={20} className="fill-white" /> PLAY!
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
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pb-14">
                <div className="bg-white/80 backdrop-blur-sm border-4 border-white rounded-[2rem] p-6 sm:p-8 text-center shadow-lg shadow-sky-100">
                    <Wand2 className="mx-auto mb-3 text-fuchsia-400" size={36} />
                    <h3 className="text-xl sm:text-2xl font-black mb-2 text-slate-700">More Island Adventures Coming Soon!</h3>
                    <p className="text-slate-400 font-semibold max-w-md mx-auto text-sm sm:text-base">
                        New educational games from the Likkle Legends universe are on the way,
                        guided by R.O.T.I. and the crew. New game drops every week!
                    </p>
                </div>
            </div>
        </div>
    );
}
