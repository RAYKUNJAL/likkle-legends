
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryParams, StoryPage } from "../types";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

/**
 * GENERATE MULTI-PAGE STORY WITH IMAGES (Antigravity Edition)
 */
export async function generateLegendStoryPages(params: StoryParams): Promise<StoryPage[]> {
    if (!apiKey) throw new Error("API Key missing.");

    const ai = new GoogleGenAI({ apiKey });
    try {
        // 1. Generate Story Text (JSON)
        const textResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: `Write a 3-page Caribbean story for ${params.child_name} set in ${params.island} featuring ${params.character}. The challenge is ${params.challenge}. Each page should have a short paragraph and a vivid image prompt.` }] }],
            config: {
                // thinkingConfig: { thinkingBudget: 4000 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ["text", "imagePrompt"]
                    }
                }
            }
        });

        const pagesData = JSON.parse(textResponse.text || "[]");

        // 2. Generate Images for each page
        const storyPages: StoryPage[] = await Promise.all(pagesData.map(async (data: any) => {
            let imageUrl = null;
            if (data.imagePrompt) {
                try {
                    const imageResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: [{ parts: [{ text: data.imagePrompt + ", vibrant caribbean children's book illustration style, colorful" }] }],
                        config: {
                            // imageConfig: { aspectRatio: "16:9" } 
                        }
                    });

                    const imgPart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (imgPart?.inlineData) {
                        imageUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
                    }
                } catch (imgErr) {
                    console.warn("Image generation fail", imgErr);
                }
            }

            return {
                text: data.text,
                imageUrl,
                audioBuffer: null
            };
        }));

        return storyPages;
    } catch (e) {
        console.error("Antigravity Generation Error:", e);
        throw e;
    }
}

/**
 * VALIDATE MAGIC KEY
 */
export async function validateMagicKey(): Promise<{ success: boolean; message: string }> {
    if (!apiKey) return { success: false, message: "No API key found in environment." };
    const ai = new GoogleGenAI({ apiKey });
    try {
        await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
        });
        return { success: true, message: "Village magic is strong! (Antigravity Active)" };
    } catch (e: any) {
        return { success: false, message: `Magic interrupted: ${e.message}` };
    }
}
