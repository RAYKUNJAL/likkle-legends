"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowLeft, Map, CheckCircle2, Lock, Play, ChevronRight, Crown, Unlock, Target, Clock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

// ==========================================
// DATA: ISLANDS & QUESTIONS
// ==========================================

export type Question = {
    q: string;
    options: string[];
    a: number; // index of correct option
    fact: string;
};

export type LevelData = {
    id: number;
    name: string;
    questions: Question[];
    timeMs: number;
};

export type IslandData = {
    id: string;
    name: string;
    flag: string;
    color: string;
    description: string;
    levels: LevelData[];
};

const ISLANDS: IslandData[] = [
    {
        id: 'jamaica',
        name: 'Jamaica',
        flag: '🇯🇲',
        color: 'from-green-500 to-yellow-500',
        description: 'Land of Wood and Water',
        levels: [
            {
                id: 1, name: "Tourist", timeMs: 0,
                questions: [
                    { q: "What is the national fruit of Jamaica?", options: ["Ackee", "Mango", "Banana", "Pineapple"], a: 0, fact: "Ackee is typically cooked with Saltfish!" },
                    { q: "Who is the fastest man in the world from Jamaica?", options: ["Bob Marley", "Usain Bolt", "Shaggy", "Koffee"], a: 1, fact: "Usain Bolt holds the world record for the 100m sprint!" },
                    { q: "What is the capital city of Jamaica?", options: ["Montego Bay", "Kingston", "Negril", "Ocho Rios"], a: 1, fact: "Kingston is the cultural and economic heartbeat of Jamaica!" },
                    { q: "Which world-famous music genre started in Jamaica?", options: ["Reggae", "Jazz", "Pop", "Rock"], a: 0, fact: "Reggae was popularized globally by Bob Marley!" }
                ]
            },
            {
                id: 2, name: "Explorer", timeMs: 15000,
                questions: [
                    { q: "What is the national bird of Jamaica?", options: ["Parrot", "Pelican", "Doctor Bird", "Flamingo"], a: 2, fact: "The Doctor Bird is a beautiful swallowtail hummingbird!" },
                    { q: "What was the original name given by the Tainos?", options: ["Jamdung", "Xaymaca", "Zion", "Jamrock"], a: 1, fact: "Xaymaca translates to 'Land of Wood and Water'." },
                    { q: "What is the highest point in Jamaica?", options: ["Mystic Mountain", "Dolphin Head", "Blue Mountain Peak", "Mount Diablo"], a: 2, fact: "Blue Mountain Peak is famous for its world-class coffee!" },
                    { q: "Which of these is a popular savory Jamaican pastry?", options: ["Patty", "Empanada", "Roti", "Bake"], a: 0, fact: "A Jamaican beef patty has a flaky, yellow crust!" }
                ]
            },
            {
                id: 3, name: "Legend", timeMs: 10000,
                questions: [
                    { q: "In what year did Jamaica gain independence?", options: ["1955", "1962", "1970", "1981"], a: 1, fact: "Jamaica gained independence from the UK on August 6, 1962." },
                    { q: "What is Jamaica's national motto?", options: ["One Love, One Heart", "Out of Many, One People", "Forward Upward", "Proud and Free"], a: 1, fact: "The motto celebrates Jamaica's multicultural roots." },
                    { q: "Which Jamaican parish is famously known as the birthplace of jerk chicken?", options: ["Portland", "Kingston", "St. Ann", "Clarendon"], a: 0, fact: "Boston Bay in Portland is famous for authentic jerk pits!" },
                    { q: "How many parishes are there in Jamaica?", options: ["10", "12", "14", "16"], a: 2, fact: "Jamaica is divided into 14 parishes across 3 counties." }
                ]
            }
        ]
    },
    {
        id: 'trinidad',
        name: 'Trinidad & Tobago',
        flag: '🇹🇹',
        color: 'from-red-600 to-black',
        description: 'Home of Carnival & Steel Pan',
        levels: [
            {
                id: 1, name: "Tourist", timeMs: 0,
                questions: [
                    { q: "Which melodic instrument was invented in Trinidad?", options: ["Guitar", "Piano", "Steel Pan", "African Drum"], a: 2, fact: "The Steel Pan was made from discarded oil drums!" },
                    { q: "What is the massive pre-Lent festival called?", options: ["Christmas", "Carnival", "Easter", "Harvest"], a: 1, fact: "Trinidad Carnival is renowned as the greatest street party on earth!" },
                    { q: "What is a popular street food called 'Doubles'?", options: ["A dance move", "Curry channa on fried bread", "A card game", "Two drinks"], a: 1, fact: "Doubles is often eaten for breakfast with spicy pepper sauce!" },
                    { q: "What is the capital of Trinidad?", options: ["San Fernando", "Port of Spain", "Arima", "Scarborough"], a: 1, fact: "Port of Spain is known for its beautiful Savannah." }
                ]
            },
            {
                id: 2, name: "Explorer", timeMs: 15000,
                questions: [
                    { q: "What is the national bird of Trinidad?", options: ["Scarlet Ibis", "Cocrico", "Flamingo", "Hummingbird"], a: 0, fact: "The Scarlet Ibis is brilliant red and lives in the Caroni Swamp!" },
                    { q: "Trinidad is home to the world's largest natural deposit of what?", options: ["Gold", "Asphalt (Pitch Lake)", "Diamonds", "Bauxite"], a: 1, fact: "La Brea Pitch Lake is the largest natural deposit of asphalt!" },
                    { q: "What is the name of Trinidad's sister island?", options: ["Barbados", "Grenada", "Tobago", "Saint Lucia"], a: 2, fact: "Tobago is famous for its serene and beautiful beaches." },
                    { q: "Which fast-paced music genre was created in Trinidad to accompany Carnival?", options: ["Reggae", "Dancehall", "Soca", "Zouk"], a: 2, fact: "Soca stands for 'Soul of Calypso'!" }
                ]
            },
            {
                id: 3, name: "Legend", timeMs: 10000,
                questions: [
                    { q: "In what year did Trinidad and Tobago become independent?", options: ["1958", "1962", "1976", "1980"], a: 1, fact: "They gained independence on August 31, 1962." },
                    { q: "Which gorgeous shallow pool is located in the middle of the ocean in Tobago?", options: ["Blue Lagoon", "Nylon Pool", "Silvery Waters", "Glass Reef"], a: 1, fact: "Princess Margaret coined the name 'Nylon Pool'." },
                    { q: "What traditional Carnival character is known for breathing fire?", options: ["Midnight Robber", "Moko Jumbie", "Jab Jab", "Dame Lorraine"], a: 2, fact: "Jab Jabs crack whips and sometimes breathe fire!" }
                ]
            }
        ]
    },
    {
        id: 'barbados',
        name: 'Barbados',
        flag: '🇧🇧',
        color: 'from-blue-500 to-yellow-400',
        description: 'Gem of the Caribbean Sea',
        levels: [
            {
                id: 1, name: "Tourist", timeMs: 0,
                questions: [
                    { q: "What is the national fish of Barbados?", options: ["Flying Fish", "Shark", "Tuna", "Marlin"], a: 0, fact: "Flying fish can glide over the water for incredible distances!" },
                    { q: "Which global superstar calls Barbados home?", options: ["Rihanna", "Beyonce", "Drake", "Nicki Minaj"], a: 0, fact: "Rihanna was officially named a National Hero of Barbados!" },
                    { q: "What is the capital city?", options: ["Bridgetown", "Holetown", "Oistins", "Speightstown"], a: 0, fact: "Bridgetown and its Garrison are a UNESCO World Heritage site!" }
                ]
            },
            {
                id: 2, name: "Explorer", timeMs: 15000,
                questions: [
                    { q: "Barbados is often nicknamed the land of the...?", options: ["Setting Sun", "Flying Fish", "Sugar Cane", "Spice"], a: 1, fact: "Cou-Cou and Flying Fish is the national dish!" },
                    { q: "What is the largest festival in Barbados celebrating the end of the sugar cane harvest?", options: ["Crop Over", "Carnival", "Junkanoo", "Ole Mas"], a: 0, fact: "Crop Over features the massive Grand Kadooment parade!" },
                    { q: "What is Cou-Cou primarily made from?", options: ["Rice and peas", "Cornmeal and okra", "Cassava and fish", "Plantain"], a: 1, fact: "Cou-Cou is stirred vigorously with a cou-cou stick!" }
                ]
            },
            {
                id: 3, name: "Legend", timeMs: 10000,
                questions: [
                    { q: "When did Barbados gain independence?", options: ["1960", "1966", "1972", "1979"], a: 1, fact: "November 30, 1966." },
                    { q: "What is the national flower of Barbados?", options: ["Hibiscus", "Pride of Barbados", "Orchid", "Poinsettia"], a: 1, fact: "It is a beautiful red, orange, and yellow flower!" },
                    { q: "What is the name of the famous underground cave system in Barbados?", options: ["Crystal Caves", "Harrison's Cave", "Blue Grotto", "Pirate's Cove"], a: 1, fact: "Harrison's Cave features incredible stalactites and stalagmites!" }
                ]
            }
        ]
    },
    {
        id: 'st_lucia',
        name: 'St. Lucia',
        flag: '🇱🇨',
        color: 'from-cyan-400 to-blue-600',
        description: 'The Helen of the West',
        levels: [
            {
                id: 1, name: "Tourist", timeMs: 0,
                questions: [
                    { q: "What are the famous twin mountain peaks called?", options: ["The Pitons", "The Alps", "The Andes", "The Blue Mountains"], a: 0, fact: "Gros Piton and Petit Piton are a World Heritage Site!" },
                    { q: "What is the capital of St. Lucia?", options: ["Vieux Fort", "Castries", "Soufriere", "Gros Islet"], a: 1, fact: "Castries has a colorful and historic central market!" },
                    { q: "What color is the large triangle on the St. Lucian flag?", options: ["Red", "Blue", "Yellow & Black", "Green"], a: 2, fact: "The black and yellow triangles represent the Pitons rising from the sea!" }
                ]
            },
            {
                id: 2, name: "Explorer", timeMs: 15000,
                questions: [
                    { q: "What is the nickname for St. Lucia based on its colonial history?", options: ["Spice Isle", "Helen of the West", "Nature Isle", "Pearl of the Antilles"], a: 1, fact: "It was called Helen of the West because the British and French fought over it so often!" },
                    { q: "What is the national bird of St. Lucia?", options: ["Doctor Bird", "St. Lucia Parrot (Jacquot)", "Scarlet Ibis", "Pelican"], a: 1, fact: "The Jacquot is brightly colored and endemic to the island." },
                    { q: "St. Lucia claims to have the world's only 'drive-in' what?", options: ["Volcano", "Cinema", "Waterfall", "Coral Reef"], a: 0, fact: "Sulphur Springs is a dormant volcano with bubbling mud baths!" }
                ]
            },
            {
                id: 3, name: "Legend", timeMs: 10000,
                questions: [
                    { q: "What French Creole language is widely spoken in St. Lucia?", options: ["Papiamento", "Kwéyòl (Patois)", "Haitian Creole", "Sranan Tongo"], a: 1, fact: "It is a blend of French vocabulary with West African syntax." },
                    { q: "St. Lucia has the most Nobel Prize winners per capita. How many do they have?", options: ["One", "Two", "Three", "Four"], a: 1, fact: "Sir Arthur Lewis (Economics) and Derek Walcott (Literature)." },
                    { q: "In what year did St. Lucia gain independence?", options: ["1979", "1962", "1966", "1981"], a: 0, fact: "February 22, 1979." }
                ]
            }
        ]
    },
    {
        id: 'bahamas',
        name: 'The Bahamas',
        flag: '🇧🇸',
        color: 'from-cyan-400 to-yellow-300',
        description: '700 Islands of Paradise',
        levels: [
            {
                id: 1, name: "Tourist", timeMs: 0,
                questions: [
                    { q: "What unusual animal swims in the sea in the Exumas?", options: ["Pigs", "Cats", "Dogs", "Horses"], a: 0, fact: "The swimming pigs of Pig Beach are world famous!" },
                    { q: "What is the capital city of The Bahamas?", options: ["Freeport", "Nassau", "Andros", "Bimini"], a: 1, fact: "Nassau is located on the island of New Providence!" },
                    { q: "What currency is officially used alongside the US dollar?", options: ["Bahamian Dollar", "Euro", "Pound", "Eastern Caribbean Dollar"], a: 0, fact: "The Bahamian dollar is pegged 1-to-1 with the US dollar." }
                ]
            },
            {
                id: 2, name: "Explorer", timeMs: 15000,
                questions: [
                    { q: "What is the spectacular street festival held on Boxing Day and New Year's?", options: ["Junkanoo", "Crop Over", "Carnival", "Mashramani"], a: 0, fact: "Junkanoo features elaborately costumed dancers and goat-skin drums!" },
                    { q: "What is the famous marine sinkhole located on Long Island?", options: ["The Great Blue Hole", "Dean's Blue Hole", "Mystic Cavern", "Underwater Cave"], a: 1, fact: "Dean's Blue Hole is one of the deepest known aquatic sinkholes!" },
                    { q: "A staple in Bahamian diet, what type of animal is a 'Conch'?", options: ["A sea turtle", "A large sea snail", "A deep water fish", "A crab"], a: 1, fact: "Conch salad, conch fritters, and cracked conch are delicious!" }
                ]
            },
            {
                id: 3, name: "Legend", timeMs: 10000,
                questions: [
                    { q: "Approximately how many islands and cays make up The Bahamas?", options: ["100", "300", "Over 700", "Over 2000"], a: 2, fact: "There are over 700 islands, but only about 30 are inhabited!" },
                    { q: "What is the national bird of The Bahamas?", options: ["Flamingo", "Parrot", "Pelican", "Seagull"], a: 0, fact: "The West Indian Flamingo is incredibly pink and majestic." },
                    { q: "In what year did The Bahamas achieve independence?", options: ["1962", "1973", "1981", "1990"], a: 1, fact: "July 10, 1973, independent from the United Kingdom." }
                ]
            }
        ]
    }
];

export default function IslandTrivia({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();

    const [view, setView] = useState<'map' | 'level_select' | 'game' | 'complete'>('map');
    const [selectedIsland, setSelectedIsland] = useState<IslandData | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
    const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>({});

    // Game State
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Hydrate local storage progression
    useEffect(() => {
        const initialUnlocks: Record<string, number> = {};
        ISLANDS.forEach(island => {
            const saved = localStorage.getItem(`trivia_unlocked_${island.id}`);
            initialUnlocks[island.id] = saved ? parseInt(saved, 10) : 1;
        });
        setUnlockedLevels(initialUnlocks);
    }, []);

    // Timer Effect
    useEffect(() => {
        if (view !== 'game' || timeLeft === null || showResult) return;

        if (timeLeft <= 0) {
            handleAnswer(-1); // Timeout yields wrong answer
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev! - 50);
        }, 50);

        return () => clearTimeout(timer);
    }, [timeLeft, view, showResult]);

    // -- ACTIONS --
    const clickIsland = (island: IslandData) => {
        setSelectedIsland(island);
        setView('level_select');
    };

    const startLevel = (level: LevelData) => {
        setSelectedLevel(level);
        setQIndex(0);
        setScore(0);
        setStreak(0);
        setShowResult(false);
        setSelectedOption(null);
        if (level.timeMs > 0) setTimeLeft(level.timeMs);
        else setTimeLeft(null);
        setView('game');
    };

    const handleAnswer = (optionIndex: number) => {
        if (!selectedLevel || showResult) return;

        const question = selectedLevel.questions[qIndex];
        const correct = optionIndex === question.a;

        setSelectedOption(optionIndex);
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            // Give time bonus if applicable
            let timeBonus = 0;
            if (timeLeft !== null && timeLeft > 0) {
                timeBonus = Math.floor((timeLeft / selectedLevel.timeMs) * 50);
            }

            setScore(prev => prev + 100 + (streak * 20) + timeBonus);
            setStreak(prev => prev + 1);
            if (streak > 0 && streak % 2 === 0) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (!selectedLevel) return;

        if (qIndex < selectedLevel.questions.length - 1) {
            setQIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedOption(null);

            // Reset timer
            if (selectedLevel.timeMs > 0) setTimeLeft(selectedLevel.timeMs);
            else setTimeLeft(null);

        } else {
            // Level Complete
            finishLevel();
        }
    };

    const finishLevel = () => {
        if (!selectedIsland || !selectedLevel) return;

        // Unlock next
        const nextLevelId = selectedLevel.id + 1;
        const currentUnlock = unlockedLevels[selectedIsland.id] || 1;

        if (nextLevelId > currentUnlock && nextLevelId <= selectedIsland.levels.length) {
            const newUnlocks = { ...unlockedLevels, [selectedIsland.id]: nextLevelId };
            setUnlockedLevels(newUnlocks);
            localStorage.setItem(`trivia_unlocked_${selectedIsland.id}`, nextLevelId.toString());
        }

        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setView('complete');

        if (onComplete) {
            onComplete(score, qIndex + 1, selectedLevel.questions.length);
        }
    };

    const returnToMap = () => {
        setView('map');
        setSelectedIsland(null);
        setSelectedLevel(null);
    };

    const returnToLevelSelect = () => {
        setView('level_select');
        setSelectedLevel(null);
    };

    // -- RENDERERS --

    if (view === 'map') {
        return (
            <div className="h-full bg-sky-900 rounded-[3rem] overflow-hidden relative flex flex-col shadow-2xl border-4 border-sky-800">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>

                <header className="relative z-10 p-8 text-center bg-black/20 backdrop-blur-sm border-b border-white/10">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center justify-center gap-4">
                        <Map className="text-amber-400 w-10 h-10" />
                        Island Trivia Master
                    </h1>
                    <p className="text-sky-200 font-bold uppercase tracking-widest text-sm">Select a nation to test your knowledge.</p>
                </header>

                <div className="relative z-10 flex-1 overflow-y-auto p-8 no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {ISLANDS.map((island) => {
                            const unlockLevel = unlockedLevels[island.id] || 1;
                            const isMastered = unlockLevel > island.levels.length;

                            return (
                                <button
                                    key={island.id}
                                    onClick={() => clickIsland(island)}
                                    className={`group relative h-56 rounded-[2.5rem] p-6 text-left transition-all hover:scale-[1.03] hover:shadow-2xl hover:z-20 overflow-hidden ${isMastered ? 'bg-gradient-to-br from-indigo-900 to-sky-900 ring-4 ring-yellow-400' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${island.color} opacity-20 group-hover:opacity-40 transition-opacity`} />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <span className="text-6xl drop-shadow-2xl">{island.flag}</span>
                                            {isMastered ? (
                                                <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg">
                                                    <Crown size={24} />
                                                </div>
                                            ) : (
                                                <div className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm">
                                                    <Play size={20} className="ml-0.5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-black text-white mb-1 group-hover:translate-x-1 transition-transform truncate">{island.name}</h3>
                                            <div className="flex justify-between items-center">
                                                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{island.description}</p>
                                                {!isMastered && (
                                                    <span className="bg-black/30 px-2 py-1 rounded-lg text-xs font-black text-white backdrop-blur-sm">Lvl {unlockLevel}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <footer className="p-6 text-center text-white/40 font-bold uppercase tracking-widest text-sm relative z-10 border-t border-white/5">
                    <button onClick={() => router.push('/portal/games')} className="hover:text-white transition-colors flex items-center gap-2 mx-auto bg-white/5 px-6 py-3 rounded-full hover:bg-white/10">
                        <ArrowLeft size={16} /> Exit to Hub
                    </button>
                </footer>
            </div>
        );
    }

    if (view === 'level_select' && selectedIsland) {
        const unlockLevel = unlockedLevels[selectedIsland.id] || 1;

        return (
            <div className={`h-full bg-gradient-to-br ${selectedIsland.color} rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative p-8`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

                <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <span className="text-7xl mb-4 inline-block drop-shadow-2xl">{selectedIsland.flag}</span>
                        <h2 className="text-5xl font-black text-white drop-shadow-lg mb-2">{selectedIsland.name}</h2>
                        <p className="text-xl text-white/80 font-bold">{selectedIsland.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {selectedIsland.levels.map(level => {
                            const isUnlocked = level.id <= unlockLevel;
                            return (
                                <button
                                    key={level.id}
                                    disabled={!isUnlocked}
                                    onClick={() => startLevel(level)}
                                    className={`relative p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-4 transition-all ${isUnlocked
                                            ? 'bg-white/10 border-white text-white hover:bg-white/20 hover:scale-105 shadow-2xl backdrop-blur-md'
                                            : 'bg-black/40 border-white/10 text-white/40 cursor-not-allowed backdrop-blur-sm'
                                        }`}
                                >
                                    {isUnlocked ? <Unlock size={32} className="text-yellow-300" /> : <Lock size={32} className="text-white/20" />}
                                    <div className="text-center">
                                        <div className="font-black text-3xl mb-1">Level {level.id}</div>
                                        <div className="text-sm uppercase tracking-widest font-black text-yellow-300 opacity-90 mb-3">{level.name}</div>
                                        <div className="flex gap-2 justify-center">
                                            <span className="bg-black/30 px-3 py-1 rounded-lg text-xs font-bold">{level.questions.length} Qs</span>
                                            {level.timeMs > 0 && <span className="bg-red-500/30 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Clock size={12} /> {(level.timeMs / 1000)}s</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={returnToMap} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-colors">
                            <ArrowLeft size={18} /> Back to Map
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'game' && selectedIsland && selectedLevel) {
        const question = selectedLevel.questions[qIndex];
        const progress = ((qIndex) / selectedLevel.questions.length) * 100;
        const progressPercentage = timeLeft !== null ? (timeLeft / selectedLevel.timeMs) * 100 : 100;

        return (
            <div className="h-full bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col relative border-4 border-slate-700">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedIsland.color} opacity-10`} />

                {/* Header */}
                <div className="relative z-10 p-6 md:p-8 flex justify-between items-center bg-black/20 border-b border-white/5">
                    <button title="Go Back" aria-label="Go Back" onClick={returnToLevelSelect} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors">
                        <ArrowLeft />
                    </button>
                    <div className="flex flex-col items-center flex-1 mx-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{selectedIsland.flag}</span>
                            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest hidden sm:block">
                                Lvl {selectedLevel.id}: {selectedLevel.name}
                            </h2>
                        </div>
                        <div className="w-full max-w-sm h-3 bg-black/40 rounded-full mt-3 overflow-hidden border border-white/10">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Question {qIndex + 1} of {selectedLevel.questions.length}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 rounded-xl text-yellow-400 font-black border border-yellow-500/30">
                        <Star size={18} /> {score}
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 max-w-5xl mx-auto w-full overflow-y-auto no-scrollbar">

                    {/* Timer Bar */}
                    {selectedLevel.timeMs > 0 && !showResult && (
                        <div className="w-full max-w-xl mx-auto mb-6">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${progressPercentage > 50 ? 'bg-green-500' : progressPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                    layout
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={qIndex}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="w-full"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] text-center mb-8 shadow-2xl">
                                <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-6">
                                    {question.q}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {question.options.map((opt: string, i: number) => {
                                    let stateStyle = "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-500";
                                    if (showResult) {
                                        if (i === question.a) stateStyle = "bg-green-500 border-green-400 text-white shadow-xl shadow-green-500/30 scale-105 z-10";
                                        else if (i === selectedOption) stateStyle = "bg-red-500 border-red-400 text-white opacity-60";
                                        else stateStyle = "bg-black/40 border-transparent text-white/30";
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={showResult}
                                            onClick={() => handleAnswer(i)}
                                            className={`p-5 md:p-6 rounded-[2rem] border-4 font-bold text-lg md:text-xl transition-all duration-300 active:scale-95 ${stateStyle}`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer / Results Container (Takes up fixed space so UI doesn't jump heavily) */}
                <div className="min-h-[140px] p-6 flex justify-center items-start relative z-20">
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`w-full max-w-3xl p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-4 ${isCorrect ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-400' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-4 border-red-400'}`}
                            >
                                <div className="text-center md:text-left flex-1">
                                    <p className="font-black text-2xl mb-1 flex items-center justify-center md:justify-start gap-2">
                                        {isCorrect ? <><CheckCircle2 size={28} /> Correct! +{Math.floor(100 + (streak * 20) + (timeLeft !== null ? (timeLeft / selectedLevel.timeMs) * 50 : 0))}</> : selectedOption === -1 ? <><Clock size={28} /> Out of Time!</> : 'Oops! Nice try!'}
                                    </p>
                                    <p className="font-bold bg-black/20 p-3 rounded-xl mt-2 text-sm">{question.fact}</p>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className={`px-10 py-5 rounded-2xl font-black text-white shadow-xl flex items-center gap-2 hover:scale-105 transition-transform w-full md:w-auto justify-center ${isCorrect ? 'bg-green-800' : 'bg-red-800'}`}
                                >
                                    Continue <ChevronRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    if (view === 'complete' && selectedIsland && selectedLevel) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden text-balance border border-indigo-500/30">
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedIsland.color} opacity-10`}></div>

                <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                    <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(250,204,21,0.4)] mb-6 animate-bounce">
                        <Trophy size={60} className="text-yellow-800" />
                    </div>

                    <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">{selectedIsland.name}</h2>
                    <p className="text-2xl text-indigo-200 mb-8 font-bold">Level {selectedLevel.id} Mastered!</p>

                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 mb-8 w-full">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                            <span className="text-white/60 font-black uppercase tracking-widest text-sm">Level Score</span>
                            <span className="text-4xl font-black text-yellow-400">{score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/60 font-black uppercase tracking-widest text-sm">Max Streak</span>
                            <span className="text-2xl font-black text-orange-400 flex items-center gap-1"><Zap size={20} /> {streak}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={returnToLevelSelect}
                            className="flex-1 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
                        >
                            Next Level
                        </button>
                        <button
                            onClick={returnToMap}
                            className="flex-1 py-5 bg-white/10 border-2 border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-colors"
                        >
                            Map
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
