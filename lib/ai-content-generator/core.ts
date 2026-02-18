// Core AI Content Generator
// Orchestrates content generation using Gemini API

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONTENT_CONFIG, CHARACTER_PROFILES, IMAGE_STYLE } from './config';

// Ensure environment variables are loaded
const API_KEY = process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('⚠️  WARNING: No Gemini API key found in environment variables');
    console.warn('   Please set GEMINI_API_KEY in your .env.local file');
}

const getGenAI = () => {
    if (!API_KEY) {
        throw new Error('Gemini API Key is missing. Check GEMINI_API_KEY environment variable.');
    }
    return new GoogleGenerativeAI(API_KEY);
};

export interface GenerationOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
    responseMimeType?: string; // New!
}

export class ContentGenerator {
    // COMMERCIAL UPGRADE: Using Gemini 2.0 Flash as primary
    private defaultModel = 'gemini-2.0-flash';

    /**
     * Generate text content using Gemini with Timeout Protection
     */
    async generateText(prompt: string, options?: GenerationOptions): Promise<string> {
        try {
            // If system instruction exists, prepend it to the prompt
            let fullPrompt = prompt;
            if (options?.systemInstruction) {
                fullPrompt = `${options.systemInstruction}\n\n${prompt}`;
            }

            const modelsToTry = [
                options?.model || this.defaultModel,
                'gemini-2.0-flash-exp', // Fallback
            ];

            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`🤖 Attempting generation with model: ${modelName}...`);
                    const genAI = getGenAI();
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            temperature: options?.temperature || 0.9,
                            // Increased token limit for complex content 
                            maxOutputTokens: options?.maxTokens || 8192,
                            responseMimeType: options?.responseMimeType || 'text/plain', // Use configured MIME type
                        }
                    });

                    // WRAP IN TIMEOUT for Vercel Function Limit Protection
                    // Increased to 60 seconds for complex storytelling
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error(`Timeout - Model ${modelName} took too long (>60s)`)), 60000)
                    );

                    const generationPromise = async () => {
                        try {
                            const result = await model.generateContent(fullPrompt);
                            const response = await result.response;
                            return response.text();
                        } catch (genErr: any) {
                            throw new Error(`Generation failed: ${genErr.message}`);
                        }
                    };

                    // Race against the clock
                    const text = await Promise.race([generationPromise(), timeoutPromise]);

                    if (text) return text;

                } catch (error: any) {
                    console.warn(`⚠️  Model ${modelName} failed or timed out: ${error.message}`);
                    lastError = error;
                    // Continue to next model in the list
                }
            }

            console.error('❌ All Gemini models failed.');
            throw new Error(`Failed to generate text content: ${lastError?.message}`);
        } catch (error: any) {
            console.error('❌ Unexpected Error in generateText:', error);
            // Panic fallback to prevent infinite hanging
            throw new Error(`Critical AI Failure: ${error.message}`);
        }
    }

    /**
     * Generate JSON content with schema validation
     */
    async generateJSON<T>(prompt: string, schema: any, options?: GenerationOptions): Promise<T> {
        let text = '';
        try {
            // Updated prompt to be less aggressive since we use MIME type now, but keep schema reference
            const fullPrompt = `${prompt}\n\nPlease output valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;

            text = await this.generateText(fullPrompt, {
                ...options,
                responseMimeType: 'application/json' // FORCE JSON MODE
            });
            console.log("--- RAW GEMINI RESPONSE START ---");
            console.log(text);
            console.log("--- RAW GEMINI RESPONSE END ---");

            // Clean response - remove markdown code blocks if present
            let cleanedText = text.trim();
            // Remove markdown code blocks (more robust regex)
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

            // Extract just the JSON object part if extra text exists
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
            }

            try {
                const parsed = JSON.parse(cleanedText);
                return parsed as T;
            } catch (parseError: any) {
                console.warn('⚠️  Initial JSON parse failed. Attempting logic fix...');
                // Attempt to fix common "control character" errors by escaping unescaped newlines in JSON strings
                // This is a naive attempt but might save some cases
                try {
                    // Replace literal newlines inside strings but keep them outside
                    const fixedText = cleanedText.replace(/\n/g, '\\n');
                    const parsed = JSON.parse(fixedText);
                    return parsed as T;
                } catch (retryError) {
                    console.error('❌ JSON Parse Error:', parseError.message);
                    console.error('Raw content that failed:', cleanedText);
                    throw parseError;
                }
            }
        } catch (error: any) {
            console.error('Error generating JSON:', error.message);
            throw new Error(`Failed to generate valid JSON content: ${error.message} (Raw: ${text.substring(0, 200)}...)`);
        }
    }

    /**
     * Generate image using Gemini image generation
     */
    async generateImage(prompt: string, characterName?: string): Promise<string> {
        try {
            const { generateImage: callGeminiImage } = await import('../ai-image-generator/image-client');

            // Enhance prompt with character profile if specified
            let fullPrompt = prompt;

            if (characterName && CHARACTER_PROFILES[characterName as keyof typeof CHARACTER_PROFILES]) {
                const character = CHARACTER_PROFILES[characterName as keyof typeof CHARACTER_PROFILES];
                fullPrompt = `${character.basePrompt}. ${prompt}. Style: ${character.style}`;
            } else {
                fullPrompt = `${prompt}. Style: ${IMAGE_STYLE.base}. Colors: ${IMAGE_STYLE.palette}. Mood: ${IMAGE_STYLE.mood}`;
            }

            // Add safety and quality guidelines
            fullPrompt += `. IMPORTANT: Child-friendly, culturally authentic Caribbean illustration. No violence, scary elements, or inappropriate content. High quality, detailed, warm and inviting.`;

            console.log(`🎨 [AI Core] Requesting Gemini Story Maker Image: ${fullPrompt.substring(0, 80)}...`);

            const fileName = `story-page-${Date.now()}`;
            const imageUrl = await callGeminiImage(fullPrompt, fileName);

            return imageUrl || 'placeholder-image-url';

        } catch (error) {
            console.error('Error generating image:', error);
            throw new Error('Failed to generate image');
        }
    }

    /**
     * Validate content for safety and appropriateness
     */
    validateContent(content: string): { safe: boolean; issues: string[] } {
        const issues: string[] = [];

        // Basic safety checks
        const forbiddenWords = ['violent', 'scary', 'blood', 'weapon', 'fight'];
        const lowerContent = content.toLowerCase();

        forbiddenWords.forEach(word => {
            if (lowerContent.includes(word)) {
                issues.push(`Contains potentially inappropriate word: ${word}`);
            }
        });

        // Check reading level (basic Flesch-Kincaid approximation)
        const sentences = content.split(/[.!?]+/).length;
        const words = content.split(/\s+/).length;
        const avgWordsPerSentence = words / sentences;

        if (avgWordsPerSentence > 15) {
            issues.push('Sentences may be too complex for target age group');
        }

        return {
            safe: issues.length === 0,
            issues,
        };
    }

    /**
     * Get random island from config
     */
    getRandomIsland(): string {
        const islands = CONTENT_CONFIG.islands;
        const island = islands[Math.floor(Math.random() * islands.length)];
        return typeof island === 'string' ? island : island.name;
    }

    /**
     * Get random theme from config
     */
    getRandomTheme(): string {
        const themes = CONTENT_CONFIG.themes;
        return themes[Math.floor(Math.random() * themes.length)];
    }

    /**
     * Get random character
     */
    getRandomCharacter(): string {
        const characters = Object.keys(CHARACTER_PROFILES);
        return characters[Math.floor(Math.random() * characters.length)];
    }
}

// Singleton instance
export const contentGenerator = new ContentGenerator();
