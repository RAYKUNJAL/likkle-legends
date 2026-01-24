
import { contentGenerator } from '../core';
import { CONTENT_CONFIG, IMAGE_STYLE } from '../config';

export interface GeneratedPrintable {
    title: string;
    description: string;
    type: "worksheet" | "coloring_page" | "activity_pack";
    targetAge: "mini" | "big";
    islandTheme?: string;
    educationalGoal: string;
    content: {
        instructions: string;
        sections: {
            title: string;
            type: "text" | "drawing_area" | "matching" | "tracing" | "maze";
            content: string; // Description of what to render or the text itself
            items?: { label: string; matchId?: string }[]; // For matching/lists
        }[];
    };
    imagePrompt: string; // Prompt to generate the visual base of the printable
}

export interface PrintableGenerationOptions {
    theme?: string;
    island?: string;
    ageTrack?: "mini" | "big";
    type?: "worksheet" | "coloring_page";
}

export class PrintableGenerator {

    /**
     * Generate a printable activity
     */
    async generatePrintable(options: PrintableGenerationOptions): Promise<GeneratedPrintable> {
        const island = options.island || contentGenerator.getRandomIsland();
        const theme = options.theme || contentGenerator.getRandomTheme();
        const ageTrack = options.ageTrack || 'mini';
        const type = options.type || 'worksheet';

        console.log(`🎨 Generating ${type} for ${island} about "${theme}" (${ageTrack})...`);

        const systemInstruction = `You are an expert educational content designer for "Likkle Legends".
        Create a fun, printable activity sheet (worksheet or coloring page) for children.
        
        Target Audience: ${ageTrack === 'mini' ? 'Preschool (3-5 years)' : 'Early Primary (6-8 years)'}.
        Island Theme: ${island}.
        Activity Theme: ${theme}.
        Type: ${type}.
        
        Style: Caribbean-focused, engaging, simple instructions.`;

        const prompt = `Design a ${type} about ${theme} set in ${island}.
        
        Return the result as a JSON object with this schema:
        {
            "title": "Fun Activity Title",
            "description": "Brief description of the activity for parents/teachers",
            "type": "${type}",
            "targetAge": "${ageTrack}",
            "islandTheme": "${island}",
            "educationalGoal": "What the child learns",
            "content": {
                "instructions": "Simple instructions for the child",
                "sections": [
                    {
                        "title": "Section Title (e.g. Color the Flag, Trace the words)",
                        "type": "text | drawing_area | matching | tracing | maze",
                        "content": "Description of what belongs here. If it's a maze, describe the start/end. If tracing, provide the words.",
                        "items": [{"label": "Item 1"}, {"label": "Item 2"}] (optional for lists/matching)
                    }
                ]
            },
            "imagePrompt": "Detailed prompt to generate the black and white line art or visual layout for this worksheet. Essential for 'coloring_page' type."
        }`;

        return await contentGenerator.generateJSON<GeneratedPrintable>(prompt, {}, {
            systemInstruction,
            temperature: 0.7,
            maxTokens: 4000
        });
    }
}

export const printableGenerator = new PrintableGenerator();
