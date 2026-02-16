
/**
 * LIKKLE LEGENDS - MASTER STORY SCHEMA (v2.0)
 * This schema defines the structure for both AI-generated and hand-curated
 * literacy stories. It integrates Caribbean folklore with phonics-based teaching.
 */

export type ReadingLevel = 'emergent' | 'early' | 'transitional';
export type LanguageVariant = 'en-GB' | 'en-US' | 'en-CAR' | 'patois';
export type GuideId = 'tanty_spice' | 'roti';

export interface StoryBook {
    id: string;
    book_meta: {
        id: string;
        title: string;
        series: string;
        cover_image_url?: string;
        language_variant: LanguageVariant;
        target_age: number;
        target_grade: string;
        reading_level: ReadingLevel;
        lexile_band?: string;
        theme: string;
        setting_island: string;
        moral: string;
        estimated_minutes: number;
    };

    literacy_profile: {
        primary_focus: 'phonics' | 'vocabulary' | 'comprehension';
        skills: {
            phonemic_awareness?: {
                enabled: boolean;
                targets: string[];
            };
            phonics: {
                grapheme_phoneme_targets: string[];
                pattern_focus: string[];
                tricky_words: string[];
            };
            fluency: {
                sentence_length_max: number;
                repetition_level: 'low' | 'medium' | 'high';
            };
            vocabulary: {
                tier1_words: string[];
                tier2_words: string[];
            };
            comprehension_goals: string[];
        };
    };

    folklore_profile: {
        story_type: 'folktale' | 'legend' | 'myth' | 'fable';
        core_tradition: string;
        character_templates: Array<{
            id: string;
            name: string;
            role: string;
            species: string;
            origin_region: string;
            moral_function: string;
            kid_friendly: boolean;
        }>;
        danger_filter: {
            allow_spooky: boolean;
            banned_elements: string[];
        };
    };

    guides: {
        primary_guide: {
            id: GuideId;
            name: string;
            voice_style: string;
            register: string;
            role_in_story: string[];
        };
        secondary_guide?: {
            id: GuideId;
            name: string;
            voice_style: string;
            register: string;
            role_in_story: string[];
        };
    };

    structure: {
        pages: Array<{
            page_number: number;
            layout: 'single_page' | 'spread' | 'interactive';
            background_setting: string;
            narrative_text: string;
            decodability_constraints: {
                allowed_graphemes: string[];
                max_new_graphemes: number;
                max_tricky_words: number;
            };
            focus_words: Array<{
                word: string;
                sound_pattern: string;
                prompt_for_roti?: string;
            }>;
            folklore_hooks?: Array<{
                character_id: string;
                action: string;
                visual_icon: string;
            }>;
            guide_interventions: {
                tanty_spice_intro?: string;
                roti_prompt?: string;
                comprehension_question?: string;
            };
            illustration_brief: {
                style: string;
                must_include: string[];
                avoid: string[];
            };
            illustration_url?: string;
            audio_meta: {
                narration_voice: GuideId;
                include_sound_effects: boolean;
                pace: 'slow' | 'normal' | 'fast';
            };
        }>;
    };

    assessment: {
        after_story_questions: Array<{
            id: string;
            type: 'sequence' | 'phonics' | 'inference' | 'literal';
            prompt: string;
            support_from_tanty_spice?: string;
            target_sound?: string;
        }>;
        home_connection: {
            family_activity: string;
            language_flex: string[];
        };
    };
}
