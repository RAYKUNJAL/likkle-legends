/**
 * AI-Powered Game Generator for Likkle Legends
 * Uses Gemini to create custom Caribbean-themed educational games
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

const getGenAI = () => {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};


const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ==========================================
// GAME TYPES
// ==========================================

export type GameType = 'trivia' | 'word_match' | 'memory' | 'story_adventure' | 'cultural_quiz' | 'island_explorer';

export interface TriviaQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    funFact: string;
    emoji: string;
}

export interface WordPair {
    patois: string;
    english: string;
    hint: string;
}

export interface MemoryCard {
    id: string;
    symbol: string;
    name: string;
    category: 'fruit' | 'animal' | 'landmark' | 'instrument';
}

export interface StoryChoice {
    text: string;
    emoji: string;
    nextSceneId: string;
}

export interface StoryScene {
    id: string;
    narrative: string;
    backgroundEmoji: string;
    choices: StoryChoice[];
    isEnding: boolean;
    xpReward?: number;
}

export interface GeneratedGame {
    type: GameType;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    island: string;
    estimatedMinutes: number;
    xpReward: number;
    data: TriviaQuestion[] | WordPair[] | MemoryCard[] | StoryScene[];
}

// ==========================================
// CARIBBEAN CONTENT DATABASE
// ==========================================

const CARIBBEAN_DATA = {
    islands: ['Jamaica', 'Trinidad & Tobago', 'Barbados', 'Haiti', 'Bahamas', 'Grenada'],
    fruits: [
        { symbol: '🥭', name: 'Mango', hint: 'Sweet yellow fruit' },
        { symbol: '🥥', name: 'Coconut', hint: 'Hard shell, sweet water inside' },
        { symbol: '🍍', name: 'Pineapple', hint: 'Spiky tropical fruit' },
        { symbol: '🍌', name: 'Banana', hint: 'Long yellow fruit' },
        { symbol: '🍈', name: 'Breadfruit', hint: 'Green starchy fruit' },
        { symbol: '🫐', name: 'Ackee', hint: 'Jamaica\'s national fruit' },
    ],
    animals: [
        { symbol: '🦜', name: 'Parrot', hint: 'Colorful talking bird' },
        { symbol: '🦀', name: 'Crab', hint: 'Walks sideways on the beach' },
        { symbol: '🐢', name: 'Sea Turtle', hint: 'Swims in the ocean' },
        { symbol: '🦎', name: 'Lizard', hint: 'Small and fast' },
        { symbol: '🐠', name: 'Tropical Fish', hint: 'Colorful sea creature' },
        { symbol: '🦩', name: 'Flamingo', hint: 'Pink bird on one leg' },
    ],
    instruments: [
        { symbol: '🥁', name: 'Steel Pan', hint: 'Trinidad\'s musical invention' },
        { symbol: '🪘', name: 'Bongo Drums', hint: 'Traditional hand drums' },
        { symbol: '🎺', name: 'Trumpet', hint: 'Brass festival instrument' },
        { symbol: '🪇', name: 'Maracas', hint: 'Shake to the rhythm' },
    ],
    patoisWords: [
        { patois: 'Wha Gwan', english: 'What\'s going on?', hint: 'A greeting' },
        { patois: 'Pickney', english: 'Child', hint: 'A young person' },
        { patois: 'Big Up', english: 'Respect/Praise', hint: 'Showing appreciation' },
        { patois: 'Irie', english: 'Feeling good', hint: 'Everything is alright' },
        { patois: 'Likkle', english: 'Little', hint: 'Small size' },
        { patois: 'Nuff', english: 'Plenty/Many', hint: 'A lot of something' },
        { patois: 'Tallawah', english: 'Strong/Brave', hint: 'Mighty despite size' },
        { patois: 'Bashment', english: 'Party', hint: 'A celebration' },
        { patois: 'Nyam', english: 'Eat', hint: 'Having food' },
        { patois: 'Bogle', english: 'Dance move', hint: 'Popular dance' },
    ],
    landmarks: [
        { symbol: '⛰️', name: 'Blue Mountains', island: 'Jamaica', hint: 'Famous coffee grows here' },
        { symbol: '🏖️', name: 'Seven Mile Beach', island: 'Jamaica', hint: 'Long sandy paradise' },
        { symbol: '🗿', name: 'Citadelle', island: 'Haiti', hint: 'Mountaintop fortress' },
        { symbol: '🌊', name: 'Maracas Bay', island: 'Trinidad', hint: 'Famous for bake and shark' },
        { symbol: '🏝️', name: 'Pigeon Island', island: 'St. Lucia', hint: 'Historic national park' },
        { symbol: '🌋', name: 'Soufrière', island: 'Dominica', hint: 'Boiling volcanic lake' },
    ],
};

// ==========================================
// GAME GENERATORS
// ==========================================

export async function generateTriviaGame(
    island: string = 'Jamaica',
    difficulty: 'easy' | 'medium' | 'hard' = 'easy',
    questionCount: number = 5
): Promise<GeneratedGame> {
    const genAI = getGenAI();
    if (!genAI) {
        return generateFallbackTrivia(island, difficulty, questionCount);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        const prompt = `Generate ${questionCount} fun trivia questions about ${island} and Caribbean culture for a ${difficulty === 'easy' ? '4-5' : difficulty === 'medium' ? '6-7' : '7-8'} year old child.
    
Return as JSON array with this exact structure:
[
  {
    "question": "What is Jamaica's national fruit?",
    "options": ["Ackee", "Mango", "Banana", "Pineapple"],
    "correctIndex": 0,
    "funFact": "Ackee was brought to Jamaica from West Africa!",
    "emoji": "🫐"
  }
]

Make questions fun, educational, and Caribbean-themed. Include emojis. Keep language simple and encouraging.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]) as TriviaQuestion[];
            return {
                type: 'trivia',
                title: `${island} Island Trivia`,
                description: `Test your knowledge about ${island} and Caribbean culture!`,
                difficulty,
                island,
                estimatedMinutes: questionCount * 2,
                xpReward: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150,
                data: questions,
            };
        }

        return generateFallbackTrivia(island, difficulty, questionCount);
    } catch (error) {
        console.error("Trivia generation error:", error);
        return generateFallbackTrivia(island, difficulty, questionCount);
    }
}

function generateFallbackTrivia(island: string, difficulty: string, count: number): GeneratedGame {
    const fallbackQuestions: TriviaQuestion[] = [
        {
            question: "What color is a ripe mango?",
            options: ["Yellow-orange", "Blue", "Purple", "Green"],
            correctIndex: 0,
            funFact: "Mangoes are called the 'King of Fruits' in the Caribbean!",
            emoji: "🥭"
        },
        {
            question: "Which bird can talk and repeat words?",
            options: ["Parrot", "Eagle", "Penguin", "Owl"],
            correctIndex: 0,
            funFact: "Caribbean parrots are known for their colorful feathers!",
            emoji: "🦜"
        },
        {
            question: "What instrument was invented in Trinidad?",
            options: ["Steel Pan", "Guitar", "Piano", "Violin"],
            correctIndex: 0,
            funFact: "The steel pan is the only instrument invented in the 20th century!",
            emoji: "🥁"
        },
        {
            question: "What does 'Irie' mean?",
            options: ["Feeling good", "Feeling sad", "Feeling hungry", "Feeling sleepy"],
            correctIndex: 0,
            funFact: "When Jamaicans say 'Irie', it means everything is wonderful!",
            emoji: "😊"
        },
        {
            question: "Which sea surrounds the Caribbean islands?",
            options: ["Caribbean Sea", "Arctic Ocean", "Pacific Ocean", "Red Sea"],
            correctIndex: 0,
            funFact: "The Caribbean Sea is one of the warmest seas in the world!",
            emoji: "🌊"
        },
    ];

    return {
        type: 'trivia',
        title: `Caribbean Culture Quiz`,
        description: `Learn fun facts about the Caribbean islands!`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        island,
        estimatedMinutes: count * 2,
        xpReward: 50,
        data: fallbackQuestions.slice(0, count),
    };
}

export async function generateWordMatchGame(wordCount: number = 6): Promise<GeneratedGame> {
    // Use local data for reliability
    const shuffled = [...CARIBBEAN_DATA.patoisWords].sort(() => Math.random() - 0.5);
    const pairs = shuffled.slice(0, wordCount);

    return {
        type: 'word_match',
        title: 'Patois Word Match',
        description: 'Connect Caribbean words to their English meanings!',
        difficulty: wordCount <= 4 ? 'easy' : wordCount <= 6 ? 'medium' : 'hard',
        island: 'Jamaica',
        estimatedMinutes: 5,
        xpReward: wordCount * 10,
        data: pairs,
    };
}

export async function generateMemoryGame(
    category: 'fruit' | 'animal' | 'mixed' = 'mixed',
    pairCount: number = 6
): Promise<GeneratedGame> {
    let items: { symbol: string; name: string }[] = [];

    if (category === 'fruit') {
        items = CARIBBEAN_DATA.fruits;
    } else if (category === 'animal') {
        items = CARIBBEAN_DATA.animals;
    } else {
        items = [...CARIBBEAN_DATA.fruits.slice(0, 3), ...CARIBBEAN_DATA.animals.slice(0, 3)];
    }

    const cards: MemoryCard[] = items.slice(0, pairCount).map((item, i) => ({
        id: `card-${i}`,
        symbol: item.symbol,
        name: item.name,
        category: category === 'mixed' ? (i < 3 ? 'fruit' : 'animal') : category,
    }));

    return {
        type: 'memory',
        title: 'Island Memory Match',
        description: 'Find the matching Caribbean pairs!',
        difficulty: pairCount <= 4 ? 'easy' : pairCount <= 6 ? 'medium' : 'hard',
        island: 'Caribbean',
        estimatedMinutes: 5,
        xpReward: pairCount * 15,
        data: cards,
    };
}

export async function generateStoryAdventure(
    childName: string,
    island: string = 'Jamaica'
): Promise<GeneratedGame> {
    const genAI = getGenAI();
    if (!genAI) {
        return generateFallbackStory(childName, island);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        const prompt = `Create a short interactive story adventure for a 5-year-old named ${childName} set in ${island}.

Return as JSON with this structure:
{
  "scenes": [
    {
      "id": "start",
      "narrative": "${childName} wakes up on a sunny morning in ${island}. A colorful parrot flies to their window!",
      "backgroundEmoji": "🏝️",
      "choices": [
        { "text": "Follow the parrot", "emoji": "🦜", "nextSceneId": "scene1" },
        { "text": "Stay and eat breakfast", "emoji": "🍳", "nextSceneId": "scene2" }
      ],
      "isEnding": false
    }
  ]
}

Create 4-5 scenes with 2 choices each. Make it fun, safe, and educational about Caribbean culture. End with a positive message and XP reward.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const storyData = JSON.parse(jsonMatch[0]);
            return {
                type: 'story_adventure',
                title: `${childName}'s Island Adventure`,
                description: `An interactive story adventure in ${island}!`,
                difficulty: 'easy',
                island,
                estimatedMinutes: 10,
                xpReward: 100,
                data: storyData.scenes as StoryScene[],
            };
        }

        return generateFallbackStory(childName, island);
    } catch (error) {
        console.error("Story generation error:", error);
        return generateFallbackStory(childName, island);
    }
}

function generateFallbackStory(childName: string, island: string): GeneratedGame {
    const scenes: StoryScene[] = [
        {
            id: 'start',
            narrative: `${childName} wakes up to sunshine streaming through the window. Today is a special day – a treasure hunt on ${island}! A friendly parrot named Polly flies to the window with a golden map in her beak.`,
            backgroundEmoji: '🌅',
            choices: [
                { text: 'Take the map!', emoji: '🗺️', nextSceneId: 'beach' },
                { text: 'Wave to Polly', emoji: '👋', nextSceneId: 'jungle' },
            ],
            isEnding: false,
        },
        {
            id: 'beach',
            narrative: `${childName} runs to the beautiful sandy beach. The ocean sparkles like diamonds! There's a friendly crab digging in the sand and a big palm tree with coconuts.`,
            backgroundEmoji: '🏖️',
            choices: [
                { text: 'Help the crab', emoji: '🦀', nextSceneId: 'crab' },
                { text: 'Climb for coconuts', emoji: '🥥', nextSceneId: 'treasure' },
            ],
            isEnding: false,
        },
        {
            id: 'jungle',
            narrative: `Polly leads ${childName} into a magical jungle full of colorful flowers and singing birds. A trail of shiny stones leads deeper into the forest!`,
            backgroundEmoji: '🌴',
            choices: [
                { text: 'Follow the stones', emoji: '✨', nextSceneId: 'treasure' },
                { text: 'Listen to the birds', emoji: '🎵', nextSceneId: 'treasure' },
            ],
            isEnding: false,
        },
        {
            id: 'crab',
            narrative: `The crab is so happy ${childName} helped! He does a little sideways dance and points a claw toward a shiny spot in the sand. Could it be the treasure?`,
            backgroundEmoji: '🦀',
            choices: [
                { text: 'Dig for treasure!', emoji: '⛏️', nextSceneId: 'treasure' },
            ],
            isEnding: false,
        },
        {
            id: 'treasure',
            narrative: `🎉 AMAZING! ${childName} found the treasure! But the real treasure wasn't gold – it was a beautiful shell that plays Caribbean music when you hold it to your ear! "Wah gwan, little legend!" says Polly. "You're a true island explorer!"`,
            backgroundEmoji: '🐚',
            choices: [],
            isEnding: true,
            xpReward: 100,
        },
    ];

    return {
        type: 'story_adventure',
        title: `${childName}'s Treasure Hunt`,
        description: `Help ${childName} find the hidden treasure!`,
        difficulty: 'easy',
        island,
        estimatedMinutes: 8,
        xpReward: 100,
        data: scenes,
    };
}

export async function generateCulturalQuiz(island: string = 'Jamaica'): Promise<GeneratedGame> {
    return generateTriviaGame(island, 'easy', 5);
}

// ==========================================
// GAME SESSION TRACKING
// ==========================================

export interface GameSession {
    gameId: string;
    gameType: GameType;
    startedAt: Date;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    xpEarned: number;
    completed: boolean;
}

export function calculateGameXP(
    gameType: GameType,
    score: number,
    difficulty: 'easy' | 'medium' | 'hard',
    accuracy: number
): number {
    const baseXP = { easy: 50, medium: 100, hard: 150 }[difficulty];
    const accuracyBonus = Math.floor(accuracy * 50);
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];

    return Math.floor((baseXP + accuracyBonus) * difficultyMultiplier);
}
