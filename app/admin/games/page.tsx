"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal,
    FileUpload, ActionButton, EmptyState,
    Gamepad2, Plus, Edit, Trash2, Eye, Sparkles, Wand2, Settings
} from '@/components/admin/AdminComponents';
import { uploadFile, BUCKETS } from '@/lib/storage';
import Image from 'next/image';

interface Game {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    game_url: string;
    game_type: string;
    category: string;
    tier_required: string;
    play_count: number;
    is_active: boolean;
    game_config: GameConfig;
    created_at: string;
}

interface Character {
    id: string;
    name: string;
    image_url: string;
    role: string;
}

interface GameConfig {
    // Trivia config
    questions?: TriviaQuestion[];
    // Memory config
    cards?: MemoryCard[];
    // Word Match config
    wordPairs?: WordPair[];
    // Story Adventure config
    scenes?: StoryScene[];
    // Common
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
    xpReward?: number;
}

interface TriviaQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    funFact: string;
    emoji: string;
    characterId?: string;
}

interface MemoryCard {
    symbol: string;
    name: string;
    characterId?: string;
}

interface WordPair {
    word1: string;
    word2: string;
    hint: string;
}

interface StoryScene {
    id: string;
    narrative: string;
    characterId?: string;
    choices: { text: string; nextSceneId: string }[];
    isEnding: boolean;
}

const GAME_TYPES = [
    { id: 'trivia', label: 'Trivia Quiz', icon: '🧠', description: 'Multiple choice questions' },
    { id: 'memory', label: 'Memory Match', icon: '🎴', description: 'Flip and find matching pairs' },
    { id: 'word-match', label: 'Word Match', icon: '🔤', description: 'Connect related words' },
    { id: 'story', label: 'Story Adventure', icon: '📚', description: 'Choose your own adventure' },
    { id: 'coloring', label: 'Coloring Page', icon: '🎨', description: 'Digital coloring activity' },
];

const CATEGORIES = [
    { id: 'culture', label: 'Caribbean Culture' },
    { id: 'language', label: 'Patois & Language' },
    { id: 'nature', label: 'Island Nature' },
    { id: 'music', label: 'Music & Dance' },
    { id: 'food', label: 'Island Food' },
    { id: 'history', label: 'History & Heritage' },
];

export default function AdminGameBuilderPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        game_url: '',
        game_type: 'trivia',
        category: 'culture',
        tier_required: 'free',
        is_active: true,
    });

    // Game config state
    const [gameConfig, setGameConfig] = useState<GameConfig>({
        difficulty: 'easy',
        xpReward: 100,
        questions: [],
        cards: [],
        wordPairs: [],
        scenes: [],
    });

    // Question builder state
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion>({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        funFact: '',
        emoji: '🌴',
    });

    // Word pair builder state
    const [currentWordPair, setCurrentWordPair] = useState<WordPair>({
        word1: '',
        word2: '',
        hint: '',
    });

    // Card builder state
    const [currentCard, setCurrentCard] = useState<MemoryCard>({
        symbol: '',
        name: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { getAdminGames, getAdminCharacters } = await import('@/app/actions/admin');

            const [gamesData, charsData] = await Promise.all([
                getAdminGames(session.access_token),
                getAdminCharacters(session.access_token)
            ]);
            setGames(gamesData as Game[]);
            setCharacters(charsData as Character[]);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleThumbnailUpload = async (file: File) => {
        const result = await uploadFile('games' as any, file);
        if (result) {
            setFormData(prev => ({ ...prev, thumbnail_url: result.url }));
        }
    };

    const handleSubmit = async () => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { saveAdminGame } = await import('@/app/actions/admin');

            const gameData: any = {
                ...formData,
                game_config: gameConfig,
            };

            if (editingGame) {
                gameData.id = editingGame.id;
            }

            await saveAdminGame(session.access_token, gameData);

            setShowModal(false);
            setEditingGame(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) return;
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { deleteAdminGame } = await import('@/app/actions/admin');
            await deleteAdminGame(session.access_token, id);

            setGames(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            console.error('Failed to delete game:', error);
            alert('Failed to delete game');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            thumbnail_url: '',
            game_url: '',
            game_type: 'trivia',
            category: 'culture',
            tier_required: 'free',
            is_active: true,
        });
        setGameConfig({
            difficulty: 'easy',
            xpReward: 100,
            questions: [],
            cards: [],
            wordPairs: [],
            scenes: [],
        });
        setModalStep(1);
    };

    const openEditModal = (game: Game) => {
        setEditingGame(game);
        setFormData({
            title: game.title,
            description: game.description || '',
            thumbnail_url: game.thumbnail_url || '',
            game_url: game.game_url || '',
            game_type: game.game_type || 'trivia',
            category: game.category,
            tier_required: game.tier_required,
            is_active: game.is_active,
        });
        setGameConfig(game.game_config || {
            difficulty: 'easy',
            xpReward: 100,
            questions: [],
            cards: [],
            wordPairs: [],
            scenes: [],
        });
        setShowModal(true);
    };

    // Add a trivia question
    const addQuestion = () => {
        if (currentQuestion.question && currentQuestion.options.every(o => o.trim())) {
            setGameConfig(prev => ({
                ...prev,
                questions: [...(prev.questions || []), { ...currentQuestion }],
            }));
            setCurrentQuestion({
                question: '',
                options: ['', '', '', ''],
                correctIndex: 0,
                funFact: '',
                emoji: '🌴',
            });
        }
    };

    // Add a word pair
    const addWordPair = () => {
        if (currentWordPair.word1 && currentWordPair.word2) {
            setGameConfig(prev => ({
                ...prev,
                wordPairs: [...(prev.wordPairs || []), { ...currentWordPair }],
            }));
            setCurrentWordPair({ word1: '', word2: '', hint: '' });
        }
    };

    // Add a memory card
    const addCard = () => {
        if (currentCard.symbol && currentCard.name) {
            setGameConfig(prev => ({
                ...prev,
                cards: [...(prev.cards || []), { ...currentCard }],
            }));
            setCurrentCard({ symbol: '', name: '' });
        }
    };

    const filteredGames = games.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    const renderGameBuilder = () => {
        switch (formData.game_type) {
            case 'trivia':
                return (
                    <div className="space-y-6">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            🧠 Trivia Questions ({gameConfig.questions?.length || 0})
                        </h3>

                        {/* Question List */}
                        {(gameConfig.questions || []).map((q, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl relative group">
                                <button
                                    onClick={() => setGameConfig(prev => ({
                                        ...prev,
                                        questions: prev.questions?.filter((_, idx) => idx !== i)
                                    }))}
                                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove question"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <p className="font-bold text-gray-900 mb-2">{q.emoji} {q.question}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {q.options.map((opt, oi) => (
                                        <span key={oi} className={`px-3 py-1.5 rounded-lg ${oi === q.correctIndex ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Add Question Form */}
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl space-y-4">
                            <h4 className="font-bold text-gray-700">Add New Question</h4>

                            <div className="flex gap-3">
                                <select
                                    value={currentQuestion.emoji}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, emoji: e.target.value }))}
                                    className="px-3 py-2 border border-gray-200 rounded-xl text-2xl"
                                    title="Question emoji"
                                >
                                    {['🌴', '🥭', '🦜', '🥁', '🌊', '☀️', '🏝️', '🎵', '🍌', '🐢'].map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={currentQuestion.question}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="What is Jamaica's national fruit?"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {currentQuestion.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={currentQuestion.correctIndex === i}
                                            onChange={() => setCurrentQuestion(prev => ({ ...prev, correctIndex: i }))}
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...currentQuestion.options];
                                                newOpts[i] = e.target.value;
                                                setCurrentQuestion(prev => ({ ...prev, options: newOpts }));
                                            }}
                                            placeholder={`Option ${i + 1}`}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={currentQuestion.funFact}
                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, funFact: e.target.value }))}
                                placeholder="Fun fact shown after answering..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                            />

                            <button
                                onClick={addQuestion}
                                disabled={!currentQuestion.question || currentQuestion.options.some(o => !o.trim())}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                <Plus size={18} className="inline mr-2" /> Add Question
                            </button>
                        </div>
                    </div>
                );

            case 'memory':
                return (
                    <div className="space-y-6">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            🎴 Memory Cards ({gameConfig.cards?.length || 0} pairs)
                        </h3>

                        {/* Card Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {(gameConfig.cards || []).map((card, i) => (
                                <div key={i} className="relative group">
                                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex flex-col items-center justify-center">
                                        <span className="text-4xl">{card.symbol}</span>
                                        <span className="text-xs font-bold text-gray-600 mt-1">{card.name}</span>
                                    </div>
                                    <button
                                        onClick={() => setGameConfig(prev => ({
                                            ...prev,
                                            cards: prev.cards?.filter((_, idx) => idx !== i)
                                        }))}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove card"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Card Form */}
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl space-y-4">
                            <h4 className="font-bold text-gray-700">Add Memory Card Pair</h4>

                            <div className="flex gap-3">
                                <select
                                    value={currentCard.symbol}
                                    onChange={(e) => setCurrentCard(prev => ({ ...prev, symbol: e.target.value }))}
                                    className="px-4 py-3 border border-gray-200 rounded-xl text-3xl w-20"
                                    title="Card symbol"
                                >
                                    <option value="">?</option>
                                    {['🥭', '🥥', '🍍', '🍌', '🦜', '🦀', '🐢', '🏝️', '⛵', '🥁', '🌴', '🌺', '🐠', '🦎', '🎵'].map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={currentCard.name}
                                    onChange={(e) => setCurrentCard(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Name (e.g., Mango)"
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                                />
                                <button
                                    onClick={addCard}
                                    disabled={!currentCard.symbol || !currentCard.name}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Use Characters */}
                            {characters.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-bold text-gray-600 mb-2">Or use your characters:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {characters.slice(0, 6).map(char => (
                                            <button
                                                key={char.id}
                                                onClick={() => {
                                                    setGameConfig(prev => ({
                                                        ...prev,
                                                        cards: [...(prev.cards || []), { symbol: '👤', name: char.name, characterId: char.id }]
                                                    }));
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-200 transition-colors"
                                            >
                                                <div className="relative w-6 h-6 shrink-0">
                                                    <Image src={char.image_url} alt="" fill className="rounded-full object-cover" />
                                                </div>
                                                {char.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'word-match':
                return (
                    <div className="space-y-6">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            🔤 Word Pairs ({gameConfig.wordPairs?.length || 0})
                        </h3>

                        {/* Word Pair List */}
                        <div className="space-y-2">
                            {(gameConfig.wordPairs || []).map((pair, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group">
                                    <span className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg">{pair.word1}</span>
                                    <span className="text-gray-400">↔️</span>
                                    <span className="px-4 py-2 bg-secondary/10 text-secondary font-bold rounded-lg">{pair.word2}</span>
                                    <span className="flex-1 text-gray-400 text-sm italic">({pair.hint})</span>
                                    <button
                                        onClick={() => setGameConfig(prev => ({
                                            ...prev,
                                            wordPairs: prev.wordPairs?.filter((_, idx) => idx !== i)
                                        }))}
                                        className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove pair"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Word Pair */}
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl space-y-4">
                            <h4 className="font-bold text-gray-700">Add Word Pair (e.g., Patois ↔ English)</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={currentWordPair.word1}
                                    onChange={(e) => setCurrentWordPair(prev => ({ ...prev, word1: e.target.value }))}
                                    placeholder="Word 1 (e.g., Wah Gwan)"
                                    className="px-4 py-3 border border-gray-200 rounded-xl"
                                />
                                <input
                                    type="text"
                                    value={currentWordPair.word2}
                                    onChange={(e) => setCurrentWordPair(prev => ({ ...prev, word2: e.target.value }))}
                                    placeholder="Word 2 (e.g., What's up)"
                                    className="px-4 py-3 border border-gray-200 rounded-xl"
                                />
                            </div>
                            <input
                                type="text"
                                value={currentWordPair.hint}
                                onChange={(e) => setCurrentWordPair(prev => ({ ...prev, hint: e.target.value }))}
                                placeholder="Hint for kids..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                            />
                            <button
                                onClick={addWordPair}
                                disabled={!currentWordPair.word1 || !currentWordPair.word2}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                <Plus size={18} className="inline mr-2" /> Add Word Pair
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <Wand2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
                        <p className="text-gray-500">This game type builder is in development</p>
                    </div>
                );
        }
    };

    return (
        <AdminLayout activeSection="content">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Gamepad2 className="text-primary" />
                            Game Builder
                        </h1>
                        <p className="text-gray-500">Create custom educational games for kids using your characters</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingGame(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Wand2 size={20} />
                        Create New Game
                    </button>
                </div>
            </header>

            <div className="p-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search games..."
                    onRefresh={loadData}
                />

                <DataTable
                    data={filteredGames}
                    isLoading={isLoading}
                    emptyMessage="No games created yet. Click 'Create New Game' to get started!"
                    columns={[
                        {
                            key: 'title',
                            label: 'Game',
                            render: (game) => (
                                <div className="flex items-center gap-3">
                                    {game.thumbnail_url ? (
                                        <div className="relative w-14 h-14 shrink-0">
                                            <Image src={game.thumbnail_url} alt="" fill className="object-cover rounded-xl" />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                                            <Gamepad2 className="text-primary" size={24} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{game.title}</p>
                                        <p className="text-xs text-gray-400 capitalize">{game.game_type || game.category}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'game_type',
                            label: 'Type',
                            render: (game) => (
                                <span className="capitalize">{game.game_type || 'Trivia'}</span>
                            ),
                        },
                        {
                            key: 'tier_required',
                            label: 'Access',
                            render: (game) => (
                                <StatusBadge
                                    status={game.tier_required === 'free' ? 'Free' : game.tier_required.replace('_', ' ')}
                                    variant={game.tier_required === 'free' ? 'success' : 'info'}
                                />
                            ),
                        },
                        {
                            key: 'play_count',
                            label: 'Plays',
                            render: (game) => (game.play_count || 0).toLocaleString(),
                        },
                        {
                            key: 'is_active',
                            label: 'Status',
                            render: (game) => (
                                <StatusBadge
                                    status={game.is_active ? 'Active' : 'Draft'}
                                    variant={game.is_active ? 'success' : 'default'}
                                />
                            ),
                        },
                    ]}
                    actions={(game) => (
                        <div className="flex items-center gap-1">
                            <ActionButton icon={Eye} onClick={() => window.open(`/portal/games/${game.game_url || game.id}`)} title="Preview" />
                            <ActionButton icon={Edit} onClick={() => openEditModal(game)} title="Edit" />
                            <ActionButton icon={Trash2} onClick={() => handleDelete(game.id)} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>

            {/* Game Builder Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingGame(null); resetForm(); }}
                title={editingGame ? 'Edit Game' : 'Create New Game'}
                size="xl"
            >
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((step) => (
                        <button
                            key={step}
                            onClick={() => setModalStep(step)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${modalStep === step
                                ? 'bg-primary text-white'
                                : modalStep > step
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-sm">
                                {modalStep > step ? '✓' : step}
                            </span>
                            {step === 1 ? 'Basics' : step === 2 ? 'Content' : 'Settings'}
                        </button>
                    ))}
                </div>

                {/* Step 1: Basics */}
                {modalStep === 1 && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Game Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g., Caribbean Culture Quiz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Game Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GAME_TYPES.slice(0, 4).map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, game_type: type.id }))}
                                                className={`p-3 rounded-xl text-left transition-all border-2 ${formData.game_type === type.id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-2xl">{type.icon}</span>
                                                <p className="font-bold text-gray-900 text-sm mt-1">{type.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                        title="Game category"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail</label>
                                    {formData.thumbnail_url ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden">
                                            <Image src={formData.thumbnail_url} alt="" fill className="object-cover" />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                                                title="Remove thumbnail"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <FileUpload
                                            accept="image/*"
                                            onUpload={handleThumbnailUpload}
                                            label="Upload Thumbnail"
                                            description="PNG or JPG, 16:9 recommended"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                        rows={4}
                                        placeholder="What will kids learn from this game?"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Game Content */}
                {modalStep === 2 && renderGameBuilder()}

                {/* Step 3: Settings */}
                {modalStep === 3 && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                                <div className="flex gap-2">
                                    {['easy', 'medium', 'hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setGameConfig(prev => ({ ...prev, difficulty: d as 'easy' | 'medium' | 'hard' }))}
                                            className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${gameConfig.difficulty === d
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {d === 'easy' ? '🌱 Easy' : d === 'medium' ? '🌿 Medium' : '🌳 Hard'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">XP Reward</label>
                                <input
                                    type="number"
                                    value={gameConfig.xpReward}
                                    onChange={(e) => setGameConfig(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 100 }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                    min={10}
                                    max={500}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Access Tier</label>
                                <select
                                    value={formData.tier_required}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tier_required: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                    title="Required subscription tier"
                                >
                                    <option value="free">Free (Everyone)</option>
                                    <option value="starter_mailer">Starter Mailer</option>
                                    <option value="legends_plus">Legends Plus</option>
                                    <option value="family_legacy">Family Legacy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Game URL Slug</label>
                                <input
                                    type="text"
                                    value={formData.game_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, game_url: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm"
                                    placeholder="caribbean-culture-quiz"
                                />
                                <p className="text-xs text-gray-400 mt-1">URL: /portal/games/{formData.game_url || 'slug'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="is_active" className="font-medium text-gray-700">
                                Publish game immediately (visible in kids portal)
                            </label>
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                    <button
                        onClick={() => modalStep > 1 ? setModalStep(s => s - 1) : (setShowModal(false), setEditingGame(null), resetForm())}
                        className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold"
                    >
                        {modalStep > 1 ? '← Back' : 'Cancel'}
                    </button>

                    {modalStep < 3 ? (
                        <button
                            onClick={() => setModalStep(s => s + 1)}
                            disabled={!formData.title}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title}
                            className="px-10 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {editingGame ? 'Save Changes' : '🚀 Publish Game'}
                        </button>
                    )}
                </div>
            </Modal>
        </AdminLayout>
    );
}
