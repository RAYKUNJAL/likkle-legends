"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Trophy, Star, RefreshCw, CheckCircle2,
    XCircle, Sparkles, Brain, Gamepad2, Play, Zap, Heart,
    Crown, Target, Volume2, ChevronRight, Home, Award
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import confetti from 'canvas-confetti';
import MangoCatch from '@/components/games/MangoCatch';
import ColorMatch from '@/components/games/ColorMatch';

// ==========================================
// TYPES
// ==========================================

interface TriviaQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    funFact: string;
    emoji: string;
}

// ==========================================
// GAME DATA
// ==========================================

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
    {
        question: "What is Jamaica's national fruit?",
        options: ["Ackee", "Mango", "Banana", "Pineapple"],
        correctIndex: 0,
        funFact: "Ackee was brought to Jamaica from West Africa and is now the country's national fruit!",
        emoji: "🫐"
    },
    {
        question: "Which musical instrument was invented in Trinidad?",
        options: ["Steel Pan", "Guitar", "Piano", "Trumpet"],
        correctIndex: 0,
        funFact: "The steel pan is the only acoustic instrument invented in the 20th century!",
        emoji: "🥁"
    },
    {
        question: "What does 'Wah Gwan' mean in Jamaican Patois?",
        options: ["What's going on?", "Goodbye", "Thank you", "I'm hungry"],
        correctIndex: 0,
        funFact: "'Wah Gwan' is a friendly way to say hello in Jamaica!",
        emoji: "👋"
    },
    {
        question: "Which Caribbean bird is known for its colorful feathers?",
        options: ["Parrot", "Penguin", "Owl", "Eagle"],
        correctIndex: 0,
        funFact: "Caribbean parrots can live for over 50 years!",
        emoji: "🦜"
    },
    {
        question: "What sea surrounds the Caribbean islands?",
        options: ["Caribbean Sea", "Arctic Ocean", "Pacific Ocean", "Red Sea"],
        correctIndex: 0,
        funFact: "The Caribbean Sea is one of the warmest and clearest seas in the world!",
        emoji: "🌊"
    },
    {
        question: "What does 'Irie' mean?",
        options: ["Feeling good", "Feeling sad", "Feeling sleepy", "Feeling hungry"],
        correctIndex: 0,
        funFact: "When Jamaicans say 'Irie', it means everything is wonderful and peaceful!",
        emoji: "😊"
    },
    {
        question: "Which fruit is long, yellow, and grows in bunches?",
        options: ["Banana", "Apple", "Grape", "Orange"],
        correctIndex: 0,
        funFact: "The Caribbean grows some of the sweetest bananas in the world!",
        emoji: "🍌"
    },
    {
        question: "What does 'Likkle' mean in Patois?",
        options: ["Little", "Big", "Fast", "Slow"],
        correctIndex: 0,
        funFact: "That's why we're called Likkle Legends - small but mighty!",
        emoji: "⭐"
    }
];

const MEMORY_SYMBOLS = [
    { symbol: '🥥', name: 'Coconut' },
    { symbol: '🥭', name: 'Mango' },
    { symbol: '🍍', name: 'Pineapple' },
    { symbol: '🍌', name: 'Banana' },
    { symbol: '🦜', name: 'Parrot' },
    { symbol: '🏝️', name: 'Island' },
    { symbol: '⛵', name: 'Boat' },
    { symbol: '🥁', name: 'Steel Pan' },
];

const PATOIS_PAIRS = [
    { patois: 'Pickney', english: 'Child', hint: 'A young person' },
    { patois: 'Wha Gwan', english: "What's going on?", hint: 'A greeting' },
    { patois: 'Big Up', english: 'Praise/Respect', hint: 'Showing appreciation' },
    { patois: 'Irie', english: 'Feeling good', hint: 'Everything is alright' },
    { patois: 'Likkle', english: 'Little', hint: 'Small in size' },
    { patois: 'Tallawah', english: 'Strong/Brave', hint: 'Mighty despite size' },
];

// ==========================================
// GAME: AI TRIVIA
// ==========================================
const AITrivia = ({ onComplete }: { onComplete: (score: number, correct: number, total: number) => void }) => {
    const [questions] = useState(() =>
        [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleAnswer = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
        setShowResult(true);

        if (index === currentQuestion.correctIndex) {
            const streakBonus = streak >= 2 ? 20 : 0;
            setScore(prev => prev + 100 + streakBonus);
            setStreak(prev => prev + 1);
            setCorrectCount(prev => prev + 1);
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            onComplete(score, correctCount, questions.length);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm font-medium">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                        {streak >= 2 && (
                            <span className="flex items-center gap-1 text-amber-400 text-sm font-bold animate-pulse">
                                🔥 {streak} Streak!
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                            <Star size={16} /> {score}
                        </span>
                    </div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-[2rem] p-8 border border-white/20 mb-6">
                <div className="text-center mb-8">
                    <span className="text-6xl mb-4 block">{currentQuestion.emoji}</span>
                    <h2 className="text-2xl font-black text-white">{currentQuestion.question}</h2>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => {
                        let buttonClass = "w-full p-5 rounded-2xl font-bold text-left transition-all flex items-center gap-4 ";

                        if (showResult) {
                            if (index === currentQuestion.correctIndex) {
                                buttonClass += "bg-green-500/30 border-2 border-green-400 text-green-300";
                            } else if (index === selectedAnswer) {
                                buttonClass += "bg-red-500/30 border-2 border-red-400 text-red-300";
                            } else {
                                buttonClass += "bg-white/5 border-2 border-white/10 text-white/50";
                            }
                        } else {
                            buttonClass += "bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-[1.02]";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={showResult}
                                className={buttonClass}
                            >
                                <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="flex-1 text-lg">{option}</span>
                                {showResult && index === currentQuestion.correctIndex && (
                                    <CheckCircle2 className="text-green-400" size={24} />
                                )}
                                {showResult && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                                    <XCircle className="text-red-400" size={24} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Result & Fun Fact */}
            {showResult && (
                <div className={`rounded-2xl p-6 mb-6 border-2 ${isCorrect
                    ? 'bg-green-500/20 border-green-500/40'
                    : 'bg-orange-500/20 border-orange-500/40'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isCorrect ? 'bg-green-500/30' : 'bg-orange-500/30'
                            }`}>
                            {isCorrect ? '🎉' : '💪'}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-black mb-1 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}>
                                {isCorrect ? 'Correct! Amazing!' : 'Good try, legend!'}
                            </h4>
                            <p className="text-white/70 text-sm">{currentQuestion.funFact}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Next Button */}
            {showResult && (
                <button
                    onClick={nextQuestion}
                    className="w-full py-5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-primary/30"
                >
                    {currentIndex < questions.length - 1 ? (
                        <>Continue <ChevronRight size={22} /></>
                    ) : (
                        <>See Results <Trophy size={22} /></>
                    )}
                </button>
            )}
        </div>
    );
};

// ==========================================
// GAME: MEMORY MATCH (Enhanced)
// ==========================================
const MemoryGame = ({ onComplete }: { onComplete: (score: number, correct: number, total: number) => void }) => {
    const [cards, setCards] = useState<{ id: number; symbol: string; name: string; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const totalPairs = MEMORY_SYMBOLS.length;

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const shuffled = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
                id: index,
                symbol: item.symbol,
                name: item.name,
                isFlipped: false,
                isMatched: false
            }));
        setCards(shuffled);
        setMoves(0);
        setMatches(0);
        setFlippedIndices([]);
    };

    const handleCardClick = (index: number) => {
        if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [firstIndex, secondIndex] = newFlipped;

            if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedIndices([]);
                setMatches(prev => {
                    const next = prev + 1;
                    if (next === totalPairs) {
                        const score = Math.max(1000 - moves * 30, 300);
                        onComplete(score, next, totalPairs);
                    }
                    return next;
                });
            } else {
                setTimeout(() => {
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards(newCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            {/* Stats Bar */}
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 mb-8">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <span className="text-white/60 text-sm">Moves:</span>
                    <span className="font-black text-white">{moves}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-400" />
                    <span className="text-white/60 text-sm">Matches:</span>
                    <span className="font-black text-amber-400">{matches}/{totalPairs}</span>
                </div>
                <button
                    onClick={initializeGame}
                    title="Reset Game"
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                    <RefreshCw size={18} className="text-white/60" />
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-4 gap-3">
                {cards.map((card, index) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 transform ${card.isFlipped || card.isMatched
                            ? 'bg-gradient-to-br from-primary to-accent rotate-0 scale-100'
                            : 'bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40'
                            } ${card.isMatched ? 'opacity-60' : ''}`}
                    >
                        <span className={`transition-all duration-300 ${card.isFlipped || card.isMatched ? 'scale-100' : 'scale-0'
                            }`}>
                            {card.isFlipped || card.isMatched ? card.symbol : ''}
                        </span>
                        {!card.isFlipped && !card.isMatched && (
                            <span className="text-2xl text-white/30">?</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// GAME: PATOIS WIZARD (Enhanced)
// ==========================================
const PatoisWizard = ({ onComplete }: { onComplete: (score: number, correct: number, total: number) => void }) => {
    const [shuffledPatois, setShuffledPatois] = useState<typeof PATOIS_PAIRS>([]);
    const [shuffledEnglish, setShuffledEnglish] = useState<typeof PATOIS_PAIRS>([]);
    const [selectedPatois, setSelectedPatois] = useState<string | null>(null);
    const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
    const [matches, setMatches] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        setShuffledPatois([...PATOIS_PAIRS].sort(() => Math.random() - 0.5));
        setShuffledEnglish([...PATOIS_PAIRS].sort(() => Math.random() - 0.5));
    }, []);

    const handleSelect = (word: string, type: 'patois' | 'english') => {
        if (type === 'patois') setSelectedPatois(word);
        else setSelectedEnglish(word);

        if ((type === 'patois' && selectedEnglish) || (type === 'english' && selectedPatois)) {
            const pWord = type === 'patois' ? word : selectedPatois!;
            const eWord = type === 'english' ? word : selectedEnglish!;

            const pair = PATOIS_PAIRS.find(p => p.patois === pWord);
            if (pair?.english === eWord) {
                setMatches(prev => {
                    const next = [...prev, pWord];
                    if (next.length === PATOIS_PAIRS.length) {
                        onComplete(600, next.length, PATOIS_PAIRS.length);
                    }
                    return next;
                });
                setFeedback({ type: 'success', text: 'Perfect match! 🎉' });
                setSelectedPatois(null);
                setSelectedEnglish(null);
            } else {
                setFeedback({ type: 'error', text: 'Try again! 💪' });
                setSelectedPatois(null);
                setSelectedEnglish(null);
            }
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Match the Patois Words!</h2>
                <p className="text-white/60">Connect Jamaican words to their English meanings</p>
            </div>

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-bounce ${feedback.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    {feedback.text}
                </div>
            )}

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {PATOIS_PAIRS.map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${i < matches.length ? 'bg-green-500 scale-125' : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>

            {/* Word Columns */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <p className="text-xs font-black text-primary uppercase tracking-widest text-center mb-4">
                        🇯🇲 Patois
                    </p>
                    {shuffledPatois.map(pair => {
                        const isMatched = matches.includes(pair.patois);
                        return (
                            <button
                                key={pair.patois}
                                disabled={isMatched}
                                onClick={() => handleSelect(pair.patois, 'patois')}
                                className={`w-full p-5 rounded-2xl font-bold text-lg transition-all border-2 ${isMatched
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400 opacity-60'
                                    : selectedPatois === pair.patois
                                        ? 'bg-primary border-primary text-white scale-105 shadow-xl shadow-primary/30'
                                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                            >
                                {pair.patois}
                            </button>
                        );
                    })}
                </div>
                <div className="space-y-3">
                    <p className="text-xs font-black text-secondary uppercase tracking-widest text-center mb-4">
                        🇺🇸 English
                    </p>
                    {shuffledEnglish.map(pair => {
                        const matchedPair = PATOIS_PAIRS.find(p => p.english === pair.english);
                        const isMatched = matchedPair && matches.includes(matchedPair.patois);
                        return (
                            <button
                                key={pair.english}
                                disabled={isMatched}
                                onClick={() => handleSelect(pair.english, 'english')}
                                className={`w-full p-5 rounded-2xl font-bold text-lg transition-all border-2 ${isMatched
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400 opacity-60'
                                    : selectedEnglish === pair.english
                                        ? 'bg-secondary border-secondary text-white scale-105 shadow-xl shadow-secondary/30'
                                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                            >
                                {pair.english}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// COMPLETION SCREEN
// ==========================================
const CompletionScreen = ({
    score,
    correctAnswers,
    totalQuestions,
    gameTitle,
    onPlayAgain,
    onGoHome
}: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    gameTitle: string;
    onPlayAgain: () => void;
    onGoHome: () => void;
}) => {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    useEffect(() => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="bg-gradient-to-br from-amber-500/20 via-primary/20 to-purple-500/20 backdrop-blur-lg rounded-[3rem] p-10 border border-white/20 shadow-2xl">
                {/* Trophy */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full animate-pulse opacity-50 blur-xl" />
                    <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
                        <Trophy className="text-white" size={60} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <Sparkles className="text-primary" size={24} />
                    </div>
                </div>

                {/* Title */}
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
                            style={{ transitionDelay: `${i * 200}ms` }}
                        />
                    ))}
                </div>

                {/* Stats */}
                <div className="bg-white/10 rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-3xl font-black text-primary">{score}</p>
                            <p className="text-white/50 text-xs uppercase tracking-wider">Score</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-green-400">{accuracy}%</p>
                            <p className="text-white/50 text-xs uppercase tracking-wider">Accuracy</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-amber-400">+{Math.floor(score / 10)}</p>
                            <p className="text-white/50 text-xs uppercase tracking-wider">XP Earned</p>
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

// ==========================================
// MAIN GAME PAGE
// ==========================================
export default function GamePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = (params?.id as string) || '';
    const { activeChild } = useUser();

    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [gameKey, setGameKey] = useState(0);

    const handleComplete = (earnedScore: number, correct: number, total: number) => {
        setScore(earnedScore);
        setCorrectAnswers(correct);
        setTotalQuestions(total);
        setIsComplete(true);
    };

    const handlePlayAgain = () => {
        setIsComplete(false);
        setScore(0);
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setGameKey(prev => prev + 1);
    };

    const getGameTitle = () => {
        switch (gameId) {
            case 'island-match': return 'Island Memory Match';
            case 'patois-puzzle': return 'Patois Word Wizard';
            case 'ai-trivia': return 'AI Island Trivia';
            case 'trivia': return 'Caribbean Trivia';
            case 'mango-catch': return 'Mango Catch Adventure';
            case 'color-match': return 'Island Color Match';
            default: return 'Island Game';
        }
    };

    const renderGame = () => {
        switch (gameId) {
            case 'island-match':
                return <MemoryGame key={gameKey} onComplete={handleComplete} />;
            case 'patois-puzzle':
                return <PatoisWizard key={gameKey} onComplete={handleComplete} />;
            case 'ai-trivia':
            case 'trivia':
                return <AITrivia key={gameKey} onComplete={handleComplete} />;
            case 'mango-catch':
                return <MangoCatch key={gameKey} onComplete={handleComplete} />;
            case 'color-match':
                return <ColorMatch key={gameKey} onComplete={handleComplete} />;
            default:
                return (
                    <div className="text-center py-20 bg-white/10 backdrop-blur-lg rounded-[3rem] border border-white/20">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">🚧</div>
                        <h2 className="text-2xl font-black text-white mb-2">Game Coming Soon!</h2>
                        <p className="text-white/60 mb-8 max-w-xs mx-auto">
                            Our team is building this island adventure. Check back soon!
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
                <div className="max-w-4xl mx-auto flex items-center justify-between">
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
            <main className="relative z-10 max-w-4xl mx-auto py-12 px-4">
                {isComplete ? (
                    <CompletionScreen
                        score={score}
                        correctAnswers={correctAnswers}
                        totalQuestions={totalQuestions}
                        gameTitle={getGameTitle()}
                        onPlayAgain={handlePlayAgain}
                        onGoHome={() => router.push('/portal/games')}
                    />
                ) : (
                    renderGame()
                )}
            </main>
        </div>
    );
}
