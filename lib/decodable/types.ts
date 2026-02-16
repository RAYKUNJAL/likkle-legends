/**
 * 📚 ISLAND DECODABLE READER FACTORY v2.0 - Types
 * Multi-island, curriculum-aligned, phonics-controlled reader generation
 */

// ─── CURRICULUM SPINE ────────────────────────────────────────────

export interface CurriculumLevel {
    level_id: string;
    focus?: string[];
    decodable_required?: boolean;
    target_phonics: string[];
    sight_words: string[];
    allowed_words: string[];
    sentence_rules_override?: Partial<DecodableTextRules>;
}

export interface WordbankOutput {
    allowed_words: string[];
    review_words: string[];
    assessment_words: string[];
}

// ─── LANGUAGE & PHONICS ──────────────────────────────────────────

export interface DecodableTextRules {
    one_sentence_per_page: boolean;
    max_words_per_sentence: number;
    punctuation_allowed: string[];
    no_dialogue_quotes: boolean;
    no_contractions: boolean;
    no_rhyming_forced: boolean;
}

export interface PhonicsControl {
    target_phonics: string[];
    allowed_words: string[];
    sight_words: string[];
    banned_patterns: {
        no_new_words: boolean;
        no_inflections: boolean;
        no_plural_s: boolean;
        no_articles_other_than_a: boolean;
        no_names_other_than_sam: boolean;
    };
}

// ─── ISLAND SYSTEM ───────────────────────────────────────────────

export interface IslandEntry {
    island_id: string;
    display_name: string;
    language_mode: string;
    cultural_pack_id: string;
}

export interface IslandContentPack {
    cultural_pack_id: string;
    settings: string[];
    props: string[];
    nature: { plants: string[]; animals: string[]; weather_vibes: string[] };
    architecture: { home_styles: string[]; colors: string[]; street_elements: string[] };
    food_safe_mentions: { mode: string; items: string[] };
    sensitivity_rules: {
        avoid_stereotypes: boolean;
        avoid_political_claims: boolean;
        respect_all_representations: boolean;
    };
}

// ─── STYLE SYSTEM ────────────────────────────────────────────────

export interface StyleBible {
    style_name: string;
    render_rules: {
        lighting: string;
        palette: string;
        composition: string;
        camera: string;
        texture: string;
    };
    negative_prompts: string[];
    consistency_checks: {
        character_drift_check: boolean;
        color_palette_lock_check: boolean;
        lower_third_clear_check: boolean;
    };
}

export interface CharacterEntry {
    role: 'main' | 'optional_background_buddy';
    name?: string;
    description: string;
    wardrobe_rules: string[];
    emotion_range?: string[];
    presence_rule?: string;
    do_not_change: string[];
}

// ─── ART DIRECTION ───────────────────────────────────────────────

export interface ArtDirection {
    style_bible: StyleBible;
    character_bible: Record<string, CharacterEntry>;
    island_pack: IslandContentPack;
}

// ─── PRINT & LAYOUT ─────────────────────────────────────────────

export interface PrintSpecs {
    trim_size_in: { width: number; height: number; orientation: 'portrait' | 'landscape' };
    bleed_in: number;
    safe_margin_in: number;
    text_zone: {
        location: string;
        min_clear_height_percent: number;
        text_alignment: string;
        font_style_guidance: {
            font_family_preference: string[];
            font_weight: string;
            min_font_size_pt: number;
            max_font_size_pt: number;
            line_spacing: number;
        };
    };
}

export interface PageLayout {
    page_number: number;
    trim_size_in: { width: number; height: number };
    bleed_in: number;
    safe_margin_in: number;
    text_zone_box_normalized: { x: number; y: number; w: number; h: number };
    title_zone_box_normalized_optional?: { x: number; y: number; w: number; h: number };
}

// ─── BOOK METADATA ───────────────────────────────────────────────

export interface DecodableBookMetadata {
    title: string;
    subtitle_optional?: string;
    author_line: string;
    island_id: string;
    island_display_name: string;
    version: string;
    level_id: string;
    phonics_focus: string;
    pages_total: number;
}

// ─── TEACHER & ASSESSMENT ────────────────────────────────────────

export interface TeacherGuideManifest {
    book_title: string;
    level_id: string;
    island: string;
    before_reading: { vocabulary_preview: string[]; phonics_focus_statement: string; discussion_prompt: string };
    during_reading: { page_tips: { page: number; tip: string }[] };
    after_reading: { comprehension_questions: string[]; extension_activity: string };
    phonics_mini_lesson: { target_sound: string; example_words: string[]; activity: string };
}

export interface AssessmentManifest {
    book_title: string;
    level_id: string;
    word_reading_checklist: { word: string; target_phonics: string; mastered: boolean | null }[];
    fluency_rubric: { level: string; descriptor: string }[];
    comprehension_prompts: string[];
}

// ─── VALIDATION ──────────────────────────────────────────────────

export interface ValidationReport {
    status: 'pass' | 'fail';
    violations: ValidationViolation[];
    word_inventory_used: string[];
    repair_instructions?: string[];
}

export interface ValidationViolation {
    page: number;
    word: string;
    reason: string;
}

// ─── ART PROMPT MANIFEST ────────────────────────────────────────

export interface ArtPromptItem {
    page_number: number;
    page_type: string;
    prompt: string;
    negative_prompt: string[];
    must_include: string[];
    must_avoid: string[];
    setting: string;
    character_emotion: string;
}

// ─── MASTER MANIFEST ─────────────────────────────────────────────

export interface MasterDecodableManifest {
    schema_version: string;
    book_metadata: DecodableBookMetadata;
    page_text_manifest: {
        cover_title: string;
        title_page_title: string;
        title_page_author: string;
        story_pages: { page: number; text: string }[];
        activity_page: {
            page: number;
            activity_type: string;
            trace_words?: string[];
            circle_prompt?: string;
            read_list?: string[];
        };
    };
    art_prompt_manifest: ArtPromptItem[];
    layout_manifest: PageLayout[];
    validation_report: ValidationReport;
    teacher_guide: TeacherGuideManifest;
    assessment: AssessmentManifest;
    export_targets: { type: string; spec: string }[];
}

// ─── GENERATION REQUEST ──────────────────────────────────────────

export interface GenerationRequest {
    book_title: string;
    island_id: string;
    level_id: string;
    phonics_focus: string;
    target_phonics: string[];
    allowed_words: string[];
    sight_words: string[];
    page_count: number;
    characters: string[];
    settings: string[];
    /** Optional overrides */
    max_words_override?: number;
    punctuation_override?: string[];
}
