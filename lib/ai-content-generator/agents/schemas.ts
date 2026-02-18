
/**
 * Caribbean Kids Story Agent V2 - Schemas
 * Strictly typed interfaces matching the detailed JSON specification.
 */

export type ModelProvider = 'google' | 'openai' | 'anthropic';

// --- Enhanced Profiles (V3) ---

export type LanguageFlavour = 'neutral' | 'caribbean_light' | 'creole_sprinkles';

export interface FamilyProfile {
    id: string;
    home_islands: string[];
    preferred_language: string;
    language_flavour: LanguageFlavour;
    values_notes?: string;
    allow_scary_folklore: boolean;
    allow_trickster_folklore: boolean;
    max_story_length_pages: number;
}

export interface ChildProfile {
    id: string;
    child_name: string;
    child_age: number;
    reading_level?: string;
    favourite_topics?: string[];
    favourite_characters?: string[];
    favourite_colours?: string[];
    attention_span?: 'short' | 'medium' | 'long';
}

export interface ChildLearningState {
    id: string;
    subject: string;
    level_band?: string;
    total_books_generated: number;
    last_topics?: string[];
    preferred_islands?: string[];
    last_feedback?: string;
}

// --- Agent IO ---

export interface AgentInputPayload {
    request_id: string;
    user_id: string;
    family_profile: FamilyProfile;
    child_profile: ChildProfile;
    child_learning_state?: ChildLearningState;
    education_context: {
        island: string;
        subject: string;
        topic_keywords: string[];
        curriculum_level_hint?: string;
    };
    creative_context: {
        folklore_type?: string;
        tone?: string;
        max_pages?: number;
        include_activities?: boolean;
    };
    platform_settings: {
        auto_publish: boolean;
        target_collections?: string[];
        visibility: 'private' | 'unlisted' | 'public';
    };
    trace_metadata?: Record<string, unknown>;
}


// --- Data Models (Output) ---

export interface CurriculumOutcome {
    outcome_id: string;
    outcome_text: string;
}

export interface CurriculumPlan {
    island: string;
    framework: string;
    stage: string;
    subject: string;
    age: number;
    selected_outcomes: CurriculumOutcome[];
    key_vocabulary?: string[]; // Optional in schema, but good to have
}

export interface CaribbeanKidsStorybook {
    metadata: {
        book_id?: string; // Optional as it might be generated later
        title: string;
        subtitle?: string;
        language: string;
        age_range: string;
        target_reading_level: string;
        estimated_page_count: number;
        created_at_iso: string;
        version?: string; // V2
    };
    personalization: {
        child_name?: string;
        child_age?: number;
        island_name: string;
        school_topic: string;
        folklore_type?: string;
    };
    learning_profile: {
        core_themes: string[];
        learning_goals: string[];
        key_vocabulary: string[];
    };
    island_context: {
        island_name: string;
        setting_description: string;
        cultural_elements?: string[];
    };
    folklore_inspiration?: {
        type: string;
        name: string;
        summary_of_original?: string;
        adaptation_for_children: string;
        core_moral: string;
    };
    main_characters: Array<{
        id: string;
        name: string;
        age?: string;
        is_human: boolean;
        role: string;
        personality?: string;
        visual_description: string;
    }>;
    curriculum_alignment?: CurriculumPlan;
    pages: Array<{
        page_id?: string; // V2
        page_number: number;
        layout_hint?: string;
        story_text: string;
        vocabulary_focus?: string[];
        reading_comprehension_questions?: string[];
        audio_narration?: {
            suggested_voice_style?: string;
            slow_reading_hint?: boolean;
        };
        illustration_prompt: {
            short_prompt: string;
            detailed_prompt: string;
            style: string;
            character_references?: string[];
            safety_and_constraints: string[];
        };
    }>;
    parent_and_teacher_notes?: {
        summary_of_lessons: string;
        discussion_questions: string[];
        activity_ideas: string[];
    };
    safety_profile?: {
        age_safety_notes: string;
        disallowed_content: string[];
        sensitivity_flags?: string[];
    };
}

export interface GeneratedImage {
    page_id?: string; // V2
    page_number: number;
    image_id: string;
    image_url: string;
    provider?: string;
    prompt_used?: string;
}

export interface PublicationRecord {
    published: boolean;
    platform_story_id?: string;
    slug?: string;
    visibility?: string;
    collections?: string[];
}

export interface AgentMetrics { // V2
    total_latency_ms?: number;
    model_latency_ms?: number;
    tool_latency_ms?: number;
}

export interface AgentOutputPayload {
    request_id: string;
    status: 'success' | 'partial_success' | 'failed';
    errors?: string[];
    storybook?: CaribbeanKidsStorybook;
    images?: GeneratedImage[];
    publication_record?: PublicationRecord;
    metrics?: AgentMetrics; // V2
}
