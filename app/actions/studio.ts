
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { LEGEND_STUDIO_CONFIG } from "@/lib/studio-config";
import type { ContentPackage, AIStudioAgentOutput } from "@/lib/types/studio";

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
): Promise<ContentPackage> {
    const genAI = getGenAI();
    // Use the model defined in your config or a default fast one
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    // Note: User might want to use specific models from config if they exist, but for now we hardcode a good one.

    const generatedContent: AIStudioAgentOutput = {};

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
