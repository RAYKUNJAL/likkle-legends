// Core AI Content Generator
// Orchestrates content generation using Claude API

import Anthropic from '@anthropic-ai/sdk';
import { CONTENT_CONFIG, CHARACTER_PROFILES, IMAGE_STYLE } from './config';

// Ensure environment variables are loaded
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!API_KEY) {
    console.warn('⚠️  WARNING: No Claude API key found in environment variables');
    console.warn('   Please set ANTHROPIC_API_KEY in Vercel environment variables');
}

const getClient = () => {
    if (!API_KEY) {
        throw new Error('Claude API Key is missing. Set ANTHROPIC_API_KEY in Vercel settings.');
    }
    return new Anthropic({ apiKey: API_KEY });
};

export interface GenerationOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
    responseMimeType?: string;
}

export class ContentGenerator {
    // Using Claude 3.5 Sonnet for quality and speed
    private defaultModel = 'claude-3-5-sonnet-20241022';

    /**
     * Generate text content using Claude with Timeout Protection
     */
    async generateText(prompt: string, options?: GenerationOptions): Promise<string> {
        try {
            const client = getClient();

            let systemPrompt = '';
            let userPrompt = prompt;

            if (options?.systemInstruction) {
                systemPrompt = options.systemInstruction;
            }

            console.log(`🤖 Generating with Claude...`);

            // WRAP IN TIMEOUT for Vercel Function Limit Protection
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Claude API took too long (>60s)')), 60000)
            );

            const generationPromise = async () => {
                try {
                    const message = await client.messages.create({
                        model: options?.model || this.defaultModel,
                        max_tokens: options?.maxTokens || 4096,
                        temperature: options?.temperature || 0.9,
                        ...(systemPrompt && { system: systemPrompt }),
                        messages: [
                            {
                                role: 'user',
                                content: userPrompt
                            }
                        ]
                    });

                    const textContent = message.content.find(block => block.type === 'text');
                    if (!textContent || textContent.type !== 'text') {
                        throw new Error('No text content in response');
                    }

                    return textContent.text;
                } catch (genErr: any) {
                    throw new Error(`Generation failed: ${genErr.message}`);
                }
            };

            // Race against the clock
            const text = await Promise.race([generationPromise(), timeoutPromise]);

            if (text) return text;

            throw new Error('No response from Claude');
        } catch (error: any) {
            console.error('❌ Error in generateText:', error.message);
            throw new Error(`Critical AI Failure: ${error.message}`);
        }
    }

    /**
     * Generate JSON content with schema validation
     */
    async generateJSON<T>(prompt: string, schema: any, options?: GenerationOptions): Promise<T> {
        let text = '';
        try {
            const fullPrompt = `${prompt}\n\nOutput ONLY valid JSON matching this schema, no other text:\n${JSON.stringify(schema, null, 2)}`;

            text = await this.generateText(fullPrompt, {
                ...options,
                temperature: 0.7 // Lower temperature for more consistent JSON
            });

            console.log("--- RAW CLAUDE RESPONSE START ---");
            console.log(text);
            console.log("--- RAW CLAUDE RESPONSE END ---");

            // Clean response - remove markdown code blocks if present
            let cleanedText = text.trim();
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

            // Extract just the JSON object part if extra text exists
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
            }

            const parsed = JSON.parse(cleanedText);
            return parsed as T;
        } catch (error: any) {
            console.error('Error generating JSON:', error.message);
            throw new Error(`Failed to generate valid JSON: ${error.message}`);
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

        const forbiddenWords = ['violent', 'scary', 'blood', 'weapon', 'fight'];
        const lowerContent = content.toLowerCase();

        forbiddenWords.forEach(word => {
            if (lowerContent.includes(word)) {
                issues.push(`Contains potentially inappropriate word: ${word}`);
            }
        });

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
