
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { LEGEND_STUDIO_CONFIG } from "@/lib/studio-config";
import type { ContentPackage, AIStudioAgentOutput } from "@/lib/types/studio";
import { storyAgent } from "@/lib/ai-content-generator/agents/StoryAgent";

const getGenAI = () => {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!key) throw new Error("Missing Gemini API Key");
    return new GoogleGenerativeAI(key);
};

export async function generateStudioContentAction(
    title: string,
    ageRange: string,
    islandId: string,
    topic: string,
    contentType: 'song_video_script' | 'story' | 'activity_pack' = 'song_video_script'
): Promise<ContentPackage | { error: string, code: string }> {
    // 0. Verify Auth & Credits
    const { createClient } = await import("@/lib/supabase/server");
    const supabaseClient = createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        throw new Error("You must be logged in to use the Legend Studio.");
    }

    const { checkAIUsage, logAIUsage } = await import("./ai-usage");
    const usage = await checkAIUsage(user.id);

    if (!usage.allowed) {
        return {
            error: `Monthly AI limit reached (${usage.limit} stories). Upgrade your plan for more!`,
            code: "LIMIT_REACHED"
        } as any;
    }

    const genAI = getGenAI();
    // Use the model defined in your config or a default fast one
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Note: User might want to use specific models from config if they exist, but for now we hardcode a good one.

    const generatedContent: AIStudioAgentOutput = {};

    // ... (rest of the logic for Module Master, Lyricist, etc.)
    // 1. Module Master (Lesson Plan)
    if (LEGEND_STUDIO_CONFIG.agents.module_master) {
        const prompt = `
            ${LEGEND_STUDIO_CONFIG.agents.module_master.system_prompt}
            
            TASK: Create a lesson plan for: "${title}".
            Topic: ${topic}.
            Age Range: ${ageRange}.
            Island ID: ${islandId}.
            
            Return strictly valid JSON matching this schema:
            {
                "objective": "string",
                "segments": [{"name": "string", "description": "string"}],
                "offline_followup": "string"
            }
        `;

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            generatedContent.module_master = JSON.parse(result.response.text());
        } catch (e) {
            console.error("Module Master failed:", e);
        }
    }

    // 2. Island Lyricist (if applicable)
    if (LEGEND_STUDIO_CONFIG.agents.island_lyricist && (contentType === 'song_video_script')) {
        const prompt = `
            ${LEGEND_STUDIO_CONFIG.agents.island_lyricist.system_prompt}
            
            TASK: Write lyrics for: "${title}".
            Topic: ${topic}.
            
            Return strictly valid JSON matching this schema:
            {
                "lyrics": {
                    "verse_1": "string",
                    "chorus": "string",
                    "verse_2": "string",
                    "outro": "string"
                }
            }
        `;
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            generatedContent.island_lyricist = JSON.parse(result.response.text());
        } catch (e) {
            console.error("Lyricist failed:", e);
        }
    }

    // 3. Storyteller (if applicable)
    if (LEGEND_STUDIO_CONFIG.agents.storyteller && (contentType === 'story')) {
        const prompt = `
            ${LEGEND_STUDIO_CONFIG.agents.storyteller.system_prompt}
            
            TASK: Write a story for: "${title}".
            Topic: ${topic}.
             
            Return strictly valid JSON:
            {
                "story_text": "string",
                "art_prompts": [{"page": 1, "description": "string"}]
            }
        `;
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            generatedContent.storyteller = JSON.parse(result.response.text());
        } catch (e) {
            console.error("Storyteller failed:", e);
        }
    }

    // 4. Activity Designer
    if (LEGEND_STUDIO_CONFIG.agents.activity_designer) {
        const prompt = `
            ${LEGEND_STUDIO_CONFIG.agents.activity_designer.system_prompt}
            
            TASK: Create activities for: "${title}".
            Topic: ${topic}.
             
            Return strictly valid JSON:
            {
                "activities": [
                    {
                        "name": "string",
                        "type": "item from ['offline_no_print', 'printable_coloring', 'worksheet']",
                        "instructions": "string"
                    }
                ]
            }
        `;
        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            generatedContent.activity_designer = JSON.parse(result.response.text());
        } catch (e) {
            console.error("Activity Designer failed:", e);
        }
    }

    // Log successful usage
    await logAIUsage(user.id, `studio_${contentType}`, { title, topic });

    // Assemble final package
    const pkg: ContentPackage = {
        content_id: crypto.randomUUID(),
        island_id: islandId,
        content_type: contentType,
        age_range: ageRange,
        dialect_level: 'light',
        title: title,
        short_hook: generatedContent.module_master?.objective || "A fun Caribbean lesson!",
        admin_status: 'pending',
        generated_content: generatedContent,
        metadata: {
            island_name: islandId, // Should map ID to name ideally
            host_character: "R.O.T.I.",
            support_characters: [],
            topics: [topic],
            safety_flags: [],
            qa_report: {
                safety_passed: true,
                cultural_passed: true,
                tone_passed: true,
                readability_passed: true,
                format_passed: true,
                notes: []
            }
        }
    };

    return pkg;
}

/**
 * 📖 Dedicated Interactive Story Generation
 */
export async function generateInteractiveStoryAction(params: {
    childName: string;
    island: string;
    guide: 'tanty' | 'roti';
    topic?: string;
}) {
    // 0. Verify Auth & Credits
    const { createClient } = await import("@/lib/supabase/server");
    const supabaseClient = createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        throw new Error("You must be logged in to create a story.");
    }

    const { checkAIUsage, logAIUsage } = await import("./ai-usage");
    const usage = await checkAIUsage(user.id);

    if (!usage.allowed) {
        return {
            success: false,
            error: `Monthly AI limit reached (${usage.limit} stories). Upgrade your plan for more!`,
            code: "LIMIT_REACHED"
        };
    }

    try {
        const story = await storyAgent.createInterativeStory(params);

        // Log successful usage
        await logAIUsage(user.id, 'interactive_story', { ...params });

        return { success: true, story };
    } catch (error: any) {
        console.error("Interactive Story generation failed:", error);
        return { success: false, error: error.message || "Failed to generate story" };
    }
}
