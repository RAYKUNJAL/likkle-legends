// Core AI Content Generator
// Orchestrates content generation using Gemini API

import { GoogleGenAI } from '@google/genai';
import { CONTENT_CONFIG, CHARACTER_PROFILES, IMAGE_STYLE } from './config';

// Ensure environment variables are loaded
const API_KEY = process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('⚠️  WARNING: No Gemini API key found in environment variables');
    console.warn('   Please set GEMINI_API_KEY in your .env.local file');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export interface GenerationOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
}

export class ContentGenerator {
    private defaultModel = 'gemini-1.5-flash';

    /**
     * Generate text content using Gemini
     */
    async generateText(prompt: string, options?: GenerationOptions): Promise<string> {
        try {
            // If system instruction exists, prepend it to the prompt
            let fullPrompt = prompt;
            if (options?.systemInstruction) {
                fullPrompt = `${options.systemInstruction}\n\n${prompt}`;
            }

            const response = await genAI.models.generateContent({
                model: options?.model || this.defaultModel,
                contents: [{
                    role: 'user',
                    parts: [{ text: fullPrompt }]
                }],
                config: {
                    temperature: options?.temperature || 0.9,
                    maxOutputTokens: options?.maxTokens || 8192,
                }
            });

            return response.text || '';
        } catch (error) {
            console.error('Error generating text:', error);
            throw new Error('Failed to generate text content');
        }
    }

    /**
     * Generate JSON content with schema validation
     */
    async generateJSON<T>(prompt: string, schema: any, options?: GenerationOptions): Promise<T> {
        try {
            const fullPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON matching this schema. No markdown, no explanations, just raw JSON. Ensure all strings are properly escaped, especially newlines (use \\n). \n\nSchema: ${JSON.stringify(schema, null, 2)}`;

            const text = await this.generateText(fullPrompt, options);

            // Clean response - remove markdown code blocks if present
            let cleanedText = text.trim();
            // Remove markdown code blocks (more robust regex)
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

            try {
                const parsed = JSON.parse(cleanedText);
                return parsed as T;
            } catch (parseError) {
                // Attempt to fix common "control character" errors by escaping newlines in strings
                // This is a naive attempt but might save some cases
                try {
                    const fixedText = cleanedText.replace(/\n/g, '\\n');
                    const parsed = JSON.parse(fixedText);
                    return parsed as T;
                } catch (retryError) {
                    console.error('JSON Parse Error:', parseError);
                    console.error('Cleaned content snippet:', cleanedText.substring(0, 200) + '...');
                    throw parseError;
                }
            }
        } catch (error) {
            console.error('Error generating JSON:', error);
            throw new Error('Failed to generate valid JSON content');
        }
    }

    /**
     * Generate image using Gemini image generation
     */
    async generateImage(prompt: string, characterName?: string): Promise<string> {
        try {
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

            // TODO: Implement actual image generation
            // For now, return a placeholder URL
            // In production, you'd upload to Supabase Storage and return that URL
            console.log(`[Image Generation] ${fullPrompt.substring(0, 100)}...`);
            return 'placeholder-image-url';

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
        return islands[Math.floor(Math.random() * islands.length)];
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
