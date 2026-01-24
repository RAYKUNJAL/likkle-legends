
export interface IslandPack {
    id: string;
    display_name: string;
    adjective: string;
    overview: string;
    cultural_traits: {
        values: string[];
        festivals: string[];
        music_styles: string[];
        foods: string[];
    };
    symbols: {
        national_bird?: string;
        national_flower?: string;
        landmarks: string[];
    };
    dialect: {
        vocabulary: { word: string; meaning: string; usage: string }[];
        phrases: { phrase: string; meaning: string }[];
    };
    safe_topics: string[];
}

export const ISLAND_REGISTRY: Record<string, IslandPack> = {
    // === Greater Antilles ===
    "CU": {
        id: "CU",
        display_name: "Cuba",
        adjective: "Cuban",
        overview: "The largest Caribbean island, famous for its music, classic cars, and colonial architecture.",
        cultural_traits: {
            values: ["Family", "Music", "Resilience"],
            festivals: ["Carnaval de Santiago de Cuba", "Havana Jazz Festival"],
            music_styles: ["Son", "Salsa", "Rumba", "Mambo"],
            foods: ["Ropa Vieja", "Arroz con Pollo", "Yuca con Mojo", "Sandwich Cubano"]
        },
        symbols: {
            national_bird: "Tococoro",
            national_flower: "Mariposa (White Ginger)",
            landmarks: ["Old Havana", "Varadero Beach", "Viñales Valley", "El Morro"]
        },
        dialect: {
            vocabulary: [
                { word: "Asere", meaning: "Friend/Buddy", usage: "¿Qué bolá, asere?" },
                { word: "Yuma", meaning: "Foreigner", usage: "Look at the Yuma." }
            ],
            phrases: [
                { phrase: "¿Qué bolá?", meaning: "What's up?" }
            ]
        },
        safe_topics: ["Music & Dance", "Beaches", "Classic Cars", "Architecture"]
    },
    "JM": {
        id: "JM",
        display_name: "Jamaica",
        adjective: "Jamaican",
        overview: "The cultural powerhouse known for Reggae, Blue Mountains, and warm vibes.",
        cultural_traits: {
            values: ["Respect", "Hard work", "Spirituality", "Boldness"],
            festivals: ["Independence Day", "Emancipation Day", "Reggae Sumfest"],
            music_styles: ["Reggae", "Dancehall", "Mento", "Ska"],
            foods: ["Ackee and Saltfish", "Jerk Chicken", "Curry Goat", "Escovitch Fish", "Bammy"]
        },
        symbols: {
            national_bird: "Doctor Bird (Hummingbird)",
            national_flower: "Lignum Vitae",
            landmarks: ["Blue Mountains", "Dunn's River Falls", "Port Royal", "Seven Mile Beach"]
        },
        dialect: {
            vocabulary: [
                { word: "Irie", meaning: "Good, pleasing, nice", usage: "Everything irie." },
                { word: "Pickney", meaning: "Child", usage: "The pickney them playing." },
                { word: "Nyam", meaning: "Eat", usage: "Time to nyam some food." },
                { word: "Small up", meaning: "Make room", usage: "Small up yuhself nuh." }
            ],
            phrases: [
                { phrase: "Wah gwaan", meaning: "What's up? / How are you?" },
                { phrase: "Likkle more", meaning: "See you later" },
                { phrase: "No problem man", meaning: "You're welcome / It's okay" }
            ]
        },
        safe_topics: ["Track and field", "Blue Mountains", "Reggae music", "Farming", "Storytelling (Anansi)"]
    },
    "HT": {
        id: "HT",
        display_name: "Haiti",
        adjective: "Haitian",
        overview: "The first independent black republic, rich in history, art, and mountain landscapes.",
        cultural_traits: {
            values: ["Freedom", "Community", "Art"],
            festivals: ["Carnival of Flowers", "Rara"],
            music_styles: ["Kompa", "Rara", "Mizik Rasin"],
            foods: ["Soup Joumou", "Griot", "Diri ak Djon Djon"]
        },
        symbols: {
            national_bird: "Hispaniolan Trogon",
            national_flower: "Hibiscus",
            landmarks: ["Citadelle Laferrière", "Sans-Souci Palace", "Bassin Bleu"]
        },
        dialect: {
            vocabulary: [
                { word: "Sak pase", meaning: "What's up?", usage: "Sak pase? N'ap boule." },
                { word: "Bagay", meaning: "Thing/Stuff", usage: "Bon bagay (Good thing)." }
            ],
            phrases: [
                { phrase: "N'ap boule", meaning: "We're burning (I'm good)" }
            ]
        },
        safe_topics: ["History", "Art (Painting)", "Fortresses", "Mountains"]
    },
    "DO": {
        id: "DO",
        display_name: "Dominican Republic",
        adjective: "Dominican",
        overview: "Famous for its diverse landscapes, from pico Duarte to white sandy beaches, and Merengue.",
        cultural_traits: {
            values: ["Joy", "Hospitality", "Baseball"],
            festivals: ["Carnival", "Merengue Festival"],
            music_styles: ["Merengue", "Bachata"],
            foods: ["Mangu", "Sancocho", "La Bandera"]
        },
        symbols: {
            national_bird: "Palmchat",
            national_flower: "Bayahibe Rose",
            landmarks: ["Zona Colonial", "Pico Duarte", "Punta Cana"]
        },
        dialect: {
            vocabulary: [
                { word: "Vaina", meaning: "Thing", usage: "Dame esa vaina." },
                { word: "Jevito", meaning: "Preppy", usage: "El es un jevito." }
            ],
            phrases: [
                { phrase: "¿Qué lo qué?", meaning: "What's up?" }
            ]
        },
        safe_topics: ["Baseball", "Beaches", "Music", "History"]
    },
    "PR": {
        id: "PR",
        display_name: "Puerto Rico",
        adjective: "Puerto Rican",
        overview: "The Island of Enchantment, a US territory with a strong Spanish-Caribbean culture.",
        cultural_traits: {
            values: ["Family", "Music", "Pride"],
            festivals: ["Fiestas de la Calle San Sebastián", "San Juan Bautista"],
            music_styles: ["Salsa", "Reggaeton", "Bomba", "Plena"],
            foods: ["Mofongo", "Arroz con Gandules", "Lechón", "Pasteles"]
        },
        symbols: {
            national_bird: "Puerto Rican Spindalis",
            national_flower: "Maga",
            landmarks: ["El Morro", "El Yunque Rainforest", "Vieques Bio Bay"]
        },
        dialect: {
            vocabulary: [
                { word: "Boricua", meaning: "Puerto Rican", usage: "Soy Boricua pa que tu lo sepas." },
                { word: "Janguear", meaning: "To hang out", usage: "Vamos a janguear." }
            ],
            phrases: [
                { phrase: "Ay bendito", meaning: "Oh my goodness / Poor thing" }
            ]
        },
        safe_topics: ["Rainforest (El Yunque)", "Forts", "Beaches", "Coquí frogs"]
    },
    "KY": {
        id: "KY",
        display_name: "Cayman Islands",
        adjective: "Caymanian",
        overview: "Famous for banking, turtles, and Stingray City.",
        cultural_traits: {
            values: ["Maritime heritage", "Conservation", "Hospitality"],
            festivals: ["Pirates Week"],
            music_styles: ["Kitchen band music", "Calypso"],
            foods: ["Turtle Stew (Traditional)", "Conch Stew", "Cayman Style Beef"]
        },
        symbols: {
            national_bird: "Grand Cayman Parrot",
            national_flower: "Wild Banana Orchid",
            landmarks: ["Seven Mile Beach", "Stingray City", "Turtle Centre"]
        },
        dialect: {
            vocabulary: [], // To be populated
            phrases: []
        },
        safe_topics: ["Marine life", "Stingrays", "Turtles", "Beaches"]
    },

    // === Lesser Antilles Leeward ===
    "AG": {
        id: "AG",
        display_name: "Antigua and Barbuda",
        adjective: "Antiguan / Barbudan",
        overview: "Land of 365 beaches, one for every day of the year.",
        cultural_traits: {
            values: ["Sea-loving", "Hospitality", "Resilience"],
            festivals: ["Antigua Carnival", "Sailing Week"],
            music_styles: ["Soca", "Calypso", "Steelpan"],
            foods: ["Fungee and Pepperpot", "Ducana", "Saltfish", "Lobster"]
        },
        symbols: {
            national_bird: "Frigate Bird",
            national_flower: "Dagger Log",
            landmarks: ["Shirley Heights", "Nelson's Dockyard", "Devil's Bridge", "Pink Sand Beach (Barbuda)"]
        },
        dialect: {
            vocabulary: [
                { word: "Me na know", meaning: "I don't know", usage: "Me na know bout dat." },
                { word: "Chupit", meaning: "Silly/Stupid", usage: "Don't act chupit." }
            ],
            phrases: [
                { phrase: "Wha you a say?", meaning: "What are you saying?" }
            ]
        },
        safe_topics: ["Sailing", "Beaches", "History/Dockyard", "Frigate birds"]
    },
    "KN": {
        id: "KN",
        display_name: "Saint Kitts and Nevis",
        adjective: "Kittitian / Nevisian",
        overview: "Two islands, one paradise. Known for Brimstone Hill and lush mountains.",
        cultural_traits: {
            values: ["Community", "History"],
            festivals: ["Sugar Mas (Carnival)", "Culturama (Nevis)"],
            music_styles: ["Soca", "Calypso"],
            foods: ["Stewed Saltfish", "Spicy Plantains", "Coconut Dumpling"]
        },
        symbols: {
            national_bird: "Brown Pelican",
            national_flower: "Poinciana",
            landmarks: ["Brimstone Hill Fortress", "Mount Liamuiga"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["History (Fortress)", "Monkeys", "Volcano hike"]
    },
    "MS": {
        id: "MS",
        display_name: "Montserrat",
        adjective: "Montserratian",
        overview: "The Emerald Isle of the Caribbean, known for its volcano and Irish heritage.",
        cultural_traits: {
            values: ["Resilience"],
            festivals: ["St. Patrick's Festival", "Calabash Festival"],
            music_styles: ["Soca", "Calypso"],
            foods: ["Goat Water", "Duckna"]
        },
        symbols: {
            national_bird: "Montserrat Oriole",
            national_flower: "Heliconia",
            landmarks: ["Soufrière Hills Volcano", "Rendezvous Bay"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Volcano science", "Irish heritage", "Hiking"]
    },
    "GP": {
        id: "GP",
        display_name: "Guadeloupe",
        adjective: "Guadeloupean",
        overview: "A French overseas region shaped like a butterfly.",
        cultural_traits: {
            values: ["Creole culture", "Gastronomy"],
            festivals: ["Carnival", "Fête des Cuisinières"],
            music_styles: ["Gwo Ka", "Zouk"],
            foods: ["Bokit", "Accras", "Colombo de poulet"]
        },
        symbols: {
            landmarks: ["La Soufrière", "Les Saintes", "Carbet Falls"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Volcano", "Creole food", "Beaches"]
    },
    "BL": {
        id: "BL",
        display_name: "Saint Barthélemy",
        adjective: "Saint Barth",
        overview: "A chic French island known for white-sand beaches and designer shops.",
        cultural_traits: {
            values: ["Luxury", "Tranquility"],
            festivals: ["Music Festival", "Gourmet Festival"],
            music_styles: ["Caribbean", "French"],
            foods: ["French cuisine", "Seafood"]
        },
        symbols: {
            landmarks: ["Gustavia", "Shell Beach"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Beaches", "Sailing", "Marine life"]
    },
    "MF": { // French Side
        id: "MF",
        display_name: "Saint Martin",
        adjective: "Saint-Martinois",
        overview: "The French side of the dual-nation island, known for nudist beaches (safe: beaches in general) and cuisine.",
        cultural_traits: {
            values: ["Gastronomy"],
            festivals: ["Carnival"],
            music_styles: ["Soca", "Zouk"],
            foods: ["Johnny Cakes", "Callaloo", "French Pastries"]
        },
        symbols: {
            landmarks: ["Orient Bay", "Pic Paradis"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Food", "Beaches", "Markets"]
    },
    "SX": { // Dutch Side
        id: "SX",
        display_name: "Sint Maarten",
        adjective: "Sint Maartener",
        overview: "The Dutch side, known for festive nightlife and Maho Beach planes.",
        cultural_traits: {
            values: ["Diversity", "Energy"],
            festivals: ["Carnival", "Heineken Regatta"],
            music_styles: ["Soca", "Calypso"],
            foods: ["Conch and Dumplings", "Spareribs"]
        },
        symbols: {
            landmarks: ["Maho Beach", "Philipsburg"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Planes (Maho Beach)", "Boating", "Beaches"]
    },
    "AI": {
        id: "AI",
        display_name: "Anguilla",
        adjective: "Anguillian",
        overview: "Tranquil island known for spectacular coral reefs and beaches.",
        cultural_traits: {
            values: ["Peace", "Sea"],
            festivals: ["Summer Festival", "Festival Del Mar"],
            music_styles: ["Soca", "Reggae"],
            foods: ["Pigeon Peas and Rice", "Grilled Lobster"]
        },
        symbols: {
            national_bird: "Turtle Dove",
            landmarks: ["Shoal Bay", "Little Bay"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Boat racing", "Beaches", "Snorkeling"]
    },

    // === Lesser Antilles Windward ===
    "DM": {
        id: "DM",
        display_name: "Dominica",
        adjective: "Dominican",
        overview: "The Nature Island, filled with rivers, waterfalls, and lush rainforests.",
        cultural_traits: {
            values: ["Nature conservation", "Heritage", "Resilience"],
            festivals: ["World Creole Music Festival", "Mas Domnik (Carnival)"],
            music_styles: ["Bouyon", "Cadence-lypso", "Jing Ping"],
            foods: ["Mountain Chicken (Frog - historical)", "Callaloo", "Dasheen", "Fruit Juices"]
        },
        symbols: {
            national_bird: "Sisserou Parrot",
            national_flower: "Bwa Kwaib (Carib Wood)",
            landmarks: ["Boiling Lake", "Trafalgar Falls", "Emerald Pool", "Indian River"]
        },
        dialect: {
            vocabulary: [
                { word: "Moin", meaning: "Me/I (Creole)", usage: "Moin love Dominica." }
            ],
            phrases: [
                { phrase: "Sa ka fèt", meaning: "How are you?" }
            ]
        },
        safe_topics: ["Hiking", "Whale watching", "Rivers", "Parrots"]
    },
    "LC": {
        id: "LC",
        display_name: "Saint Lucia",
        adjective: "Saint Lucian",
        overview: "The Helen of the West Indies, famous for the Pitons and drive-in volcano.",
        cultural_traits: {
            values: ["Adventure", "Romance", "Creole heritage"],
            festivals: ["Saint Lucia Jazz", "Carnival", "Jounen Kwéyòl (Creole Day)"],
            music_styles: ["Dennery Segment", "Soca", "Country & Western", "Folk"],
            foods: ["Green Figs and Saltfish", "Bouyon", "Breadfruit", "Cocoa Tea"]
        },
        symbols: {
            national_bird: "Saint Lucia Parrot (Jacquot)",
            national_flower: "Rose and the Marguerite",
            landmarks: ["The Pitons", "Sulphur Springs", "Pigeon Island", "Marigot Bay"]
        },
        dialect: {
            vocabulary: [
                { word: "Sa ka fèt", meaning: "How are you? (Creole)", usage: "Sa ka fèt mon ami?" },
                { word: "Oui papa", meaning: "Yes indeed / Wow", usage: "Oui papa, that nice!" }
            ],
            phrases: [
                { phrase: "Tout bagai correck", meaning: "Everything is good" }
            ]
        },
        safe_topics: ["Volcanoes", "Cocoa farming", "Parrots", "Snorkeling", "Hiking"]
    },
    "VC": {
        id: "VC",
        display_name: "Saint Vincent and the Grenadines",
        adjective: "Vincentian",
        overview: "A chain of beautiful islands known for sailing and the La Soufrière volcano.",
        cultural_traits: {
            values: ["Sailing", "Farming", "Independence"],
            festivals: ["Vincy Mas", "Nine Mornings Festival"],
            music_styles: ["Soca", "Calypso", "Reggae"],
            foods: ["Roasted Breadfruit and Fried Jackfish", "Arrowroot", "Madongo Dumplings"]
        },
        symbols: {
            national_bird: "Saint Vincent Parrot",
            national_flower: "Soufriere Tree",
            landmarks: ["La Soufrière Volcano", "Tobago Cays", "Botanical Gardens"]
        },
        dialect: {
            vocabulary: [
                { word: "Dey", meaning: "There", usage: "It dey over so." }
            ],
            phrases: [
                { phrase: "Wha you saying?", meaning: "How are you?" }
            ]
        },
        safe_topics: ["Sailing", "Volcano", "Botanical Gardens", "Marine life"]
    },
    "GD": {
        id: "GD",
        display_name: "Grenada",
        adjective: "Grenadian",
        overview: "The Spice Isle, famous for nutmeg, spices, and beautiful waterfalls.",
        cultural_traits: {
            values: ["Friendliness", "spice farming", "Community"],
            festivals: ["Spicemas (Carnival)", "Nutmeg Festival"],
            music_styles: ["Jab Jab Soca", "Calypso", "Steelpan"],
            foods: ["Oil Down", "Nutmeg Ice Cream", "Callaloo Soup", "Roti"]
        },
        symbols: {
            national_bird: "Grenada Dove",
            national_flower: "Bougainvillea",
            landmarks: ["Grand Anse Beach", "Annandale Falls", "Underwater Sculpture Park", "Fort George"]
        },
        dialect: {
            vocabulary: [
                { word: "Lime", meaning: "Hang out", usage: "Leh we lime." },
                { word: "Vaps", meaning: "Sudden feeling or vibe", usage: "I catch a vaps to go beach." }
            ],
            phrases: [
                { phrase: "Ah there", meaning: "I'm good/here" }
            ]
        },
        safe_topics: ["Spices (Nutmeg)", "Waterfalls", "Chocolate making", "Sailing"]
    },
    "MQ": {
        id: "MQ",
        display_name: "Martinique",
        adjective: "Martinican",
        overview: "The Island of Flowers, a French region with flair.",
        cultural_traits: {
            values: ["Elegance", "Tradition"],
            festivals: ["Carnival", "Tour des Yoles"],
            music_styles: ["Zouk", "Biguine"],
            foods: ["Colombo", "Accras", "Boudin"]
        },
        symbols: {
            landmarks: ["Mount Pelée", "Diamond Rock"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Flowers", "Volcano", "Sailing", "French Creole"]
    },

    // === Southern Caribbean ===
    "TT": {
        id: "TT",
        display_name: "Trinidad and Tobago",
        adjective: "Trinbagonian",
        overview: "The land of the hummingbird, known for Carnival, steelpan, and beautiful biodiversity.",
        cultural_traits: {
            values: ["Community", "Resilience", "Celebration", "Multi-cultural harmony"],
            festivals: ["Carnival", "Diwali", "Eid", "Christmas", "Tobago Jazz Festival"],
            music_styles: ["Calypso", "Soca", "Steelpan", "Chutney"],
            foods: ["Doubles", "Roti", "Pelau", "Callaloo", "Bake and Shark"]
        },
        symbols: {
            national_bird: "Scarlet Ibis (Trinidad) / Cocrico (Tobago)",
            national_flower: "Chaconia",
            landmarks: ["Pitch Lake", "Buccoo Reef", "Northern Range", "Nylon Pool"]
        },
        dialect: {
            vocabulary: [
                { word: "Lime", meaning: "To hang out or socialize", usage: "We going to lime by the beach." },
                { word: "Mamaguy", meaning: "To tease or joke", usage: "Don't mamaguy me!" },
                { word: "Tabanca", meaning: "A state of sadness or love-sickness", usage: "He has a serious tabanca." },
                { word: "Maco", meaning: "Mind other people's business", usage: "Stop macoing!" },
                { word: "Bacchanal", meaning: "Confusion, drama, or excitement", usage: "It was pure bacchanal." }
            ],
            phrases: [
                { phrase: "Ay ay!", meaning: "Expression of surprise or shock" },
                { phrase: "Wha gine on?", meaning: "What is going on?" },
                { phrase: "Just now", meaning: "In a little while (could be minutes or hours)" }
            ]
        },
        safe_topics: ["Beaches", "Rainforest", "Steelpan making", "Costume design", "Cricket"]
    },
    "AW": {
        id: "AW",
        display_name: "Aruba",
        adjective: "Aruban",
        overview: "One Happy Island, dry, sunny and known for white sands.",
        cultural_traits: {
            values: ["Optimism", "Tourism"],
            festivals: ["Carnival"],
            music_styles: ["Tumba", "Calypso"],
            foods: ["Keshi Yena", "Pan Bati"]
        },
        symbols: {
            national_bird: "Shoco (Owl)",
            landmarks: ["Eagle Beach", "Arikok National Park", "California Lighthouse"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Beaches", "Desert landscapes", "Aloes"]
    },
    "CW": {
        id: "CW",
        display_name: "Curaçao",
        adjective: "Curaçaoan",
        overview: "Famous for its colorful Dutch colonial architecture in Willemstad.",
        cultural_traits: {
            values: ["History", "Art"],
            festivals: ["Carnival", "Seu (Harvest)"],
            music_styles: ["Tumba", "Seú"],
            foods: ["Keshi Yena", "Stoba"]
        },
        symbols: {
            landmarks: ["Handelskade", "Queen Emma Bridge"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Architecture", "Beaches", "History"]
    },
    "BQ": {
        id: "BQ",
        display_name: "Bonaire",
        adjective: "Bonairean",
        overview: "A diver's paradise with a focus on marine conservation.",
        cultural_traits: {
            values: ["Conservation", "Nature"],
            festivals: ["Simadan (Harvest)"],
            music_styles: ["Simadan"],
            foods: ["Fish", "Funchi"]
        },
        symbols: {
            national_bird: "Flamingo",
            landmarks: ["Salt Pier", "Washington Slagbaai Park"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Diving / Snorkeling", "Flamingos", "Salt pans"]
    },

    // === Lucayan Archipelago ===
    "BS": {
        id: "BS",
        display_name: "The Bahamas",
        adjective: "Bahamian",
        overview: "An archipelago of 700 islands with crystal clear waters and swimming pigs.",
        cultural_traits: {
            values: ["Hospitality", "Religion", "Art"],
            festivals: ["Junkanoo", "Regatta"],
            music_styles: ["Rake and Scrape", "Goombay", "Calypso"],
            foods: ["Conch Salad", "Cracked Conch", "Peas n' Rice", "Guava Duff"]
        },
        symbols: {
            national_bird: "Flamingo",
            national_flower: "Yellow Elder",
            landmarks: ["Atlantis", "Dean's Blue Hole", "Exuma Pigs", "Glass Window Bridge"]
        },
        dialect: {
            vocabulary: [
                { word: "Bey", meaning: "Man/Boy", usage: "Hurry up, bey!" },
                { word: "Well mudda sick", meaning: "Expression of surprise", usage: "Well mudda sick!" }
            ],
            phrases: [
                { phrase: "Sip sip", meaning: "Gossip" }
            ]
        },
        safe_topics: ["Ocean conservation", "Junkanoo costumes", "Flamingos", "Pirate history (light)"]
    },
    "TC": {
        id: "TC",
        display_name: "Turks and Caicos Islands",
        adjective: "Turks and Caicos Islander",
        overview: "Beautiful by nature, famous for Grace Bay.",
        cultural_traits: {
            values: ["Relaxation"],
            festivals: ["Maskanoo"],
            music_styles: ["Ripsaw"],
            foods: ["Conch Fritters", "Grits"]
        },
        symbols: {
            national_bird: "Brown Pelican",
            landmarks: ["Grace Bay", "Chalk Sound"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Beaches", "Whales", "Snorkeling"]
    },

    // === Virgin Islands ===
    "VG": {
        id: "VG",
        display_name: "British Virgin Islands",
        adjective: "Virgin Islander",
        overview: "Nature's Little Secrets, a sailing capital.",
        cultural_traits: {
            values: ["Sailing"],
            festivals: ["Emancipation Festival"],
            music_styles: ["Fungi"],
            foods: ["Fish and Fungi"]
        },
        symbols: {
            national_bird: "Mourning Dove",
            landmarks: ["The Baths", "Sage Mountain"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Sailing", "Baths", "Beaches"]
    },
    "VI": {
        id: "VI",
        display_name: "U.S. Virgin Islands",
        adjective: "Virgin Islander",
        overview: "America's Caribbean Paradise (St. Thomas, St. John, St. Croix).",
        cultural_traits: {
            values: ["Resilience"],
            festivals: ["Carnival"],
            music_styles: ["Quelbe"],
            foods: ["Pater", "Johnny Cake"]
        },
        symbols: {
            national_bird: "Bananaquit",
            landmarks: ["Trunk Bay", "Charlotte Amalie", "Christiansted"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["National Parks", "History", "Beaches"]
    },

    // === Associated ===
    "PM": {
        id: "PM",
        display_name: "Saint Pierre and Miquelon",
        adjective: "Saint-Pierrais",
        overview: "A slice of France in North America (near Newfoundland, included for completeness).",
        cultural_traits: {
            values: ["French tradition"],
            festivals: ["Bastille Day", "Basque Festival"],
            music_styles: ["French"],
            foods: ["Seafood", "French Cuisine"]
        },
        symbols: {
            landmarks: ["L'Arche Museum"]
        },
        dialect: { vocabulary: [], phrases: [] },
        safe_topics: ["Fishing", "French culture"]
    }
};

export function getIslandContext(islandId: string): string {
    const island = ISLAND_REGISTRY[islandId];
    if (!island) return "";

    return `
    ISLAND CONTEXT: ${island.display_name} (${island.adjective})
    KEY SYMBOLS: ${island.symbols.national_bird || ''}, ${island.symbols.landmarks.join(", ")}.
    MUSIC: ${island.cultural_traits.music_styles.join(", ")}.
    FOODS: ${island.cultural_traits.foods.join(", ")}.
    DIALECT WORDS ALLOWED: ${island.dialect.vocabulary.map(v => v.word).join(", ")}.
    `;
}
