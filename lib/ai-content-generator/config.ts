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
        { id: "JM", name: "Jamaica", nickname: "Land of Wood and Water", colors: ["green", "gold", "black"] },
        { id: "TT", name: "Trinidad and Tobago", nickname: "Land of the Hummingbird", colors: ["red", "white", "black"] },
        { id: "BB", name: "Barbados", nickname: "Pride and Industry", colors: ["ultramarine", "gold"] },
        { id: "LC", name: "Saint Lucia", nickname: "Helen of the West", colors: ["cerulean", "gold", "black", "white"] },
        { id: "GD", name: "Grenada", nickname: "Spice Isle", colors: ["green", "gold", "red"] },
        { id: "AG", name: "Antigua and Barbuda", nickname: "Land of 365 Beaches", colors: ["red", "white", "blue", "gold"] },
        { id: "DM", name: "Dominica", nickname: "Nature Island", colors: ["green", "yellow", "black", "white", "red"] },
        { id: "VC", name: "Saint Vincent and the Grenadines", nickname: "Land of the Blessed", colors: ["blue", "gold", "green"] },
        { id: "GY", name: "Guyana", nickname: "Land of Many Waters", colors: ["green", "gold", "red", "black", "white"] },
        { id: "BS", name: "Bahamas", nickname: "March On, Bahamaland", colors: ["aquamarine", "gold", "black"] },
    ],

    themes: [
        "family values and legacy",
        "Caribbean food and flavors",
        "music, drums, and rhythm",
        "traditions and festivals",
        "respect for elders (Granny/Grampa)",
        "kindness, sharing, and community",
        "carnival and masquerade history",
        "nature, sea life, and environment",
        "cultural heritage and ancestry",
        "community spirit and 'village' life",
        "entrepreneurship and market vendors",
        "folklore characters (Anansi, etc. - keeping it safe)",
    ],

    ageGroups: {
        mini: {
            min: 3,
            max: 5,
            wordCount: 300,
            readingTime: 3,
            difficulty: 1,
            tier: "starter_mailer",
            pedagogy: "Focus on repetition, phonics, simple emotions, and vibrant colors.",
        },
        big: {
            min: 6,
            max: 8,
            wordCount: 750,
            readingTime: 7,
            difficulty: 3,
            tier: "legends_plus",
            pedagogy: "Focus on character development, problem solving, cultural history, and complex Patois integration.",
        },
    },
};

// Character profiles for consistent image generation
export const CHARACTER_PROFILES = {
    "tanty_spice": {
        name: "Tanty Spice",
        description: "Warm elderly Caribbean grandmother with a round face, kind twinkling eyes, colorful headwrap, floral dress, warm brown skin, and a gentle smile",
        personality: "Wise, loving, storyteller, patient, nurturing. Uses 'my child' and 'sweetheart'.",
        basePrompt: "An elderly Caribbean grandmother named Tanty Spice with a warm round face, kind eyes, colorful traditional headwrap, vibrant floral dress, warm brown skin, smiling warmly",
        style: "vibrant children's book illustration, soft watercolor style, warm colors",
        voice_bible: "Slow, rhythmic, warm, melodic Caribbean accent.",
    },

    "captain_calypso": {
        name: "Captain Calypso",
        description: "Cheerful Caribbean fisherman with dark skin, grey beard, straw hat, bright shirt, and weathered hands",
        personality: "Adventurous, musical, wise, ocean-loving. Speaks in nautical metaphors.",
        basePrompt: "A cheerful Caribbean fisherman with dark skin, grey beard, traditional straw hat, bright patterned shirt, weathered hands, standing near the ocean",
        style: "vibrant children's book illustration, soft watercolor style, ocean blues and greens",
        voice_bible: "Deep, gravelly but friendly, rhythmic with a lilt.",
    },

    "miss_melody": {
        name: "Miss Melody",
        description: "Young Caribbean teacher with brown skin, natural curly hair, bright smile, colorful dress, and music notes around her",
        personality: "Energetic, creative, musical, encouraging. Uses rhymes in speech.",
        basePrompt: "A young Caribbean teacher with brown skin, beautiful natural curly hair, bright smile, colorful flowing dress, surrounded by music notes",
        style: "vibrant children's book illustration, soft watercolor style, musical and joyful",
        voice_bible: "High-pitched, energetic, musical, clear enunciation.",
    },

    "rasta_ray": {
        name: "Rasta Ray",
        description: "Friendly Rastafarian drummer with dreadlocks, red-gold-green colors, and steelpan drums",
        personality: "Peaceful, rhythmic, cultural, spiritual. Uses 'I and I' safely and emphasizes one love.",
        basePrompt: "A friendly Rastafarian musician with long dreadlocks, wearing red-gold-green colors, playing steelpan drums with joy",
        style: "vibrant children's book illustration, soft watercolor style, reggae colors",
        voice_bible: "Smooth, deep, cool, very rhythmic.",
    },
};

// Patois/Creole words database - EXPANDED
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
        { word: "tallawah", meaning: "strong/sturdy", pronunciation: "TALL-ah-wah" },
        { word: "soon come", meaning: "coming later", pronunciation: "SOON come" },
    ],

    "Trinidad and Tobago": [
        { word: "lime", meaning: "hang out/relax", pronunciation: "LIME" },
        { word: "mamaguy", meaning: "to tease", pronunciation: "MAH-mah-guy" },
        { word: "tabanca", meaning: "heartbroken", pronunciation: "tah-BAN-kah" },
        { word: "maco", meaning: "nosy/gossip", pronunciation: "MAH-koh" },
        { word: "bacchanal", meaning: "confusion/drama", pronunciation: "BACK-ah-nal" },
        { word: "fete", meaning: "party", pronunciation: "FETE" },
        { word: "tabanca", meaning: "sadness over love", pronunciation: "tah-ban-ka" },
    ],

    Barbados: [
        { word: "wunna", meaning: "you all", pronunciation: "WUN-nah" },
        { word: "lime", meaning: "hang out", pronunciation: "LIME" },
        { word: "real", meaning: "very", pronunciation: "REAL" },
        { word: "bout hay", meaning: "around here", pronunciation: "bout HAY" },
        { word: "cheese-on-bread", meaning: "wow/goodness", pronunciation: "cheese-on-bread" },
    ],
};

// Image style guidelines - WORLD CLASS
export const IMAGE_STYLE = {
    base: "Professional award-winning children's book illustration style, Pixar-meets-watercolor, vibrant Caribbean lighting, highly detailed characters with expressive faces.",
    palette: "Saturated island colors: Hibiscus Pink, Caribbean Turquoise, Sunshine Yellow, Jungle Green, Deep Mahogany.",
    mood: "Whimsical, warm, educational, magical but grounded in real island scenery.",
    quality: "Masterpiece quality, clean lines, child-friendly proportions, no distorted text or hands.",
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
