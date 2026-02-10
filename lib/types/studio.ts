
export interface AIStudioAgentOutput {
    module_master?: {
        objective: string;
        segments: Array<{ name: string; description: string }>;
        offline_followup: string;
    };
    storyteller?: {
        story_text: string;
        art_prompts: Array<{ page: number; description: string }>;
    };
    island_lyricist?: {
        lyrics: {
            verse_1: string;
            chorus: string;
            verse_2: string;
            outro?: string;
        };
    };
    activity_designer?: {
        activities: Array<{
            name: string;
            type: 'offline_no_print' | 'printable_coloring' | 'worksheet';
            instructions: string;
        }>;
    };
}

export interface ContentPackage {
    content_id: string;
    family_id?: string | null;
    island_id: string;
    content_type: 'song_video_script' | 'story' | 'activity_pack';
    age_range: string;
    dialect_level: 'light' | 'medium' | 'heavy';
    title: string;
    short_hook: string;
    admin_status: 'pending' | 'approved' | 'published';

    generated_content: AIStudioAgentOutput;

    metadata: {
        island_name: string;
        host_character: string;
        support_characters: string[];
        topics: string[];
        safety_flags: string[];
        qa_report: {
            safety_passed: boolean;
            cultural_passed: boolean;
            tone_passed: boolean;
            readability_passed: boolean;
            format_passed: boolean;
            notes: string[];
        };
    };
}
