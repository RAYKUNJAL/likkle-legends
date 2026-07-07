"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Star, Trophy, RefreshCw, Home } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useUser } from '@/components/UserContext';
import confetti from 'canvas-confetti';
import { getGameById, logActivity } from '@/lib/database';
import { recordGameResult } from '@/lib/game-progress';

const LoadingGame = () => (
    <div className="h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            <p className="text-white/60 font-bold animate-pulse">Loading Game...</p>
        </div>
    </div>
);

// Dynamic Imports with Loaders
const ColorMatch = dynamic(() => import('@/components/games/ColorMatch'), { loading: () => <LoadingGame /> });
const IslandTrivia = dynamic(() => import('@/components/games/IslandTrivia'), { loading: () => <LoadingGame /> });
const PatoisWizard = dynamic(() => import('@/components/games/PatoisWizard'), { loading: () => <LoadingGame /> });
const IslandMemory = dynamic(() => import('@/components/games/IslandMemory'), { loading: () => <LoadingGame /> });
const FlagMatch = dynamic(() => import('@/components/games/FlagMatch'), { loading: () => <LoadingGame /> });
// New games cherry-picked from game-zone branch
const SpeedShapes = dynamic(() => import('@/components/games/SpeedShapes'), { loading: () => <LoadingGame /> });
const WordBuilder = dynamic(() => import('@/components/games/WordBuilder'), { loading: () => <LoadingGame /> });
const IngredientSort = dynamic(() => import('@/components/games/IngredientSort'), { loading: () => <LoadingGame /> });
const IslandPassportExplorer = dynamic(() => import('@/components/games/IslandPassportExplorer'), { loading: () => <LoadingGame /> });
const CountingMarket = dynamic(() => import('@/components/games/CountingMarket'), { loading: () => <LoadingGame /> });
const RecipeScramble = dynamic(() => import('@/components/games/RecipeScramble'), { loading: () => <LoadingGame /> });
const RhythmMatcher = dynamic(() => import('@/components/games/RhythmMatcher'), { loading: () => <LoadingGame /> });
const MathAdventure = dynamic(() => import('@/components/games/MathAdventure'), { loading: () => <LoadingGame /> });

interface CompletionScreenProps {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    gameTitle: string;
    onPlayAgain: () => void;
    onGoHome: () => void;
}

const CompletionScreen = ({
    score,
    correctAnswers,
    totalQuestions,
    gameTitle,
    onPlayAgain,
    onGoHome
}: CompletionScreenProps) => {
    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
    }, []);

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    return (
        <div className="max-w-md mx-auto text-center relative z-10">
            <div className="bg-gradient-to-br from-amber-500/20 via-primary/20 to-purple-500/20 backdrop-blur-lg rounded-[3rem] p-10 border border-white/20 shadow-2xl">
                {/* Trophy */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full animate-pulse opacity-50 blur-xl" />
                    <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
                        <Trophy className="text-white" size={60} />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text mb-2">
                    Legendary!
                </h1>
                <p className="text-white/60 mb-8">You completed {gameTitle}!</p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <Star
                            key={i}
                            size={48}
                            className={`transition-all duration-500 ${i <= stars
                                ? 'text-yellow-400 fill-yellow-400 scale-110'
                                : 'text-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Stats */}
                <div className="bg-white/10 rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-3xl font-black text-primary">{score}</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-green-400">{accuracy}%</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Accuracy</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-amber-400">+{Math.floor(score / 10)}</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold">XP Earned</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onPlayAgain}
                        className="py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} /> Play Again
                    </button>
                    <button
                        onClick={onGoHome}
                        className="py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <Home size={18} /> Games Hub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function GamePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = (params?.id as string) || '';
    const { user, activeChild, refreshChildren } = useUser();

    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [gameKey, setGameKey] = useState(0);
    const [dbGame, setDbGame] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) return;
            // List of featured IDs that don't need DB fetch (matching renderGame logic)
            const featuredIds = [
                'island-memory', 'island-match',
                'patois-wizard', 'patois-puzzle',
                'island-trivia', 'ai-trivia', 'trivia',
                'color-match', 'flag-match', 'island-explorer',
                'speed-shapes', 'word-builder', 'ingredient-sort',
                'island-passport-explorer', 'counting-market', 'recipe-scramble',
                'rhythm-matcher', 'math-adventure'
            ];

            if (!featuredIds.includes(gameId)) {
                try {
                    const game = await getGameById(gameId);
                    setDbGame(game);
                } catch (err) {
                    console.error("Error fetching game:", err);
                }
            }
            setIsLoading(false);
        };
        fetchGame();
    }, [gameId]);

    const getGameTitle = () => {
        if (dbGame) return dbGame.title;
        switch (gameId) {
            case 'island-memory':
            case 'island-match':
                return 'Island Memory Match';
            case 'patois-wizard':
            case 'patois-puzzle':
                return 'Patois Word Wizard';
            case 'island-trivia':
            case 'ai-trivia':
            case 'trivia':
                return 'Island Trivia Quest';
            case 'color-match':
                return 'Island Color Match';
            case 'flag-match':
            case 'island-explorer':
                return 'Caribbean Flag Match';
            case 'speed-shapes':
                return 'Speed Shapes';
            case 'word-builder':
                return 'Island Word Builder';
            case 'ingredient-sort':
                return 'Ingredient Sort';
            case 'island-passport-explorer':
                return 'Island Passport Explorer';
            case 'counting-market':
                return 'Caribbean Market Counting';
            case 'recipe-scramble':
                return 'Recipe Scramble';
            case 'rhythm-matcher':
                return 'Rhythm Matcher';
            case 'math-adventure':
                return "R.O.T.I.'s Math Adventure";
            default:
                return 'Island Game';
        }
    };

    const handleComplete = async (earnedScore: number, correct: number = 0, total: number = 0) => {
        setScore(earnedScore);
        setCorrectAnswers(correct);
        setTotalQuestions(total);
        setIsComplete(true);

        recordGameResult(gameId, earnedScore);

        if (user && activeChild) {
            const xpEarned = Math.max(Math.floor(earnedScore / 10), 0);
            try {
                await logActivity(
                    user.id,
                    activeChild.id,
                    'game',
                    gameId,
                    xpEarned,
                    0,
                    { score: earnedScore, correctAnswers: correct, totalQuestions: total }
                );
                await refreshChildren();
            } catch (err) {
                console.error("Error logging game activity:", err);
            }
        }
    };

    const handlePlayAgain = () => {
        setIsComplete(false);
        setScore(0);
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setGameKey(prev => prev + 1);
    };

    const renderGame = () => {
        let activeEngineId = gameId;
        if (dbGame) {
            const url = dbGame.game_url || '';
            const type = dbGame.game_type || '';
            if (url.includes('island-trivia') || type === 'quiz' || type === 'trivia' || type === 'math' || type === 'word_search' || type === 'number_game') {
                activeEngineId = 'island-trivia';
            } else if (url.includes('island-memory') || type === 'matching') {
                activeEngineId = 'island-memory';
            } else if (url.includes('patois-wizard') || type === 'word_builder' || type === 'spelling') {
                activeEngineId = 'patois-wizard';
            } else if (url.includes('color-match') || type === 'color') {
                activeEngineId = 'color-match';
            } else if (url.includes('flag-match') || url.includes('island-explorer') || type === 'flag') {
                activeEngineId = 'flag-match';
            } else if (url.includes('tantys-kitchen')) {
                if (type === 'quiz') {
                    activeEngineId = 'island-trivia';
                } else {
                    activeEngineId = 'color-match';
                }
            }
        }

        switch (activeEngineId) {
            case 'color-match':
                return <ColorMatch onComplete={handleComplete} />;
            case 'island-trivia':
            case 'ai-trivia':
            case 'trivia':
                return <IslandTrivia onComplete={handleComplete} />;
            case 'patois-wizard':
            case 'patois-puzzle':
                return <PatoisWizard onComplete={handleComplete} />;
            case 'island-memory':
            case 'island-match':
                return <IslandMemory onComplete={handleComplete} />;
            case 'flag-match':
            case 'island-explorer':
                return <FlagMatch onComplete={(earnedScore) => handleComplete(earnedScore, 10, 10)} />;
            // New games from game-zone branch
            case 'speed-shapes':
                return <SpeedShapes onComplete={handleComplete} />;
            case 'word-builder':
                return <WordBuilder onComplete={handleComplete} />;
            case 'ingredient-sort':
                return <IngredientSort onComplete={handleComplete} />;
            case 'island-passport-explorer':
                return <IslandPassportExplorer onComplete={handleComplete} />;
            case 'counting-market':
                return <CountingMarket onComplete={handleComplete} />;
            case 'recipe-scramble':
                return <RecipeScramble onComplete={handleComplete} />;
            case 'rhythm-matcher':
                return <RhythmMatcher onComplete={handleComplete} />;
            case 'math-adventure':
                return <MathAdventure onComplete={handleComplete} />;
            default:
                return (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-black mb-4">Game Not Found</h2>
                        <p className="text-white/60 mb-8">
                            Tanty Spice and the team are building this island adventure. Check back soon!
                        </p>
                        <Link
                            href="/portal/games"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-xl font-bold"
                        >
                            <ArrowLeft size={18} /> Back to Games
                        </Link>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/portal/games')}
                        className="flex items-center gap-2 text-white/60 font-bold hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Games
                    </button>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 px-5 py-2 rounded-full">
                        <Gamepad2 className="text-primary" size={18} />
                        <span className="font-black text-white text-sm">{getGameTitle()}</span>
                    </div>
                </div>
            </header>

            {/* Game Content */}
            <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-80px)]">
                {isLoading ? (
                    <LoadingGame />
                ) : isComplete ? (
                    <CompletionScreen
                        score={score}
                        correctAnswers={correctAnswers}
                        totalQuestions={totalQuestions}
                        gameTitle={getGameTitle()}
                        onPlayAgain={handlePlayAgain}
                        onGoHome={() => router.push('/portal/games')}
                    />
                ) : (
                    <div key={gameKey} className="h-full">
                        {renderGame()}
                    </div>
                )}
            </main>
        </div>
    );
}
