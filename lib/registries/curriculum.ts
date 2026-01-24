
export interface CurriculumSkill {
    id: string;
    domain: "alphabet" | "counting" | "emotions" | "manners" | "culture" | "bedtime";
    difficulty: "easy" | "medium" | "hard";
    description: string;
}

export const SKILL_GRAPH: Record<string, string[]> = {
    alphabet: ["letter_recognition", "letter_sounds", "simple_words"],
    counting: ["1_10", "1_20", "quantity_matching", "simple_addition"],
    emotions: ["name_feelings", "calm_tools", "repair_and_apology", "empathy"],
    manners: ["please_thank_you", "sharing_turns", "listening"],
    culture: ["music_rhythm", "food_curiosity", "community_helping"],
    bedtime: ["wind_down", "gratitude", "safe_story"]
};

export interface CurriculumRecommendation {
    skill_domain: keyof typeof SKILL_GRAPH;
    difficulty: "easy" | "medium" | "hard";
    activity_type: "lesson_micro" | "quiz_micro" | "story_short" | "song_video_script";
    duration_minutes: number;
    host_character_id: string;
    support_character_ids: string[];
}

export interface CurriculumInput {
    child_age: number;
    reading_level?: string;
    attention_span_minutes?: number;
    learning_goals: string[];
    recent_activity_history?: string[]; // IDs of past activities
    mood_state_optional?: string;
}

/**
 * A rule-driven planner that chooses what a child should do next.
 * This is a deterministic implementation of the "Curriculum Brain".
 */
export function getNextActivityRecommendation(input: CurriculumInput): CurriculumRecommendation {
    // Default to a fun cultural activity if no specific goals
    let domain: keyof typeof SKILL_GRAPH = "culture";
    let difficulty: "easy" | "medium" | "hard" = "easy";
    let activity: CurriculumRecommendation['activity_type'] = "story_short";
    let host = "roti"; // Default guide
    let support = ["dilly_doubles"];

    // 1. Age-based Difficulty
    if (input.child_age >= 6) difficulty = "medium";
    if (input.child_age >= 8) difficulty = "hard";

    // 2. Goal-based Domain Selection
    if (input.learning_goals && input.learning_goals.length > 0) {
        // Simple rotation or random pick from goals
        const randomGoal = input.learning_goals[Math.floor(Math.random() * input.learning_goals.length)];
        // Map goal string to domain if possible (rough matching)
        if (randomGoal.includes("read") || randomGoal.includes("letter")) domain = "alphabet";
        else if (randomGoal.includes("math") || randomGoal.includes("count")) domain = "counting";
        else if (randomGoal.includes("emotion") || randomGoal.includes("feeling")) domain = "emotions";
    }

    // 3. Mood-based Adjustments
    if (input.mood_state_optional === "high_energy") {
        domain = "culture"; // Dance/Music
        activity = "song_video_script";
        host = "dilly_doubles";
    } else if (input.mood_state_optional === "tired" || input.mood_state_optional === "bedtime") {
        domain = "bedtime";
        activity = "story_short"; // Bedtime story
        host = "tanty_spice";
        support = ["benny_of_shadows"];
    } else if (input.mood_state_optional === "curious") {
        if (input.child_age >= 5) {
            activity = "lesson_micro";
        }
    }

    // 4. Activity Type Rules
    if (domain === "counting" || domain === "alphabet") {
        // Learning requires lessons or quizzes
        activity = Math.random() > 0.5 ? "lesson_micro" : "quiz_micro";
        host = "roti";
    }

    return {
        skill_domain: domain,
        difficulty: difficulty,
        activity_type: activity,
        duration_minutes: 5,
        host_character_id: host,
        support_character_ids: support
    };
}
