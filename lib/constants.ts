import { Character, AdminCharacter, Quest, Track } from './types';

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
    traits: ["Kind", "Wise", "Warm"],
    model_3d_url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
};

export const CHARACTERS: AdminCharacter[] = [
    {
        name: "R.O.T.I.",
        role: "Learning Buddy",
        tagline: "“Beep boop! Ready to learn?”",
        description: "A friendly guide who helps children learn step by step through stories, games, and gentle encouragement.",
        color: "bg-blue-50",
        image: "/images/roti-new.jpg",
        traits: ["Guided", "Friendly", "Curriculum"],
        model_3d_url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
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
        name: "Scorcha Pepper",
        role: "Spicy Adventurer",
        tagline: "“Bring de heat, little legend!”",
        description: "The brave scout of the islands—Scorcha helps kids face challenges with confidence and a little extra energy.",
        color: "bg-red-50",
        image: "/images/scorcha_pepper.jpg",
        traits: ["Brave", "Scout", "Energetic"]
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

export const RADIO_CHANNELS = [
    { id: 'story', label: "Story Time", icon: "📚" },
    { id: 'lullaby', label: "Island Lullabies", icon: "🌙" },
    { id: 'culture', label: "Culture Corner", icon: "🌍" },
    { id: 'calm', label: "Coconut Cover Music", icon: "🥥" },
    { id: 'learning', label: "Learning Songs", icon: "🧠" },
    { id: 'vip', label: "Heritage VIP", icon: "👑" }
];

// ─── RADIO TRACKS ────────────────────────────────────────────────────────────
// TO ADD YOUR OWN MUSIC:
//   1. Drop MP3s into public/audio/ (e.g. public/audio/steelpan-serenade.mp3)
//   2. Update the `url` field below to '/audio/your-file.mp3'
//   OR upload to Supabase Storage bucket "audio" and paste the public URL.
// ─────────────────────────────────────────────────────────────────────────────
export const RADIO_TRACKS: Track[] = [
    {
        id: 'track-1',
        title: 'Island Morning Vibes',
        artist: 'Likkle Legends',
        url: '/audio/island-morning.mp3',   // → drop your MP3 at public/audio/island-morning.mp3
        channel: 'calm'
    },
    {
        id: 'track-2',
        title: 'Steelpan Serenade',
        artist: 'Likkle Legends',
        url: '/audio/steelpan-serenade.mp3',
        channel: 'learning'
    },
    {
        id: 'track-3',
        title: 'Tanty Story Time',
        artist: 'Tanty Spice',
        url: '/audio/tanty-story-time.mp3',
        channel: 'story'
    },
    {
        id: 'track-4',
        title: 'Island Lullaby',
        artist: 'Tanty Spice',
        url: '/audio/island-lullaby.mp3',
        channel: 'lullaby'
    },
    {
        id: 'track-5',
        title: 'Caribbean Heritage',
        artist: 'Likkle Legends',
        url: '/audio/caribbean-heritage.mp3',
        channel: 'culture'
    },
    {
        id: 'track-6',
        title: 'Counting with Roti',
        artist: 'R.O.T.I.',
        url: '/audio/counting-with-roti.mp3',
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
        steps: ['Find a mango, pineapple, or banner', 'Draw its colors and shape', 'Tell Tanty Spice its name!']
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
    }
];
