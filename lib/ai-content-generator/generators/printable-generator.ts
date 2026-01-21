// Printable Activity Generator
// Generates coloring pages, puzzles, and worksheets for kids

import { contentGenerator } from '../core';
import { CONTENT_CONFIG } from '../config';

export interface GeneratedPrintable {
    title: string;
    description: string;
    type: 'coloring' | 'puzzle' | 'worksheet' | 'craft';
    theme: string;
    island: string;
    ageTrack: 'mini' | 'big';
    educationalObjective: string;
    aiPrompt: string; // The prompt for DALL-E/Midjourney/Gemini Image
    instructions: string;
    difficulty: number;
}

export interface PrintableGenerationParams {
    type?: 'coloring' | 'puzzle' | 'worksheet' | 'craft';
    theme?: string;
    island?: string;
    ageTrack?: 'mini' | 'big';
}

export class PrintableGenerator {
    /**
     * Generate a printable activity idea and image prompt
     */
    async generatePrintable(params: PrintableGenerationParams = {}): Promise<GeneratedPrintable> {
        const type = params.type || this.getRandomType();
        const island = params.island || contentGenerator.getRandomIsland();
        const ageTrack = params.ageTrack || 'mini';
        const theme = params.theme || contentGenerator.getRandomTheme();

        const prompt = this.buildPrintablePrompt({ type, island, theme, ageTrack });

        const data = await contentGenerator.generateJSON<any>(
            prompt,
            this.getSchema(),
            {
                systemInstruction: `You are an educational designer for children's activities. Create engaging, Caribbean-themed printable activities that are fun and educational.`,
                temperature: 0.8,
            }
        );

        return {
            title: data.title,
            description: data.description,
            type: data.type || type,
            theme,
            island,
            ageTrack,
            educationalObjective: data.educationalObjective,
            aiPrompt: data.aiPrompt,
            instructions: data.instructions,
            difficulty: ageTrack === 'mini' ? 1 : 3,
        };
    }

    private buildPrintablePrompt(params: {
        type: string;
        island: string;
        theme: string;
        ageTrack: string;
    }): string {
        const { type, island, theme, ageTrack } = params;

        return `Design a Caribbean-themed ${type} for children aged ${ageTrack === 'mini' ? '3-5' : '6-8'}.
        
        **PARAMETERS:**
        - Activity Type: ${type}
        - Theme: ${theme}
        - Island Influence: ${island}
        
        **REQUIREMENTS:**
        - The activity should be culturally authentic and age-appropriate.
        - For "coloring": Provide a detailed prompt for a black-and-white line art illustration.
        - For "puzzle": Describe a word search, maze, or matching game theme.
        - For "worksheet": Focus on counting, letters, or Caribbean facts.
        - For "craft": Provide simple instructions for something kids can make.
        
        **OUTPUT:**
        1. A catchy title.
        2. A warm description (Tanty Spice style).
        3. The educational objective.
        4. A detailed AI prompt for the visual part of the printable (High contrast black and white for coloring/puzzles).
        5. Step-by-step instructions for the parent/child.
        
        Return in JSON format.`;
    }

    private getSchema() {
        return {
            title: "String",
            description: "String",
            educationalObjective: "String",
            aiPrompt: "String - Detailed prompt for image generation",
            instructions: "String - How to use/complete the activity",
            type: "String"
        };
    }

    private getRandomType(): 'coloring' | 'puzzle' | 'worksheet' | 'craft' {
        const types: Array<'coloring' | 'puzzle' | 'worksheet' | 'craft'> = ['coloring', 'puzzle', 'worksheet', 'craft'];
        return types[Math.floor(Math.random() * types.length)];
    }
}

export const printableGenerator = new PrintableGenerator();
