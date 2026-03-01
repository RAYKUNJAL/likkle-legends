/**
 * 🔄 Story Transformer
 * Converts simplified story database records into full StoryBook format
 */

import { StoryBook } from '@/types/story';

export function transformToStoryBook(dbStory: any): StoryBook {
    const content = typeof dbStory.content_json === 'string'
        ? JSON.parse(dbStory.content_json)
        : dbStory.content_json;

    // If already full structure, return as-is
    if (content.book_meta && content.structure) {
        return content as StoryBook;
    }

    // Otherwise transform simple structure to full StoryBook
    const pages = content.pages || [];
    const getAge = (ageTrack: string) => ageTrack === 'mini' ? 4 : 7;
    const getGrade = (ageTrack: string, level: string) => {
        if (ageTrack === 'mini') return 'Pre-K';
        if (level === 'emergent') return 'K';
        if (level === 'early') return '1st';
        return '2nd';
    };

    return {
        id: dbStory.id,
        book_meta: {
            id: dbStory.id,
            title: dbStory.title,
            series: 'Likkle Legends Caribbean',
            cover_image_url: dbStory.cover_image_url,
            language_variant: 'en-CAR',
            target_age: getAge(dbStory.age_track),
            target_grade: getGrade(dbStory.age_track, dbStory.reading_level),
            reading_level: dbStory.reading_level as any,
            theme: 'Caribbean Folklore',
            setting_island: dbStory.island_code,
            moral: 'Learning from Caribbean traditions',
            estimated_minutes: dbStory.estimated_reading_time_minutes || 5
        },

        literacy_profile: {
            primary_focus: dbStory.reading_level === 'emergent' ? 'phonics' : 'comprehension',
            skills: {
                phonemic_awareness: {
                    enabled: dbStory.reading_level === 'emergent',
                    targets: ['blend_CVC']
                },
                phonics: {
                    grapheme_phoneme_targets: getGraphemesForLevel(dbStory.reading_level),
                    pattern_focus: getPatternsForLevel(dbStory.reading_level),
                    tricky_words: getWordsForLevel(dbStory.reading_level)
                },
                fluency: {
                    sentence_length_max: getSentenceLengthForLevel(dbStory.reading_level),
                    repetition_level: dbStory.reading_level === 'emergent' ? 'high' : 'medium'
                },
                vocabulary: {
                    tier1_words: ['child', 'friend', 'island'],
                    tier2_words: ['adventure', 'magical', 'wisdom']
                },
                comprehension_goals: ['retell_sequence', 'identify_main_character']
            }
        },

        folklore_profile: {
            story_type: 'folktale',
            core_tradition: dbStory.tradition,
            character_templates: getCharactersForTradition(dbStory.tradition),
            danger_filter: {
                allow_spooky: false,
                banned_elements: ['gore', 'violence']
            }
        },

        guides: {
            primary_guide: {
                id: 'tanty_spice',
                name: 'Tanty Spice',
                voice_style: 'warm_storyteller',
                register: 'Caribbean_English_light',
                role_in_story: ['introduce', 'guide', 'wrap_up']
            },
            secondary_guide: {
                id: 'roti',
                name: 'R.O.T.I',
                voice_style: 'playful_robot',
                register: 'Caribbean_English_light',
                role_in_story: ['highlight_words', 'encourage']
            }
        },

        structure: {
            pages: pages.map((page: any, idx: number) => ({
                page_number: page.page_number || idx + 1,
                layout: 'single_page',
                background_setting: `island-${dbStory.island_code}-scene`,
                narrative_text: page.narrative_text,
                decodability_constraints: {
                    allowed_graphemes: getGraphemesForLevel(dbStory.reading_level),
                    max_new_graphemes: dbStory.reading_level === 'emergent' ? 2 : 4,
                    max_tricky_words: dbStory.reading_level === 'emergent' ? 1 : 2
                },
                focus_words: page.focus_words?.map((w: string) => ({
                    word: w,
                    sound_pattern: 'CVC_pattern'
                })) || [],
                guide_interventions: {
                    tanty_spice_intro: `Let me tell you about ${dbStory.title}...`,
                    roti_prompt: 'Great job reading!'
                },
                illustration_brief: {
                    style: 'bright_2D',
                    must_include: [dbStory.title, 'Caribbean island'],
                    avoid: ['scary elements']
                },
                audio_meta: {
                    narration_voice: 'tanty_spice',
                    include_sound_effects: true,
                    pace: dbStory.reading_level === 'emergent' ? 'slow' : 'moderate'
                }
            }))
        },
        assessment: {
            after_story_questions: [],
            home_connection: {
                family_activity: 'Discuss the story together.',
                language_flex: []
            }
        }
    };
}

function getGraphemesForLevel(level: string): string[] {
    if (level === 'emergent') return ['s', 'a', 't', 'p', 'i', 'n'];
    if (level === 'early') return ['ch', 'sh', 'th', 'ng', 'ck', 'oa'];
    return ['ai', 'ee', 'ou', 'or', 'ea', 'er'];
}

function getPatternsForLevel(level: string): string[] {
    if (level === 'emergent') return ['CVC_short_a', 'CVC_short_i'];
    if (level === 'early') return ['digraph_ch', 'digraph_sh'];
    return ['vowel_teams', 'r_controlled'];
}

function getWordsForLevel(level: string): string[] {
    if (level === 'emergent') return ['the', 'to', 'was'];
    if (level === 'early') return ['said', 'could', 'would'];
    return ['because', 'through', 'though'];
}

function getSentenceLengthForLevel(level: string): number {
    if (level === 'emergent') return 5;
    if (level === 'early') return 10;
    return 20;
}

function getCharactersForTradition(tradition: string) {
    const characters: any = {
        anansi: [
            {
                id: 'anansi',
                name: 'Anansi',
                role: 'trickster',
                species: 'spider',
                origin_region: 'Ghana→Caribbean',
                moral_function: 'teaches through cleverness',
                kid_friendly: true
            }
        ],
        papa_bois: [
            {
                id: 'papa_bois',
                name: 'Papa Bois',
                role: 'guardian',
                species: 'spirit',
                origin_region: 'Trinidad & Tobago',
                moral_function: 'protects nature',
                kid_friendly: true
            }
        ],
        river_mumma: [
            {
                id: 'river_mumma',
                name: 'River Mumma',
                role: 'protector',
                species: 'water spirit',
                origin_region: 'Caribbean Waters',
                moral_function: 'teaches respect for water',
                kid_friendly: true
            }
        ],
        chickcharney: [
            {
                id: 'chickcharney',
                name: 'Chickcharney',
                role: 'guide',
                species: 'bird spirit',
                origin_region: 'Bahamas',
                moral_function: 'brings magic and wonder',
                kid_friendly: true
            }
        ]
    };

    return characters[tradition] || characters.anansi;
}
