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

// --- RADIO TRACKS ────────────────────────────────────────────────────────────
// Add more Suno tracks: paste the share URL in chat and get the cdn1.suno.ai link.
// Add more local MP3s: drop file in public/audio/ and use '/audio/filename.mp3'.
// ─────────────────────────────────────────────────────────────────────────────
export const RADIO_CHANNELS = [
    { id: 'roti',          label: 'R.O.T.I Learning Lab', icon: '🤖' },
    { id: 'tanty_spice',   label: 'Tanty Spice Show',     icon: '🌶️' },
    { id: 'dilly_doubles', label: 'Dilly Vibes',          icon: '🎵' },
    { id: 'steelpan_sam',  label: 'Steelpan Sam Stage',   icon: '🥁' },
];
export const RADIO_TRACKS: Track[] = [
    // R.O.T.I Learning Lab
    { id: 'track-roti-1', title: 'Island Alphabet',       artist: 'R.O.T.I',       url: 'https://cdn1.suno.ai/614d60d0-dce6-4fdf-8c65-4f6efdec40a3.mp3', channel: 'roti' },
    { id: 'track-roti-2', title: 'Island Counting',       artist: 'R.O.T.I',       url: 'https://cdn1.suno.ai/d85cfbfe-41ac-4694-9000-54b8ab87f460.mp3', channel: 'roti' },
    { id: 'track-roti-3', title: 'Likkle Legends Jingle', artist: 'R.O.T.I',       url: 'https://cdn1.suno.ai/b792349c-09ad-4d94-8e96-ef4077b39209.mp3', channel: 'roti' },

    // Tanty Spice Show
    { id: 'track-tanty-1', title: 'Coco Water',           artist: 'Tanty Spice',   url: 'https://cdn1.suno.ai/ed6d7539-ed37-4f21-a06c-73142ea2129d.mp3', channel: 'tanty_spice' },
    { id: 'track-tanty-2', title: 'Sorell Drink',         artist: 'Tanty Spice',   url: 'https://cdn1.suno.ai/3f649c16-75ff-43de-99d6-17e4534d716b.mp3', channel: 'tanty_spice' },

    // Dilly Vibes
    { id: 'track-dilly-1', title: 'Angry Rooster',        artist: 'Dilly Doubles', url: 'https://cdn1.suno.ai/c5e7a4d5-3154-4a42-9106-e33f446b9b4b.mp3', channel: 'dilly_doubles' },
    { id: 'track-dilly-2', title: 'Island Monkeys',       artist: 'Dilly Doubles', url: 'https://cdn1.suno.ai/6d2d490e-2cd6-4593-898d-ee6c82d7b4b8.mp3', channel: 'dilly_doubles' },

    // Steelpan Sam Stage
    { id: 'track-sam-1', title: 'Island Parrots',         artist: 'Steelpan Sam',  url: 'https://cdn1.suno.ai/ee0e94a6-d116-4116-992e-7ecb8fd76109.mp3', channel: 'steelpan_sam' },
    { id: 'track-sam-2', title: 'Iguana Song',            artist: 'Steelpan Sam',  url: 'https://cdn1.suno.ai/0303769f-299a-40dd-bc6a-890c405dbb07.mp3', channel: 'steelpan_sam' },
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

export interface CraftActivity {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'music' | 'food' | 'nature' | 'culture' | 'art';
    difficulty: 'easy' | 'medium';
    ageMin: number;
    ageMax: number;
    materials: string[];
    steps: string[];
    tip: string;
    rewardXp: number;
    color: string;
}

export const CRAFT_ACTIVITIES: CraftActivity[] = [
    {
        id: 'craft-steeldrum',
        title: 'Tin Can Steel Drum',
        description: 'Make your very own mini steel pan — the Caribbean\'s special instrument — using things from your kitchen!',
        icon: '🥁',
        category: 'music',
        difficulty: 'easy',
        ageMin: 3,
        ageMax: 9,
        materials: ['Empty tin can or pot', 'A spoon or pencil', 'Stickers or paint to decorate'],
        steps: [
            'Ask a grown-up to make sure the tin can has no sharp edges',
            'Decorate your can with bright colours, stickers, or paint — make it Caribbean!',
            'Let it dry completely',
            'Tap the top gently with your spoon — listen to that "TING!"',
            'Try to tap out a rhythm: slow… fast… slow-slow-FAST!'
        ],
        tip: 'The steel pan was invented in Trinidad! Try tapping "Bam-Bam" with your spoon.',
        rewardXp: 80,
        color: 'from-orange-400 to-amber-500',
    },
    {
        id: 'craft-carnival-mask',
        title: 'Carnival Mask',
        description: 'Create a dazzling Carnival mask just like the ones worn at Trinidad Carnival and Crop Over in Barbados!',
        icon: '🎭',
        category: 'culture',
        difficulty: 'medium',
        ageMin: 4,
        ageMax: 9,
        materials: ['Paper plate or thick card', 'Scissors (with help!)', 'Crayons or paint', 'Feathers, ribbon, or glitter', 'Tape or glue'],
        steps: [
            'Cut eye holes in the centre of your paper plate — ask a grown-up to help!',
            'Paint or colour your mask in bright Caribbean colours: yellow, green, red',
            'Glue feathers or ribbon around the edges',
            'Add glitter or sticker gems for extra sparkle',
            'Attach a stick to hold it up, or add string to tie it on',
            'Wear it and parade around your home!'
        ],
        tip: 'Carnival is the biggest street celebration in the Caribbean. Costumes can take a whole year to make!',
        rewardXp: 100,
        color: 'from-pink-500 to-rose-500',
    },
    {
        id: 'craft-mango-tree',
        title: 'Mango Tree Painting',
        description: 'Paint a beautiful mango tree — the most loved fruit tree across the Caribbean islands!',
        icon: '🥭',
        category: 'art',
        difficulty: 'easy',
        ageMin: 3,
        ageMax: 9,
        materials: ['White paper', 'Green and brown paint or crayons', 'Orange and yellow for mangoes', 'A sponge or fingers for leaves!'],
        steps: [
            'Draw or paint a thick brown trunk in the middle of your paper',
            'Use your sponge or fingers to dab lots of green blobs for leaves',
            'Paint small orange-yellow ovals hanging from the branches — those are your mangoes!',
            'Add a bright blue sky and golden sunshine at the top',
            'Write your name on the back — you\'re a Caribbean artist!'
        ],
        tip: 'Mango trees grow all over Jamaica, Trinidad, and Barbados. Some trees live for over 100 years!',
        rewardXp: 70,
        color: 'from-yellow-400 to-orange-400',
    },
    {
        id: 'craft-sea-turtle',
        title: 'Paper Sea Turtle',
        description: 'Fold and decorate a sea turtle — these amazing creatures have swum in Caribbean waters for millions of years!',
        icon: '🐢',
        category: 'nature',
        difficulty: 'easy',
        ageMin: 3,
        ageMax: 8,
        materials: ['Green paper or card', 'Scissors (with help!)', 'Crayons or markers', 'Googly eyes (optional)'],
        steps: [
            'Draw a big circle on green paper — this is the turtle\'s shell',
            'Draw a head, four flippers, and a tail around the edge of the circle',
            'Cut it out carefully — ask a grown-up if needed',
            'Draw a hexagon pattern on the shell with your marker',
            'Colour the shell in greens and yellows',
            'Stick on googly eyes or draw big friendly eyes',
            'Give your turtle a Caribbean name!'
        ],
        tip: 'Leatherback sea turtles nest on beaches in Trinidad every year. They are the largest turtles in the world!',
        rewardXp: 75,
        color: 'from-emerald-400 to-teal-500',
    },
    {
        id: 'craft-hibiscus',
        title: 'Paper Hibiscus Flower',
        description: 'Create a bright hibiscus flower — the national flower of many Caribbean islands and a symbol of tropical beauty!',
        icon: '🌺',
        category: 'nature',
        difficulty: 'medium',
        ageMin: 4,
        ageMax: 9,
        materials: ['Red or pink paper', 'Scissors (with help!)', 'Yellow and green crayons', 'Glue stick', 'Green paper for leaves'],
        steps: [
            'Fold your red paper in half, then in half again',
            'Draw a petal shape on the folded edge — half a heart shape works great!',
            'Cut it out — when you unfold you\'ll have a flower!',
            'Make a tiny yellow ball of paper for the centre and glue it on',
            'Cut leaf shapes from green paper and glue them behind',
            'Your hibiscus is ready — put it in a glass as a decoration!'
        ],
        tip: 'The hibiscus is the national flower of Malaysia AND is loved across the Caribbean. In Jamaica they make a sweet drink called Sorrel from it!',
        rewardXp: 85,
        color: 'from-red-400 to-pink-500',
    },
    {
        id: 'craft-parrot',
        title: 'Rainbow Parrot',
        description: 'Make a colourful Caribbean parrot — parrots are famous birds of the islands and symbols of the rainforest!',
        icon: '🦜',
        category: 'nature',
        difficulty: 'easy',
        ageMin: 3,
        ageMax: 8,
        materials: ['Coloured paper (red, green, yellow, blue)', 'Scissors (with help!)', 'Glue', 'Black marker', 'A straw or stick (for perching!)'],
        steps: [
            'Cut a large teardrop shape from green paper — this is the body',
            'Cut two wing shapes from red and yellow paper',
            'Cut a small triangle for the beak from orange paper',
            'Cut a long thin tail from blue paper',
            'Glue wings on each side, beak at the front, tail at the bottom',
            'Draw a big round eye with your black marker',
            'Tape your parrot to a straw so it can "perch" on your finger!'
        ],
        tip: 'The Sisserou Parrot is the national bird of Dominica and found nowhere else on Earth!',
        rewardXp: 70,
        color: 'from-green-400 to-emerald-500',
    },
    {
        id: 'craft-kite',
        title: 'Island Kite',
        description: 'Build a simple kite — flying kites is a beloved Easter tradition across the Caribbean, especially in Guyana and Barbados!',
        icon: '🪁',
        category: 'culture',
        difficulty: 'medium',
        ageMin: 5,
        ageMax: 9,
        materials: ['One sheet of thick paper or light card', 'Two thin sticks or skewers', 'String or yarn', 'Tape', 'Ribbon for the tail', 'Crayons to decorate'],
        steps: [
            'Draw a large diamond shape on your paper and cut it out',
            'Decorate it with bright Caribbean colours and patterns — suns, waves, or flags!',
            'Tape one stick across the middle (wide way) and one stick down the middle',
            'Tie a long piece of string to the crossing point at the front',
            'Tape a ribbon at the bottom point for the tail',
            'Go outside on a windy day and run to make it fly!'
        ],
        tip: 'In Guyana, people fly kites every Easter Monday. The kites can be up to 10 feet tall!',
        rewardXp: 90,
        color: 'from-sky-400 to-blue-500',
    },
    {
        id: 'craft-coconut-bowl',
        title: 'Paper Coconut Bowl',
        description: 'Make a coconut craft and learn about one of the most useful trees in the entire Caribbean — the coconut palm!',
        icon: '🥥',
        category: 'food',
        difficulty: 'easy',
        ageMin: 3,
        ageMax: 7,
        materials: ['Brown paper or card', 'Scissors (with help!)', 'White and brown crayons', 'Glue', 'Cotton wool or white tissue paper'],
        steps: [
            'Cut a large circle from brown paper — this is your coconut half',
            'Colour the outside brown with dark speckles',
            'Glue white cotton wool or scrunched tissue paper inside — that\'s the coconut flesh!',
            'Cut small green leaf shapes from green paper',
            'Arrange the leaves around the coconut to look like it just fell from a palm tree',
            'Draw a smiley face on your coconut — now it\'s a coconut character!'
        ],
        tip: 'In the Caribbean, every part of the coconut is used: the water to drink, the flesh to eat, the shell for crafts, and the leaves for weaving!',
        rewardXp: 65,
        color: 'from-amber-500 to-yellow-500',
    },
];



