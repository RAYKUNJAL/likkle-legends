
import { StoryBook } from '@/types/story';

export const SAMPLE_ANANSI_STORY: StoryBook = {
    id: "anansi-yam-hill-001",
    book_meta: {
        id: "anansi-yam-hill-001",
        title: "Anansi and the Big Yam",
        series: "Island Legends Phonics",
        language_variant: "en-CAR",
        target_age: 6,
        target_grade: "Grade 1",
        reading_level: "emergent",
        theme: "Folklore",
        setting_island: "Jamaica",
        moral: "Sharing",
        estimated_minutes: 5
    },

    literacy_profile: {
        primary_focus: "phonics",
        skills: {
            phonemic_awareness: {
                enabled: true,
                targets: ["blend_CVC"]
            },
            phonics: {
                grapheme_phoneme_targets: ["a", "t", "s", "m", "p"],
                pattern_focus: ["CVC_short_a"],
                tricky_words: ["the", "to", "was"]
            },
            fluency: {
                sentence_length_max: 8,
                repetition_level: "high"
            },
            vocabulary: {
                tier1_words: ["yam", "crab"],
                tier2_words: ["trick", "share"]
            },
            comprehension_goals: ["retell_sequence", "identify_main_character"]
        }
    },

    folklore_profile: {
        story_type: "folktale",
        core_tradition: "Anansi",
        character_templates: [
            {
                id: "anansi",
                name: "Anansi",
                role: "trickster",
                species: "spider",
                origin_region: "Ghana→Jamaica",
                moral_function: "shows consequences of greed",
                kid_friendly: true
            }
        ],
        danger_filter: {
            allow_spooky: false,
            banned_elements: ["gore", "violence"]
        }
    },

    guides: {
        primary_guide: {
            id: "tanty_spice",
            name: "Tanty Spice",
            voice_style: "warm_storyteller",
            register: "Caribbean_English_light",
            role_in_story: ["introduce", "preview_phonics", "wrap_up"]
        },
        secondary_guide: {
            id: "roti",
            name: "R.O.T.I",
            voice_style: "playful_robot",
            register: "Caribbean_English_light",
            role_in_story: ["highlight_words", "phonics_games"]
        }
    },

    structure: {
        pages: [
            {
                page_number: 1,
                layout: "single_page",
                background_setting: "village_market_morning",
                narrative_text: "Anansi sat on a mat. He saw a big yam.",
                decodability_constraints: {
                    allowed_graphemes: ["a", "t", "s", "m", "p", "i", "n"],
                    max_new_graphemes: 2,
                    max_tricky_words: 2
                },
                focus_words: [
                    {
                        word: "yam",
                        sound_pattern: "CVC_short_a",
                        prompt_for_roti: "Can you sound this out? /y/ /a/ /m/."
                    },
                    {
                        word: "mat",
                        sound_pattern: "CVC_short_a"
                    }
                ],
                guide_interventions: {
                    tanty_spice_intro: "Look at that greedy spider! Anansi sees something tasty.",
                    roti_prompt: "Tap the word 'yam'!"
                },
                illustration_brief: {
                    style: "bright_2D",
                    must_include: ["Anansi", "big yellow yam", "wicker mat"],
                    avoid: ["scary shadows"]
                },
                audio_meta: {
                    narration_voice: "tanty_spice",
                    include_sound_effects: true,
                    pace: "slow"
                }
            },
            {
                page_number: 2,
                layout: "single_page",
                background_setting: "anansi_garden",
                narrative_text: "The yam was fat. Anansi did not share.",
                decodability_constraints: {
                    allowed_graphemes: ["a", "t", "s", "m", "p", "i", "n"],
                    max_new_graphemes: 1,
                    max_tricky_words: 1
                },
                focus_words: [
                    {
                        word: "fat",
                        sound_pattern: "CVC_short_a"
                    }
                ],
                guide_interventions: {
                    tanty_spice_intro: "Oh no, Anansi! Sharing is caring, don't you know?",
                    roti_prompt: "Can you see the word 'fat'?"
                },
                illustration_brief: {
                    style: "bright_2D",
                    must_include: ["Anansi hiding the yam", "a green garden"],
                    avoid: []
                },
                audio_meta: {
                    narration_voice: "tanty_spice",
                    include_sound_effects: true,
                    pace: "slow"
                }
            }
        ]
    },

    assessment: {
        after_story_questions: [
            {
                id: "q1",
                type: "literal",
                prompt: "What did Anansi see on the mat?",
                support_from_tanty_spice: "Tanty says: It was big, round, and yellow!"
            }
        ],
        home_connection: {
            family_activity: "Ask a grown-up to tell you a story about a market, then draw your favorite part.",
            language_flex: ["English_ok", "Patwa_ok"]
        }
    }
};
