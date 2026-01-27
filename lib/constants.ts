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
        name: "Dilly Doubles",
        role: "Food & Traditions Expert",
        tagline: "“Ready for a Caribbean journey?”",
        description: "Dilly knows every street food spot in Trinidad and loves sharing the magic of doubles, bakes, and buss-up-shot with curious kids.",
        color: "bg-yellow-400",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400",
        traits: ["Entrepreneur", "Chef", "Cultural"]
    },
    {
        name: "Mango Moko",
        role: "Perspective & Pride Guide",
        tagline: "“Stand tall, little legend.”",
        description: "Perched high on her moko jumbie stilts, Mango teaches kids to see themselves with pride and view challenges from a higher perspective.",
        color: "bg-orange-500",
        image: "https://images.unsplash.com/photo-1545641203-7d072a14e3b2?auto=format&fit=crop&q=80&w=400",
        traits: ["Stilt-Walker", "Brave", "Uplifting"]
    },
    {
        name: "Steelpan Sam",
        role: "Music & Rhythm Master",
        tagline: "“Everything in the world has a beat.”",
        description: "From steelpan to soca, Sam helps your child find the rhythm in everyday life and express big emotions through music.",
        color: "bg-blue-400",
        image: "https://images.unsplash.com/photo-1541444196041-fb43a55229fc?auto=format&fit=crop&q=80&w=400",
        traits: ["Musician", "Rhythmic", "Creative"]
    },
    {
        name: "Locked Legend",
        role: "Mystery Hero",
        tagline: "“Coming soon to de village...”",
        description: "A new legendary hero is about to emerge from de island mists. Keep reading to unlock deir story!",
        color: "bg-indigo-950",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        traits: ["Secret", "Legendary", "Island"],
        isMystery: true
    }
];

export const RADIO_CHANNELS = [
    { id: 'story', label: "Story Time", icon: "📚" },
    { id: 'lullaby', label: "Island Lullabies", icon: "🌙" },
    { id: 'culture', label: "Culture Corner", icon: "🌍" },
    { id: 'calm', label: "Coconut Cover Music", icon: "🥥" },
    { id: 'learning', label: "Learning Songs", icon: "🧠" },
    { id: 'vip', label: "Heritage VIP", icon: "👑" }
];

export const RADIO_TRACKS = [
    {
        id: 'wav1',
        title: 'Coconut Bay Breeze',
        artist: 'Nature Sounds',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
        channel: 'calm'
    },
    {
        id: 'wav2',
        title: 'Parrot Jungle Jam',
        artist: 'Village Band',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
        channel: 'culture'
    },
    {
        id: 'wav3',
        title: 'Anansi and de Pot of Beans',
        artist: 'Tanty Spice',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-monkey-laugh-100.mp3',
        channel: 'story'
    },
    {
        id: 'wav4',
        title: 'Night Crickets in Maracas',
        artist: 'Rainforest Sounds',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-ambience-2-2480.mp3',
        channel: 'lullaby'
    },
    {
        id: 'vid1',
        title: 'Carnival Parade 2025',
        artist: 'Island TV',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        channel: 'culture'
    },
    {
        id: 'vid2',
        title: 'Counting Mangoes',
        artist: 'Tanty Spice',
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        channel: 'learning'
    },
    {
        id: 'wav5',
        title: 'Steelpan Serenade',
        artist: 'Trinidad All Stars',
        url: 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3',
        channel: 'vip'
    },
    {
        id: 'wav6',
        title: 'Learn de Alphabet',
        artist: 'Tanty Spice',
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3',
        channel: 'learning'
    }
];

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
