
import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

// SECURITY: API Key should NEVER use NEXT_PUBLIC_ prefix
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export type ModelTier = 'tier_0_low_cost' | 'tier_1_mid' | 'tier_2_strong';

interface ModelConfig {
    model: string;
    config: GenerationConfig;
}

const TIER_CONFIGS: Record<ModelTier, ModelConfig> = {
    'tier_0_low_cost': {
        model: "gemini-3.1-flash-preview", // Lightning fast for routing
        config: {
            temperature: 0.2,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
        }
    },
    'tier_1_mid': {
        model: "gemini-3.1-flash-preview", // Flash remains great for detailed worksheets
        config: {
            temperature: 0.5,
            maxOutputTokens: 1500,
            responseMimeType: "application/json",
        }
    },
    'tier_2_strong': {
        model: "gemini-3.1-pro-preview", // Gemini 3.1 Pro for complex unit plans and stories
        config: {
            temperature: 0.6,
            maxOutputTokens: 5000,
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
