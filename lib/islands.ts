export interface IslandData {
    island_id: string;
    island_name: string;
    identity: {
        flag_emoji: string;
        national_symbols: {
            bird: string;
            flower: string;
            tree: string;
            fruit: string;
        };
        landscape_features: string[];
    };
    cultural_training_data: {
        dialect_patois: {
            phrase: string;
            literal_meaning: string;
            context: string;
        }[];
        folklore_characters: {
            name: string;
            personality: string;
            lesson: string;
        }[];
        sensory_calibration: {
            sounds: string[];
            smells: string[];
            colors: string[];
        };
    };
    ai_agent_voice_settings: {
        accent_profile: string;
        pacing: string;
        vibe: string;
        forbidden_topics: string[];
    };
    digital_library_content: {
        nursery_rhymes: {
            title: string;
            rhythm_style: string;
            lesson: string;
        }[];
        problem_solving_stories: {
            theme: string;
            title: string;
            island_setting: string;
        }[];
    };
    mailing_list_integration: {
        month_1_physical_item: string;
        ar_trigger: string;
        upsell_trigger: {
            threshold: string;
            offer: string;
            price: string;
        };
    };
    parent_analytics_logic: {
        tracked_metrics: string[];
        milestone_alert: string;
    };
}

export const islandData: Record<string, IslandData> = {
    "JAM-001": {
        "island_id": "JAM-001",
        "island_name": "Jamaica",
        "identity": {
            "flag_emoji": "🇯🇲",
            "national_symbols": {
                "bird": "Doctor Bird (Trochilus polytmus)",
                "flower": "Lignum Vitae",
                "tree": "Blue Mahoe",
                "fruit": "Ackee"
            },
            "landscape_features": [
                "Blue Mountains",
                "Dunn's River Falls",
                "Seven Mile Beach"
            ]
        },
        "cultural_training_data": {
            "dialect_patois": [
                {
                    "phrase": "Small up yuhself",
                    "literal_meaning": "Make room",
                    "context": "Used when trying to fit more people on a bench or bus; teaches spatial awareness and cooperation."
                },
                {
                    "phrase": "Wi lickle but wi tallawah",
                    "literal_meaning": "We are small but mighty",
                    "context": "The national motto; used to build confidence and resilience in children."
                }
            ],
            "folklore_characters": [
                {
                    "name": "Anansi the Spider",
                    "personality": "Tricky, clever, and small but outsmarts larger animals.",
                    "lesson": "Intelligence and wit are more powerful than physical size."
                }
            ],
            "sensory_calibration": {
                "sounds": ["Steel pan practice", "Rain on a zinc roof", "Tree frogs (Cracks)"],
                "smells": ["Blue Mountain Coffee", "Pimento wood smoke", "Salty sea breeze"],
                "colors": ["Emerald green hills", "Turquoise water", "Sunshine yellow houses"]
            }
        },
        "ai_agent_voice_settings": {
            "accent_profile": "Caribbean-Standard-B",
            "pacing": "Rhythmic and lyrical",
            "vibe": "Warm, encouraging 'Auntie' or 'Uncle' figure",
            "forbidden_topics": [
                "Violent versions of folklore",
                "Colonial trauma (keep to ancient roots/nature)",
                "Politics"
            ]
        },
        "digital_library_content": {
            "nursery_rhymes": [
                {
                    "title": "One, Two, Buckle My Shoe (Reggae Remix)",
                    "rhythm_style": "One-drop reggae beat",
                    "lesson": "Counting and rhythm"
                }
            ],
            "problem_solving_stories": [
                {
                    "theme": "Sharing",
                    "title": "Dilly and the Last Mango",
                    "island_setting": "A garden in Portland, Jamaica"
                }
            ]
        },
        "mailing_list_integration": {
            "month_1_physical_item": "Jamaica Passport Sticker & Dilly Doubles Letter",
            "ar_trigger": "Scan the Doctor Bird on the letter to unlock the 'Confidence' badge in the app.",
            "upsell_trigger": {
                "threshold": "After 3 stories read",
                "offer": "Limited Edition 'Tallawah' T-Shirt",
                "price": "$15.00"
            }
        },
        "parent_analytics_logic": {
            "tracked_metrics": ["Vocabulary growth", "Cultural identification", "Reading duration"],
            "milestone_alert": "Kai has learned 5 Patois words! Send a 'Cultural Hero' certificate to his email."
        }
    }
};
