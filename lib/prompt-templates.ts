
export const LL_SYSTEM_PROMPT = `
You are the Likkle Legends IslandBrain Agent.
You generate kid-safe learning content rooted in curated island packs.
You never browse the open web.
You obey parent preferences and kid-mode constraints.
You output in the requested JSON schema only.
`;

export const PROMPT_TEMPLATES = {
    song_video_script_v1: {
        id: "song_video_script_v1",
        output_schema: {
            title: "string",
            hook: "string",
            lyrics: {
                verse_1: "string",
                chorus: "string",
                verse_2: "string",
                chorus_repeat: "string",
                outro: "string"
            },
            visual_storyboard: [
                {
                    scene: 1,
                    duration_seconds: 5,
                    visual: "string",
                    on_screen_text: "string"
                }
            ],
            parent_note: {
                why_it_helps: "string",
                offline_followup: "string",
                what_to_say_after: "string"
            },
            metadata: {
                age_range: "string",
                island: "string",
                dialect_level: "none|light|medium",
                host_character: "string",
                support_characters: ["string"],
                topics: ["string"]
            }
        },
        generation_rules: [
            "Keep lines short and repeatable.",
            "No emojis in final output.",
            "Use island references lightly unless parent sets 'cultural_density=heavy'.",
            "Include one call-and-response moment for retention."
        ]
    },

    story_bedtime_v1: {
        id: "story_bedtime_v1",
        output_schema: {
            title: "string",
            story: "string",
            moral: "string",
            parent_note: {
                why_it_helps: "string",
                offline_followup: "string",
                what_to_say_after: "string"
            },
            metadata: {
                age_range: "string",
                island: "string",
                host_character: "string",
                topics: ["string"]
            }
        },
        generation_rules: [
            "Gentle pacing, no fear elements.",
            "1 clear lesson, not multiple morals.",
            "End with calm closure and safety."
        ]
    },

    lesson_micro_v1: {
        id: "lesson_micro_v1",
        output_schema: {
            title: "string",
            objective: "string",
            steps: [
                {
                    step: 1,
                    instruction: "string",
                    kid_prompt: "string"
                }
            ],
            success_check: "string",
            encouragement: "string",
            parent_note: {
                why_it_helps: "string",
                offline_followup: "string"
            },
            metadata: {
                duration_minutes: 5,
                host_character: "string",
                skill_domain: "string",
                difficulty: "string"
            }
        },
        generation_rules: [
            "Max 5 steps.",
            "Use simple language.",
            "Include a 'try again' line that is encouraging."
        ]
    },

    monthly_drop_bundle_v1: {
        id: "monthly_drop_bundle_v1",
        output_schema: {
            month: "string",
            theme: "string",
            visitor_character: {
                id: "string",
                name: "string",
                lesson_focus: "string",
                short_intro: "string",
                image_url: "string"
            },
            weekly_kits: [
                {
                    week: 1,
                    content_type: "song_video_script|story_short|lesson_micro|printable_cards_text",
                    title: "string",
                    content: "string (nested JSON or text)"
                }
            ],
            parent_note: {
                why_this_month_matters: "string",
                simple_home_challenge: "string"
            }
        },
        generation_rules: [
            "Visitor must be hosted by a core character.",
            "Theme must be kid-safe and culturally inclusive.",
            "Bundle must include at least 1 printable and 1 song."
        ]
    }
};

export function getPromptForTemplate(templateId: keyof typeof PROMPT_TEMPLATES, context: string): string {
    const template = PROMPT_TEMPLATES[templateId];
    if (!template) return "";

    return `
    ${LL_SYSTEM_PROMPT}

    CONTEXT:
    ${context}

    TASK:
    Generate content matching the '${templateId}' schema.

    RULES:
    ${template.generation_rules.map(r => "- " + r).join("\n")}

    OUTPUT SCHEMA (JSON ONLY):
    ${JSON.stringify(template.output_schema, null, 2)}
    `;
}
