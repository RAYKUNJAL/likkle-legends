
import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export type ModelTier = 'tier_0_low_cost' | 'tier_1_mid' | 'tier_2_strong';

interface ModelConfig {
    model: string;
    config: GenerationConfig;
}

const TIER_CONFIGS: Record<ModelTier, ModelConfig> = {
    'tier_0_low_cost': {
        model: "gemini-1.5-flash", // Fast and cheap for routing/memory
        config: {
            temperature: 0.2,
            maxOutputTokens: 400,
            responseMimeType: "application/json",
        }
    },
    'tier_1_mid': {
        model: "gemini-1.5-flash", // Flash is still good for worksheets
        config: {
            temperature: 0.5,
            maxOutputTokens: 1200,
            responseMimeType: "application/json",
        }
    },
    'tier_2_strong': {
        model: "gemini-1.5-pro", // Pro for complex unit plans
        config: {
            temperature: 0.6,
            maxOutputTokens: 2500,
            responseMimeType: "application/json",
        }
    }
};

export class GeminiProvider {
    /**
     * Executes a prompt using a specific model tier
     */
    async executeTiered<T>(tier: ModelTier, prompt: string, systemInstruction?: string): Promise<T> {
        const { model: modelName, config } = TIER_CONFIGS[tier];

        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemInstruction
            });

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: config
            });

            const responseText = result.response.text();
            return JSON.parse(responseText.trim()) as T;
        } catch (error) {
            console.error(`Gemini Provider Error [${tier}]:`, error);
            throw error;
        }
    }
}

export const geminiProvider = new GeminiProvider();
