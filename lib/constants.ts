import { Character, AdminCharacter, Quest } from './types';

export const BRAND_NAME = "Likkle Legends";
export const TANTY_AVATAR = "/images/tanty_spice_avatar.jpg";

export const PRICING_TIERS = [
    { id: 'free', name: 'Free Explorer' },
    { id: 'starter_mailer', name: 'Mini Legend' },
    { id: 'legend', name: 'Big Legend' },
    { id: 'legends_plus', name: 'Legends Plus' },
];

export const TANTY_CHARACTER: Character = {
    name: "Tanty Spice",
    role: "The Village Grandmother",
    tagline: "“Everything Cook & Curry, me darlin'.”",
    description: "Tanty is the heart of the village. She always has a warm bench, a sweet sugar-cake, and a listening ear for every child.",
    color: "bg-orange-50",
    image: TANTY_AVATAR,
    traits: ["Kind", "Wise", "Warm"]
};

export const CHARACTERS: AdminCharacter[] = [
    {
        name: "R.O.T.I.",
        role: "Learning Buddy",
        tagline: "“Beep boop! Ready to learn?”",
        description: "A friendly guide who helps children learn step by step through stories, games, and gentle encouragement.",
        color: "bg-blue-50",
        image: "/images/roti-avatar.jpg",
        traits: ["Guided", "Friendly", "Curriculum"]
    },
    {
        name: "Dilly Doubles",
        role: "Food & Traditions Expert",
        tagline: "“Ready for a Caribbean journey?”",
        description: "Dilly knows every street food spot in Trinidad and loves sharing the magic of doubles, bakes, and buss-up-shot with curious kids.",
        color: "bg-yellow-400",
        image: "/images/dilly-doubles.jpg",
        traits: ["Entrepreneur", "Chef", "Cultural"]
    },
    {
        name: "Mango Moko",
        role: "Perspective & Pride Guide",
        tagline: "“Stand tall, little legend.”",
        description: "Perched high on her moko jumbie stilts, Mango teaches kids to see themselves with pride and view challenges from a higher perspective.",
        color: "bg-orange-500",
        image: "/images/mango_moko.png",
        traits: ["Stilt-Walker", "Brave", "Uplifting"]
    },
    {
        name: "Steelpan Sam",
        role: "Music & Rhythm Master",
        tagline: "“Everything in the world has a beat.”",
        description: "From steelpan to soca, Sam helps your child find the rhythm in everyday life and express big emotions through music.",
        color: "bg-blue-400",
        image: "/images/steelpan_sam.png",
        traits: ["Musician", "Rhythmic", "Creative"]
    },
    {
        name: "Locked Legend",
        role: "Mystery Hero",
        tagline: "“Coming soon to de village...”",
        description: "A new legendary hero is about to emerge from de island mists. Keep reading to unlock deir story!",
        color: "bg-indigo-950",
        image: "/images/mystery-character.png",
        traits: ["Secret", "Legendary", "Island"],
        isMystery: true
    }
];

// Radio channels remain as they define the UI structure
export const RADIO_CHANNELS = [
    { id: 'story', label: "Story Time", icon: "📚" },
    { id: 'lullaby', label: "Island Lullabies", icon: "🌙" },
    { id: 'culture', label: "Culture Corner", icon: "🌍" },
    { id: 'calm', label: "Coconut Cover Music", icon: "🥥" },
    { id: 'learning', label: "Learning Songs", icon: "🧠" },
    { id: 'vip', label: "Heritage VIP", icon: "👑" }
];

// RADIO_TRACKS removed - now served from Database or empty by default
export const RADIO_TRACKS = [];

export const QUESTS: Quest[] = [
    {
        id: 'q1',
        title: 'Island Fruit Hunter',
        description: 'Find a fruit from the islands and draw its beautiful skin!',
        rewardPoints: 100,
        icon: '🥭',
        category: 'Nature',
        steps: ['Find a mango, pineapple, or banana', 'Draw its colors and shape', 'Tell Tanty Spice its name!']
    },
    {
        id: 'q2',
        title: 'Patois Greeter',
        description: 'Learn and practice 3 Caribbean greetings.',
        rewardPoints: 150,
        icon: '🗣️',
        category: 'Language',
        steps: ['Learn "Wha Gwan" and "Irie"', 'Learn "Big Up"', 'Say it to someone you love today!']
    },
    {
        id: 'q3',
        title: 'Steelpan Rhythm',
        description: 'Find something that makes a metallic sound and play a beat!',
        rewardPoints: 200,
        icon: '🥁',
        category: 'Music',
        steps: ['Find a pot lid or a spoon', 'Listen to its "Ting!" sound', 'Play your favorite soca rhythm']
    },
    {
        id: 'q4',
        title: 'Spice Detective',
        description: 'Find something in the kitchen that smells like the islands.',
        rewardPoints: 250,
        icon: '🧂',
        category: 'Food',
        steps: ['Smell some cinnamon or nutmeg', 'Imagine you are at a local market', 'Help cook a meal with that spice']
    },
    {
        id: 'q5',
        title: 'Flag Flyer',
        description: 'Discover the colors of a Caribbean flag.',
        rewardPoints: 300,
        icon: '🚩',
        category: 'Culture',
        steps: ['Look up the Jamaica or Trinidad flag', 'Name all the colors you see', 'Draw your own "Legend Flag"']
    }
];
