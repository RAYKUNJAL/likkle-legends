"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Lightbulb, CheckCircle2, XCircle, Target, MapPin, Star, Unlock, Lock, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

type Pair = {
    id?: string;
    patois: string;
    english: string;
    hint: string;
    example: string;
};

const VOCABULARY: Record<string, Pair[]> = {
    'Jamaica': [
        { patois: 'Pickney', english: 'Child', hint: 'A young person', example: 'The pickney is reading a story.' },
        { patois: 'Wha Gwan', english: "What's up?", hint: 'A greeting', example: 'Wha gwan, friend?' },
        { patois: 'Big Up', english: 'Respect', hint: 'Showing appreciation', example: 'Big up to your teacher.' },
        { patois: 'Irie', english: 'Alright/Good', hint: 'Everything is fine', example: 'Today is irie and sunny.' },
        { patois: 'Likkle', english: 'Little', hint: 'Small in size', example: 'I found a likkle shell.' },
        { patois: 'Tallawah', english: 'Strong', hint: 'Mighty despite size', example: 'She is likkle but tallawah.' },
        { patois: 'Bashment', english: 'Party', hint: 'A really good time', example: 'The bashment starts tonight.' },
        { patois: 'Bredren', english: 'Friend', hint: 'A close male buddy', example: 'My bredren helped me study.' },
        { patois: 'Nyam', english: 'Eat', hint: 'To consume food', example: 'Time to nyam lunch.' },
        { patois: 'Duppy', english: 'Ghost', hint: 'A spirit story word', example: 'The story had a friendly duppy.' },
        { patois: 'Yard', english: 'Home', hint: 'House or home country', example: 'We are going back to yard.' },
        { patois: 'Vex', english: 'Angry', hint: 'Upset about something', example: 'Do not stay vex, take a breath.' },
        { patois: 'Bocootoo', english: 'Large/Plenty', hint: 'A lot of something', example: 'He caught a bocootoo fish.' },
        { patois: 'Fass', english: 'Nosy', hint: 'Getting into others business', example: 'Stop being so fass.' },
        { patois: 'Gully', english: 'Drain/Gutter', hint: 'Where rainwater goes', example: 'The ball rolled into the gully.' },
        { patois: 'Mash up', english: 'Destroyed', hint: 'Not working anymore', example: 'The toy is mash up.' },
        { patois: 'Gyal', english: 'Girl', hint: 'A young female', example: 'The likkle gyal is playing.' },
        { patois: 'Rass', english: 'Wow!', hint: 'Expression of surprise', example: 'Rass! Look at that bird.' },
        { patois: 'Puss', english: 'Cat', hint: 'A feline pet', example: 'The puss is sleeping.' },
        { patois: 'Dawg', english: 'Dog/Friend', hint: 'A canine or a loyal mate', example: "What's up, my dawg?" }
    ],
    'Trinidad & Tobago': [
        { patois: 'Lime', english: 'Hang out', hint: 'Chilling with friends', example: 'We are going for a lime.' },
        { patois: 'Wine', english: 'Dance', hint: 'Moving to music', example: 'Everybody began to wine.' },
        { patois: 'Vex', english: 'Angry', hint: 'Upset at someone', example: 'She is getting vex.' },
        { patois: 'Bacchanal', english: 'Drama', hint: 'A lot of confusion', example: 'Too much bacchanal at the party.' },
        { patois: 'Dingolay', english: 'Dance happily', hint: 'Moving with joy', example: 'Watch him dingolay to the calypso.' },
        { patois: 'Macofocious', english: 'Nosy', hint: 'Always prying', example: "Don't be so macofocious!" },
        { patois: 'Tabanca', english: 'Heartbreak', hint: 'Sadness over love', example: 'He has a bad tabanca.' },
        { patois: 'Wajang', english: 'Rowdy person', hint: 'Loud and unruly', example: 'Stop behaving like a wajang.' },
        { patois: 'Fete', english: 'Party', hint: 'A massive celebration', example: 'We are matching to the fete.' },
        { patois: 'Jouvay', english: 'Pre-dawn carnival', hint: 'Early morning festival', example: 'Jouvay morning is messy.' },
        { patois: 'Mamaguy', english: 'Tease/Flatter', hint: 'Trying to fool someone', example: 'Are you trying to mamaguy me?' },
        { patois: 'Picong', english: 'Playful teasing', hint: 'Making light fun of', example: 'It was just a little picong.' },
        { patois: 'Pompek', english: 'Small dog', hint: 'A tiny noisy puppy', example: 'The pompek won\'t stop barking.' },
        { patois: 'Steups', english: 'Suck teeth', hint: 'A sound of annoyance', example: 'He gave a loud steups.' },
        { patois: 'Zesser', english: 'Show-off', hint: 'Someone dressing flashy', example: 'Look at the zesser over there.' },
        { patois: 'Gyul', english: 'Girl', hint: 'A young woman', example: 'That gyul is studying hard.' },
        { patois: 'Hoss', english: 'Friend', hint: 'Close buddy', example: 'What\'s going on, hoss?' },
        { patois: 'Lagia', english: 'Kite', hint: 'Flies in the wind', example: 'Flying the lagia in the savannah.' },
        { patois: 'Obzokee', english: 'Awkward', hint: 'Looking out of place', example: 'That shirt looks obzokee.' },
        { patois: 'Planasse', english: 'Warning slap', hint: 'Hit with flat cutlass', example: 'He got a planasse for stealing.' }
    ],
    'Barbados': [
        { patois: 'Bajan', english: 'Barbadian', hint: 'Someone from Barbados', example: 'I am a proud Bajan.' },
        { patois: 'Wunna', english: 'You all', hint: 'Plural for you', example: 'What are wunna doing?' },
        { patois: 'Cheese on bread', english: 'Wow!', hint: 'An expression of amazement', example: 'Cheese on bread, that is big!' },
        { patois: 'Dea', english: 'There', hint: 'A location', example: 'Put the bag over dea.' },
        { patois: 'Fuh true', english: 'Really', hint: 'Is that a fact?', example: 'You saw a turtle fuh true?' },
        { patois: 'Pompasett', english: 'Show off', hint: 'Strutting around proudly', example: 'Look at her pompasett.' },
        { patois: 'Sea-bath', english: 'Swim in the ocean', hint: 'Going to the beach', example: 'We are taking a sea-bath.' },
        { patois: 'Cuh-dear', english: 'Oh my', hint: 'Expression of sympathy', example: 'Cuh-dear, you dropped your ice cream.' },
        { patois: 'Evah-since', english: 'Long ago', hint: 'A long time passed', example: 'Evah-since, we walked to school.' },
        { patois: 'Fowl-cock', english: 'Rooster', hint: 'A male chicken', example: 'The fowl-cock wakes everyone up.' },
        { patois: 'Guttah', english: 'Gutter', hint: 'Drain by the road', example: 'The ball went in the guttah.' },
        { patois: 'Hard-ears', english: 'Stubborn', hint: 'Not listening', example: 'He is a hard-ears boy.' },
        { patois: 'Mawga', english: 'Skinny', hint: 'Very thin', example: 'That cat is too mawga.' },
        { patois: 'Nuff', english: 'Plenty', hint: 'A lot of something', example: 'We have nuff food.' },
        { patois: 'Out', english: 'Turn off', hint: 'Extinguish', example: 'Out the light before sleeping.' },
        { patois: 'Pelican', english: 'Bird', hint: 'Water bird with big beak', example: 'The pelican dived for fish.' },
        { patois: 'Shop', english: 'Store', hint: 'Local convenience spot', example: 'Go to the shop for bread.' },
        { patois: 'Ting', english: 'Thing', hint: 'An object', example: 'What is that ting?' },
        { patois: 'Vex', english: 'Angry', hint: 'Mad about something', example: 'Mom is vex with you.' },
        { patois: 'Wata', english: 'Water', hint: 'Liquid you drink', example: 'Drink enough wata today.' }
    ],
    'Guyana': [
        { patois: 'Banna', english: 'Friend', hint: 'A familiar man', example: 'He is a good banna.' },
        { patois: 'Gyff', english: 'Gossip', hint: 'Talking a lot', example: 'We were having a good gyff.' },
        { patois: 'Skunt', english: 'Nonsense', hint: 'Foolishness', example: 'Stop talking skunt.' },
        { patois: 'Bannas', english: 'Group of guys', hint: 'Friends', example: 'The bannas are playing cricket.' },
        { patois: 'Passa passa', english: 'Rumor', hint: 'Hearing stories', example: 'Don\'t mind the passa passa.' },
        { patois: 'Tass', english: 'Ignore', hint: 'Push aside', example: 'Just tass that idea away.' },
        { patois: 'Wam', english: 'What\'s happening?', hint: 'Asking what is wrong', example: 'Wam to you today?' },
        { patois: 'Bake', english: 'Fried dough', hint: 'A breakfast food', example: 'Eating bake and saltfish.' },
        { patois: 'Buck', english: 'Indigenous person', hint: 'Native Guyanese', example: 'He is from a buck village.' },
        { patois: 'Channa', english: 'Chickpeas', hint: 'A type of bean', example: 'We cooked channa and potato.' },
        { patois: 'Cutters', english: 'Snacks', hint: 'Food eaten while drinking', example: 'Bring out the cutters.' },
        { patois: 'Dem', english: 'Them', hint: 'Those people', example: 'Look at dem running.' },
        { patois: 'Fine', english: 'Skinny', hint: 'Not thick', example: 'She has fine hair.' },
        { patois: 'Gaff', english: 'Conversation', hint: 'A long talk', example: 'We had a nice gaff on the phone.' },
        { patois: 'Junction', english: 'Crossroads', hint: 'Where streets meet', example: 'Meet me at the junction.' },
        { patois: 'Mashramani', english: 'Festival', hint: 'Republic celebration', example: 'We celebrate Mashramani in February.' },
        { patois: 'Salaru', english: 'Salty', hint: 'Too much salt', example: 'This food is too salaru.' },
        { patois: 'Trench', english: 'Trench / Canal', hint: 'Waterway', example: 'The trench is full of water.' },
        { patois: 'Vex', english: 'Angry', hint: 'Not happy', example: 'Why are you vex?' },
        { patois: 'Wata', english: 'Water', hint: 'H2O', example: 'Drink wata.' }
    ],
    'Bahamas': [
        { patois: 'Conch', english: 'Sea snail', hint: 'A popular seafood', example: 'We had conch salad.' },
        { patois: 'Potcake', english: 'Street dog', hint: 'A mixed breed dog', example: 'The potcake followed us home.' },
        { patois: 'Switcha', english: 'Lemonade', hint: 'A refreshing lime drink', example: 'Drink some cold switcha.' },
        { patois: 'Bey', english: 'Boy', hint: 'A term for a male', example: 'What you doing, bey?' },
        { patois: 'Mudda sick', english: 'Wow!', hint: 'Expression of surprise', example: 'Mudda sick, that is fast.' },
        { patois: 'Burnt', english: 'Embarrassed', hint: 'Making a fool of yourself', example: 'He got totally burnt on that joke.' },
        { patois: 'Duff', english: 'Dessert', hint: 'Guava pastry', example: 'Guava duff is sweet.' },
        { patois: 'Tingum', english: 'Whatchamacallit', hint: 'When you forget a name', example: 'Pass me the tingum over there.' },
        { patois: 'Vex', english: 'Angry', hint: 'Upset', example: 'She is very vex today.' },
        { patois: 'Wata', english: 'Water', hint: 'Liquid', example: 'Clear wata in the sea.' },
        { patois: 'Boonce', english: 'Leave', hint: 'To go away quickly', example: 'I had to boonce early.' },
        { patois: 'Gussy', english: 'Dress up', hint: 'Looking fancy', example: 'She put on her gussy dress.' },
        { patois: 'Jook', english: 'Stab', hint: 'Pricking with something sharp', example: 'I jook my finger with a needle.' },
        { patois: 'Nuttin', english: 'Nothing', hint: 'Zero', example: 'I have nuttin to do.' },
        { patois: 'Obeah', english: 'Magic', hint: 'Folk magic', example: 'Some believe in obeah.' },
        { patois: 'Pine', english: 'Pineapple', hint: 'Tropical fruit', example: 'Eleuthera grows sweet pine.' },
        { patois: 'Rake n Scrape', english: 'Bahamian music', hint: 'Traditional tunes', example: 'We danced to rake n scrape.' },
        { patois: 'Souse', english: 'Meat soup', hint: 'A boiled breakfast dish', example: 'Chicken souse for breakfast.' },
        { patois: 'Tuck', english: 'Tired', hint: 'Exhausted', example: 'I am completely tuck out.' },
        { patois: 'Wutless', english: 'Worthless', hint: 'Irresponsible', example: 'Stop acting wutless.' }
    ]
};

const ISLANDS = Object.keys(VOCABULARY);

const LEVELS = [
    { num: 1, pairs: 4, name: "Beginner" },
    { num: 2, pairs: 6, name: "Apprentice" },
    { num: 3, pairs: 8, name: "Explorer" },
    { num: 4, pairs: 10, name: "Scholar" },
    { num: 5, pairs: 12, name: "Legend" },
];

type Choice = { id: string; text: string };

export default function PatoisWizard({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const [gameState, setGameState] = useState<'island_select' | 'level_select' | 'playing' | 'complete'>('island_select');

    const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>({});

    const [roundPairs, setRoundPairs] = useState<Pair[]>([]);
    const [leftCol, setLeftCol] = useState<Choice[]>([]);
    const [rightCol, setRightCol] = useState<Choice[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeHint, setActiveHint] = useState<string>('Match each word to its meaning.');

    useEffect(() => {
        // Init level unlocks per island
        const initialUnlocks: Record<string, number> = {};
        ISLANDS.forEach(i => {
            const saved = localStorage.getItem(`patois_unlocked_${i}`);
            initialUnlocks[i] = saved ? parseInt(saved, 10) : 1;
        });
        setUnlockedLevels(initialUnlocks);
    }, []);

    const accuracy = useMemo(() => {
        if (attempts === 0) return 100;
        return Math.round((matchedIds.length / attempts) * 100);
    }, [attempts, matchedIds.length]);

    const handleSelectIsland = (island: string) => {
        setSelectedIsland(island);
        setGameState('level_select');
    };

    const startGame = (levelNum: number) => {
        if (!selectedIsland) return;
        const levelData = LEVELS.find(l => l.num === levelNum)!;

        // Randomly pick unique words for this level
        const possibleWords = VOCABULARY[selectedIsland];
        const chosenCount = Math.min(levelData.pairs, possibleWords.length);
        const shuffled = [...possibleWords].sort(() => Math.random() - 0.5).slice(0, chosenCount);

        const mappedPairs = shuffled.map(p => ({
            ...p,
            id: p.patois + '-' + Math.random().toString(36).substr(2, 5)
        }));

        setRoundPairs(mappedPairs);
        setLeftCol(mappedPairs.map((p) => ({ id: p.id!, text: p.patois })).sort(() => Math.random() - 0.5));
        setRightCol(mappedPairs.map((p) => ({ id: p.id!, text: p.english })).sort(() => Math.random() - 0.5));

        setMatchedIds([]);
        setScore(0);
        setStreak(0);
        setAttempts(0);
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedback(null);
        setActiveHint('Find the matching words to learn!');
        setCurrentLevel(levelNum);
        setGameState('playing');
    };

    const evaluateMatch = (leftId: string, rightId: string) => {
        const pair = roundPairs.find((p) => p.id === leftId);
        setAttempts((prev) => prev + 1);

        if (leftId === rightId) {
            const bonus = streak * 10;
            const earned = 100 + bonus;
            const nextMatched = matchedIds.length + 1;

            setMatchedIds((prev) => [...prev, leftId]);
            setScore((prev) => prev + earned);
            setStreak((prev) => prev + 1);
            setFeedback({
                type: 'success',
                text: `${pair?.patois} = ${pair?.english}. ${pair?.example || ''}`,
            });
            setActiveHint(pair?.hint || 'Great match.');
            confetti({ particleCount: 20, spread: 35, origin: { y: 0.6 } });

            if (nextMatched === roundPairs.length) {
                // Game Won
                setTimeout(() => {
                    handleLevelComplete(score + earned, nextMatched, roundPairs.length);
                }, 700);
            }
        } else {
            setStreak(0);
            setFeedback({
                type: 'error',
                text: `Not quite! Hint: ${pair?.hint || 'Try another pair.'}`,
            });
            setActiveHint(pair?.hint || 'Try another meaning.');
        }

        setTimeout(() => {
            setSelectedLeft(null);
            setSelectedRight(null);
        }, 500);
    };

    const handleSelect = (id: string, side: 'left' | 'right') => {
        if (matchedIds.includes(id)) return;

        const newLeft = side === 'left' ? id : selectedLeft;
        const newRight = side === 'right' ? id : selectedRight;

        if (side === 'left') setSelectedLeft(id);
        if (side === 'right') setSelectedRight(id);

        if (newLeft && newRight) {
            evaluateMatch(newLeft, newRight);
        }
    };

    const handleLevelComplete = (finalScore: number, correct: number, total: number) => {
        // Unlock next level
        if (selectedIsland) {
            const nextLevel = currentLevel + 1;
            const maxUnlocked = unlockedLevels[selectedIsland] || 1;

            if (nextLevel > maxUnlocked && nextLevel <= LEVELS.length) {
                const newUnlocks = { ...unlockedLevels, [selectedIsland]: nextLevel };
                setUnlockedLevels(newUnlocks);
                localStorage.setItem(`patois_unlocked_${selectedIsland}`, nextLevel.toString());
            }
        }

        setGameState('complete');
        if (onComplete) onComplete(finalScore, correct, total);
    };

    // ------------- RENDER STATES -------------

    if (gameState === 'island_select') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-3xl w-full text-slate-900 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight flex items-center justify-center gap-3">
                        <Globe className="text-purple-500 w-10 h-10" />
                        Patois Word Wizard
                    </h1>
                    <p className="text-slate-500 mb-8 font-bold text-lg">Select an island to learn their local dialect!</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {ISLANDS.map(island => (
                            <button
                                key={island}
                                onClick={() => handleSelectIsland(island)}
                                className="py-6 px-4 bg-purple-50 text-purple-900 border-2 border-purple-100 rounded-3xl font-black text-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col items-center gap-2"
                            >
                                <MapPin size={24} />
                                {island}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/portal/games')}
                        className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 uppercase tracking-widest text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Arcade
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'level_select') {
        const islandUnlocks = selectedIsland ? (unlockedLevels[selectedIsland] || 1) : 1;

        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden">
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-4xl w-full text-slate-900 relative z-10">
                    <div className="mb-8">
                        <span className="bg-fuchsia-100 text-fuchsia-700 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-4 inline-block">{selectedIsland} Dictionary</span>
                        <h2 className="text-4xl font-black tracking-tight">Select a Level</h2>
                        <p className="text-slate-500 mt-2 font-bold">Master words to unlock harder challenges.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {LEVELS.map(level => {
                            const isUnlocked = level.num <= islandUnlocks;
                            return (
                                <button
                                    key={level.num}
                                    disabled={!isUnlocked}
                                    onClick={() => startGame(level.num)}
                                    className={`relative p-6 rounded-3xl flex flex-col items-center justify-center gap-3 border-4 transition-all ${isUnlocked
                                        ? 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-900 hover:border-fuchsia-500 hover:shadow-lg hover:-translate-y-1'
                                        : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed grayscale'
                                        }`}
                                >
                                    {isUnlocked ? <Unlock className="text-fuchsia-500" /> : <Lock className="text-slate-300" />}
                                    <div className="text-center">
                                        <div className="font-black text-2xl">Lvl {level.num}</div>
                                        <div className="text-xs uppercase tracking-widest font-bold opacity-60 mt-1">{level.name}</div>
                                        <div className="text-xs opacity-50 mt-1">{level.pairs} Pairs</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setGameState('island_select')}
                        className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 uppercase tracking-widest text-sm"
                    >
                        <ArrowLeft size={16} /> Change Island
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        const currentLevelData = LEVELS.find(l => l.num === currentLevel);

        return (
            <div className="h-full bg-slate-100 rounded-[3rem] p-6 md:p-8 flex flex-col overflow-hidden relative shadow-inner border-[12px] border-white">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setGameState('level_select')}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
                        aria-label="Back to Levels"
                        title="Back to Levels"
                    >
                        <ArrowLeft color="black" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">{selectedIsland}</span>
                        <span className="font-black text-slate-800 text-sm md:text-base border-l-2 border-slate-200 pl-2">Level {currentLevel}: {currentLevelData?.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm md:text-base">
                        <div className="font-black text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                            <Trophy size={16} /> {score}
                        </div>
                        <div className="font-black text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                            <Target size={16} /> {accuracy}%
                        </div>
                    </div>
                </div>

                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                    <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Lightbulb size={20} /></div>
                    <div>
                        <p className="font-black text-amber-700 text-[10px] uppercase tracking-widest mb-1">Learning Tip</p>
                        <p className="font-bold text-amber-900 text-sm">{activeHint}</p>
                    </div>
                </div>

                {feedback && (
                    <div className={`mb-4 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {feedback.type === 'success' ? <CheckCircle2 size={24} className="text-green-500" /> : <XCircle size={24} className="text-red-500" />}
                        <p className="font-bold">{feedback.text}</p>
                    </div>
                )}

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto w-full items-start overflow-y-auto no-scrollbar py-2">
                    <div className="space-y-3">
                        <p className="text-center font-black text-purple-700 uppercase tracking-[0.2em] text-xs mb-4">Patois Word</p>
                        {leftCol.map((item) => {
                            const isSelected = selectedLeft === item.id;
                            const isMatched = matchedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'left')}
                                    className={`w-full p-4 md:p-5 rounded-2xl font-bold text-base md:text-lg shadow-sm transition-all border-4 ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-50 scale-95' : isSelected ? 'bg-purple-900 text-white border-purple-900 scale-105 shadow-xl' : 'bg-white text-slate-800 border-white hover:border-purple-200 hover:shadow-md'}`}
                                >
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        <p className="text-center font-black text-blue-700 uppercase tracking-[0.2em] text-xs mb-4">English Meaning</p>
                        {rightCol.map((item) => {
                            const isSelected = selectedRight === item.id;
                            const isMatched = matchedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id} // using id since words might duplicate across dictionary
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'right')}
                                    className={`w-full p-4 md:p-5 rounded-2xl font-bold text-base md:text-lg shadow-sm transition-all border-4 ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-50 scale-95' : isSelected ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-xl' : 'bg-white text-slate-800 border-white hover:border-blue-200 hover:shadow-md'}`}
                                >
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center mt-4">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{matchedIds.length} of {roundPairs.length} matches found</span>
                </div>
            </div>
        );
    }

    // Complete State
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden text-balance">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(250,204,21,0.5)] animate-bounce">
                    <Trophy className="w-12 h-12 text-yellow-900" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Legendary!</h2>
                <p className="text-lg text-slate-300 mb-8 font-bold">You mastered Level {currentLevel} of the {selectedIsland} dialect.</p>

                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] mb-10 w-full border border-white/10 shadow-2xl space-y-4">
                    <p className="text-xs font-black opacity-60 uppercase tracking-widest">Final Score</p>
                    <p className="text-7xl font-black text-white drop-shadow-lg">{score}</p>
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
                        <p className="font-bold flex items-center gap-2"><Target size={16} className="text-blue-400" /> {accuracy}% Accuracy</p>
                        <p className="font-bold flex items-center gap-2"><Star size={16} className="text-yellow-400" /> {matchedIds.length} Words</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    {currentLevel < LEVELS.length && (
                        <button
                            onClick={() => startGame(currentLevel + 1)}
                            className="px-8 py-5 w-full sm:w-auto bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                        >
                            Next Level <ArrowLeft className="rotate-180" size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setGameState('level_select')}
                        className="px-8 py-5 w-full sm:w-auto bg-white/10 rounded-2xl font-black text-lg hover:bg-white/20 transition-colors"
                    >
                        Level Select
                    </button>
                    <button
                        onClick={() => router.push('/portal/games')}
                        className="px-8 py-5 w-full sm:w-auto bg-transparent border-2 border-white/20 rounded-2xl font-black text-lg hover:bg-white/10 transition-colors"
                    >
                        Exit Arcade
                    </button>
                </div>
            </div>
        </div>
    );
}
