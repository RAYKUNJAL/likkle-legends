
export interface StoryParams {
    child_name: string;
    island: string;
    character: string;
    challenge: string;
}

export interface StoryPage {
    text: string;
    imageUrl: string | null;
    audioBuffer: AudioBuffer | null;
}

export interface AdminCharacter extends Character {
    isMystery?: boolean;
}

export interface Character {
    name: string;
    fullName?: string;
    role: string;
    tagline: string;
    description: string;
    color: string;
    image: string;
    traits: string[];
    model_3d_url?: string;
}

export interface StudioContent {
    id: string;
    title: string;
    type: 'letter' | 'story' | 'lesson';
    category: string;
    ageGroup: string;
    readingLevel: 'beginner' | 'intermediate' | 'advanced';
    text: string;
    pages: {
        id: string;
        text: string;
        audioUrl?: string;
        imageUrl?: string;
        audio?: {
            alignment?: {
                words?: { text: string; startTimeSeconds: number; endTimeSeconds: number }[];
            };
        };
    }[];
    status: 'draft' | 'processing' | 'published' | 'archived';
    backgroundMusic?: string;
    voiceSpeed: number;
    voiceEmotion: 'wise' | 'joyful' | 'cautionary' | 'excited';
    lastModified: string;
}

export interface SavedStory extends StoryParams {
    id: string;
    pages: StoryPage[];
    date: string;
}

export interface ReadingSession {
    points: number;
    isPlaying: boolean;
    currentPageIndex: number;
}

export interface ChildProfile {
    id: string;
    name: string;
    age: string;
    avatar: string;
    interests: string[];
    rank: 'Mango Seed' | 'Little Sapling' | 'Village Legend' | 'Island Guardian';
    stats: {
        storiesRead: number;
        missionsDone: number;
        gamesPlayed: number;
        trailProgress: number;
    };
    memory: {
        keyFacts: string[];
        lastEmotion: string;
        recentSummary?: string;
    };
    readingProgress: Record<string, number>;
}

export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    channel?: string;
    isCustom?: boolean;
    duration?: number;
}

export interface RadioChannel {
    id: string;
    label: string;
    icon: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    rewardPoints: number;
    icon: string;
    category: string;
    steps: string[];
}

// === IslandBrain Agent Types ===

export type AppMode = 'parent_mode' | 'kid_mode';
export type IslandId = string;
export type CharacterId = string;

export interface ParentProfile {
    family_id: string;
    primary_island: IslandId;
    secondary_islands: IslandId[];
    child: {
        name: string;
        age: number;
        reading_level?: string;
        attention_span_minutes?: number;
    };
    preferences: {
        tone?: string;
        dialect_level: "none" | "light" | "medium";
        cultural_density: "light" | "medium" | "heavy";
        learning_goals: string[];
        sensitive_topics: string[];
    };
}

export type ContentType =
    | "song_video_script"
    | "song_lyrics"
    | "story_short"
    | "story_bedtime"
    | "lesson_micro"
    | "quiz_micro"
    | "printable_cards_text"
    | "monthly_drop_bundle";

export interface ContentRequest {
    family_id: string;
    island_id: IslandId;
    mode: AppMode;
    content_type: ContentType;
    topic?: string;
    duration_seconds?: number;
    host_character_id?: CharacterId;
    support_character_ids?: CharacterId[];
    constraints?: Record<string, any>;
}

export interface QualityGateReport {
    safety_passed: boolean;
    cultural_passed: boolean;
    tone_passed: boolean;
    readability_passed: boolean;
    format_passed: boolean;
    reasons?: string[];
}

export interface GeneratedContent {
    content_id: string;
    family_id: string;
    island_id: IslandId;
    content_type: ContentType;
    title: string;
    payload: any; // Use specific schema types where possible
    parent_note?: {
        why_it_helps: string;
        offline_followup: string;
        what_to_say_after?: string;
    };
    metadata: {
        age_range?: string;
        topics?: string[];
        [key: string]: any;
    };
    qa_report?: QualityGateReport;
    is_approved_for_kid?: boolean;
    admin_status?: 'pending' | 'approved' | 'rejected';
}

export interface MonthlyDropRequest {
    family_id: string;
    island_id: IslandId;
    month: string;
    theme_hint?: string;
    host_character_id: CharacterId;
}

export interface MonthlyDropBundle {
    month: string;
    theme: string;
    visitor_character: {
        id: string;
        name: string;
        lesson_focus: string;
        short_intro: string;
        image_url: string;
    };
    weekly_kits: Array<{
        week: number;
        content_type: ContentType;
        title: string;
        content: any;
    }>;
    parent_note: {
        why_this_month_matters: string;
        simple_home_challenge: string;
    };
}
