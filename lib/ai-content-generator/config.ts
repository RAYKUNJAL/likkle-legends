// AI Content Generator Configuration
// Defines content generation rules, themes, and character profiles

export const CONTENT_CONFIG = {
    generation: {
        storiesPerDay: 1,
        songsPerDay: 2,
        videosPerWeek: 2,
        missionsPerWeek: 1,
    },

    islands: [
        "Jamaica",
        "Trinidad and Tobago",
        "Barbados",
        "Saint Lucia",
        "Grenada",
        "Antigua and Barbuda",
        "Dominica",
        "Saint Vincent and the Grenadines",
    ],

    themes: [
        "family values",
        "Caribbean food",
        "music and dance",
        "traditions and festivals",
        "respect for elders",
        "kindness and sharing",
        "carnival celebrations",
        "nature and environment",
        "cultural heritage",
        "community spirit",
    ],

    ageGroups: {
        mini: {
            min: 3,
            max: 5,
            wordCount: 250,
            readingTime: 3,
            difficulty: 1,
            tier: "starter_mailer",
        },
        big: {
            min: 6,
            max: 8,
            wordCount: 650,
            readingTime: 7,
            difficulty: 3,
            tier: "legends_plus",
        },
    },
};

// Character profiles for consistent image generation
export const CHARACTER_PROFILES = {
    "Tanty Spice": {
        name: "Tanty Spice",
        description: "Warm elderly Caribbean grandmother with a round face, kind twinkling eyes, colorful headwrap, floral dress, warm brown skin, and a gentle smile",
        personality: "Wise, loving, storyteller, patient, nurturing",
        basePrompt: "An elderly Caribbean grandmother named Tanty Spice with a warm round face, kind eyes, colorful traditional headwrap, vibrant floral dress, warm brown skin, smiling warmly",
        style: "vibrant children's book illustration, soft watercolor style, warm colors",
    },

    "Captain Calypso": {
        name: "Captain Calypso",
        description: "Cheerful Caribbean fisherman with dark skin, grey beard, straw hat, bright shirt, and weathered hands",
        personality: "Adventurous, musical, wise, ocean-loving",
        basePrompt: "A cheerful Caribbean fisherman with dark skin, grey beard, traditional straw hat, bright patterned shirt, weathered hands, standing near the ocean",
        style: "vibrant children's book illustration, soft watercolor style, ocean blues and greens",
    },

    "Miss Melody": {
        name: "Miss Melody",
        description: "Young Caribbean teacher with brown skin, natural curly hair, bright smile, colorful dress, and music notes around her",
        personality: "Energetic, creative, musical, encouraging",
        basePrompt: "A young Caribbean teacher with brown skin, beautiful natural curly hair, bright smile, colorful flowing dress, surrounded by music notes",
        style: "vibrant children's book illustration, soft watercolor style, musical and joyful",
    },

    "Rasta Ray": {
        name: "Rasta Ray",
        description: "Friendly Rastafarian drummer with dreadlocks, red-gold-green colors, and steelpan drums",
        personality: "Peaceful, rhythmic, cultural, spiritual",
        basePrompt: "A friendly Rastafarian musician with long dreadlocks, wearing red-gold-green colors, playing steelpan drums with joy",
        style: "vibrant children's book illustration, soft watercolor style, reggae colors",
    },
};

// Patois/Creole words database for stories
export const PATOIS_WORDS = {
    Jamaica: [
        { word: "pickney", meaning: "child", pronunciation: "PICK-nee" },
        { word: "nyam", meaning: "to eat", pronunciation: "NYAM" },
        { word: "irie", meaning: "feeling good/great", pronunciation: "EYE-ree" },
        { word: "likkle", meaning: "little", pronunciation: "LICK-ul" },
        { word: "yuh", meaning: "you", pronunciation: "YUH" },
        { word: "mi deh yah", meaning: "I'm here", pronunciation: "mee day YAH" },
        { word: "wah gwaan", meaning: "what's going on", pronunciation: "WAH gwaan" },
        { word: "big up", meaning: "respect/praise", pronunciation: "BIG up" },
    ],

    "Trinidad and Tobago": [
        { word: "lime", meaning: "hang out/relax", pronunciation: "LIME" },
        { word: "mamaguy", meaning: "to tease", pronunciation: "MAH-mah-guy" },
        { word: "tabanca", meaning: "heartbroken", pronunciation: "tah-BAN-kah" },
        { word: "maco", meaning: "nosy/gossip", pronunciation: "MAH-koh" },
        { word: "bacchanal", meaning: "confusion/drama", pronunciation: "BACK-ah-nal" },
    ],

    Barbados: [
        { word: "wunna", meaning: "you all", pronunciation: "WUN-nah" },
        { word: "lime", meaning: "hang out", pronunciation: "LIME" },
        { word: "real", meaning: "very", pronunciation: "REAL" },
        { word: "bout hay", meaning: "around here", pronunciation: "bout HAY" },
    ],
};

// Story themes with cultural elements
export const STORY_THEMES = [
    {
        theme: "Carnival Preparation",
        setting: "Village preparing for carnival",
        lesson: "Community cooperation and creativity",
        culturalElements: ["costume making", "calypso music", "steelpan practice"],
    },
    {
        theme: "Market Day Adventure",
        setting: "Colorful Caribbean market",
        lesson: "Counting, colors, healthy eating",
        culturalElements: ["tropical fruits", "vendors", "bargaining"],
    },
    {
        theme: "Beach Day Discovery",
        setting: "Beautiful Caribbean beach",
        lesson: "Ocean conservation and nature respect",
        culturalElements: ["coconut trees", "sea creatures", "sand castles"],
    },
    {
        theme: "Grandparent Stories",
        setting: "On the porch with elders",
        lesson: "Respecting elders and family history",
        culturalElements: ["storytelling tradition", "family recipes", "wise sayings"],
    },
    {
        theme: "Cooking with Family",
        setting: "Traditional Caribbean kitchen",
        lesson: "Following instructions and patience",
        culturalElements: ["traditional dishes", "spices", "cooking together"],
    },
];

// Image style guidelines
export const IMAGE_STYLE = {
    base: "Vibrant children's book illustration style, soft watercolor technique, warm Caribbean colors",
    palette: "Bright blues, sunny yellows, tropical greens, warm browns, vibrant pinks and oranges",
    mood: "Warm, inviting, joyful, culturally authentic, age-appropriate",
    quality: "High quality, detailed but not overwhelming, child-friendly proportions",
};
