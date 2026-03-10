export interface StoryCharacter {
    name: string;
    role: string;
    traits: string[];
    core_lessons: string[];
}

export interface TargetAgeGroup {
    range: string;
    word_count: number;
}

export const ISLAND_CHARACTERS: StoryCharacter[] = [
    {
        name: "Dilly Doubles",
        role: "fun-loving street food hero",
        traits: ["curious", "friendly", "adventurous"],
        core_lessons: ["sharing", "friendship", "teamwork"]
    },
    {
        name: "Tanty Spice",
        role: "wise grandmother storyteller",
        traits: ["wise", "warm", "funny"],
        core_lessons: ["culture", "history", "traditions"]
    },
    {
        name: "R.O.T.I.",
        role: "tech wizard learning robot",
        traits: ["smart", "curious", "inventive"],
        core_lessons: ["science", "coding", "problem solving"]
    },
    {
        name: "Steelpan Sam",
        role: "musical friend",
        traits: ["rhythmic", "energetic"],
        core_lessons: ["music", "creativity"]
    },
    {
        name: "Mango Moko",
        role: "stilt walking protector",
        traits: ["tall", "watchful", "kind"],
        core_lessons: ["courage", "community"]
    },
    {
        name: "Benny Shadowbenny",
        role: "mysterious trickster",
        traits: ["playful", "clever"],
        core_lessons: ["thinking", "problem solving"]
    },
    {
        name: "Scorcha Pepper",
        role: "spicy energetic friend",
        traits: ["bold", "fast", "excitable"],
        core_lessons: ["confidence", "energy"]
    }
];

export const TARGET_AGE_GROUPS: TargetAgeGroup[] = [
    { range: "3-4", word_count: 150 },
    { range: "5-6", word_count: 350 },
    { range: "7-9", word_count: 700 }
];

export const ISLANDS: string[] = [
    "Trinidad and Tobago",
    "Jamaica",
    "Barbados",
    "Dominican Republic",
    "Haiti",
    "Grenada",
    "St Lucia",
    "Antigua",
    "Bahamas",
    "Guyana"
];

export const CATEGORIES: string[] = [
    "Adventure",
    "Friendship",
    "Animals",
    "Learning",
    "Island History",
    "Food Stories",
    "Music and Carnival",
    "Bedtime Stories",
    "Science and Nature"
];

export const INITIAL_STORYBOOKS: string[] = [
    "Dilly Doubles Opens a Beach Shop",
    "The Brave Leatherback Turtle",
    "Tanty Spice and the Breadfruit Tree",
    "R.O.T.I. Learns to Count Coconuts",
    "The Mystery of the Missing Mango",
    "The Monkey Who Stole the Steelpan",
    "The Day the Ocean Turned Blue",
    "The Dancing Pepper Festival",
    "Anansi and the Coconut Race",
    "The Little Crab Who Loved Music",
    "The Island of Singing Frogs",
    "The Secret Cave of Tobago",
    "The Day the Hummingbird Saved the Garden",
    "The Carnival Color Adventure",
    "R.O.T.I. and the Island Computer",
    "The Friendly Soucouyant",
    "The Pirate Shark Treasure",
    "The Mango Tree School",
    "The Island Weather Machine",
    "The Turtle Who Found His Way Home",
    "Dilly Doubles and the Chickpea Storm",
    "The Flying Coconut Mystery",
    "Steelpan Sam and the Music Parade",
    "The Friendly Breadfruit Giant",
    "The Crab Who Built a Sandcastle City",
    "The Mango That Rolled Away",
    "The Little Pelican Pilot",
    "The Day the Banana Boat Sank",
    "The Secret Island Garden",
    "Tanty Spice's Story Night"
];

export const AI_STORY_PROMPT_TEMPLATE = {
    instruction: "Write a Caribbean children's story for ages {age_group}.",
    requirements: [
        "Use simple language",
        "Include one main lesson",
        "Feature at least one Likkle Legends character",
        "Set the story on a Caribbean island",
        "Structure story into 10 pages",
        "Each page under 80 words"
    ]
};

export const WEEKLY_CONTENT_ENGINE = {
    schedule: "every_7_days",
    workflow: [
        "generate_new_story",
        "generate_illustration_prompts",
        "store_in_database",
        "publish_to_portal",
        "announce_new_book_banner"
    ]
};

export const GAMIFICATION_PASSPORT = {
    feature: "Island Passport",
    description: "Kids earn stamps when reading books from different islands",
    reward_types: [
        "island_stamps",
        "unlock_new_songs",
        "unlock_coloring_pages",
        "unlock_bonus_stories"
    ]
};
