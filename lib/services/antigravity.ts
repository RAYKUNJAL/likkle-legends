
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryParams, StoryPage } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const TEXT_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-3-pro-preview"];
const IMAGE_MODELS = ["gemini-2.5-flash-image"];
const IMAGE_TIMEOUT_MS = 8000;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

function isRetryableModelError(error: unknown): boolean {
    const message = getErrorMessage(error).toLowerCase();
    return (
        message.includes("503") ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("resource_exhausted") ||
        message.includes("429") ||
        message.includes("timeout") ||
        message.includes("temporar")
    );
}

async function runWithRetry<T>(task: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await task();
        } catch (error) {
            lastError = error;
            if (!isRetryableModelError(error) || attempt === retries) {
                throw error;
            }
            await sleep(600 * (attempt + 1));
        }
    }
    throw lastError;
}

async function withTimeout<T>(task: Promise<T>, timeoutMs: number, timeoutLabel: string): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`${timeoutLabel} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([task, timeoutPromise]);
    } finally {
        if (timeoutHandle) clearTimeout(timeoutHandle);
    }
}

function extractJsonArray(raw: string): any[] {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return [];
        try {
            const parsed = JSON.parse(match[0]);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
}

/**
 * GENERATE MULTI-PAGE STORY WITH IMAGES (Antigravity Edition)
 */
export async function generateLegendStoryPages(params: StoryParams): Promise<StoryPage[]> {
    if (!apiKey) throw new Error("API Key missing.");

    const ai = new GoogleGenAI({ apiKey });
    try {
        // 1. Generate Story Text (JSON)
        const prompt = `Write a 3-page Caribbean story for ${params.child_name} set in ${params.island} featuring ${params.character}. The challenge is ${params.challenge}. Each page should have a short paragraph and a vivid image prompt.`;
        let textResponse: any = null;
        let textError: unknown = null;

        for (const modelName of TEXT_MODELS) {
            try {
                textResponse = await runWithRetry(
                    () =>
                        ai.models.generateContent({
                            model: modelName,
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            config: {
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
                        }),
                    2
                );
                break;
            } catch (error) {
                textError = error;
                console.warn(`[Antigravity] Text model failed: ${modelName}`, error);
            }
        }

        if (!textResponse) {
            throw new Error(`Story text generation unavailable. ${getErrorMessage(textError)}`);
        }

        const pagesData = extractJsonArray(textResponse.text || "");
        if (pagesData.length === 0) {
            throw new Error("Story model returned invalid JSON structure.");
        }

        // 2. Generate Images for each page
        const storyPages: StoryPage[] = await Promise.all(pagesData.map(async (data: any) => {
            let imageUrl = null;
            if (data.imagePrompt) {
                for (const modelName of IMAGE_MODELS) {
                    try {
                        const imageResponse = await withTimeout(
                            runWithRetry(
                                () =>
                                    ai.models.generateContent({
                                        model: modelName,
                                        contents: [{ parts: [{ text: data.imagePrompt + ", vibrant caribbean children's book illustration style, colorful" }] }],
                                        config: {}
                                    }),
                                1
                            ),
                            IMAGE_TIMEOUT_MS,
                            `Image generation (${modelName})`
                        );

                        const imgPart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                        if (imgPart?.inlineData) {
                            imageUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
                            break;
                        }
                    } catch (imgErr) {
                        console.warn(`[Antigravity] Image model failed: ${modelName}`, imgErr);
                    }
                }
            }

            return {
                text: data.text || "Our island adventure continues!",
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
