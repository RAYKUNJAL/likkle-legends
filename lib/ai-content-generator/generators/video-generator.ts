
import { contentGenerator } from '../core';
import { CONTENT_CONFIG, IMAGE_STYLE } from '../config';

export interface GeneratedVideoScript {
    title: string;
    description: string;
    targetAge: "mini" | "big";
    topic: string;
    islandTheme?: string;
    characters: string[];
    scenes: VideoScene[];
    totalDurationSeconds: number;
    learningObjectives: string[];
    thumbnailPrompt: string;
}

export interface VideoScene {
    number: number;
    setting: string;
    actionDescription: string;
    dialogue: {
        speaker: string;
        text: string;
        emotion?: string;
        action?: string;
    }[];
    visualCues: string;
    durationSeconds: number;
}

export interface VideoGenerationOptions {
    topic?: string;
    island?: string;
    ageTrack?: "mini" | "big";
    durationMinutes?: number;
}

export class VideoGenerator {

    /**
     * Generate a full video script
     */
    async generateScript(options: VideoGenerationOptions): Promise<GeneratedVideoScript> {
        const island = options.island || contentGenerator.getRandomIsland();
        const topic = options.topic || contentGenerator.getRandomTheme();
        const ageTrack = options.ageTrack || 'mini';
        const duration = options.durationMinutes || (ageTrack === 'mini' ? 3 : 5);

        console.log(`🎥 Generating video script for ${island} about "${topic}" (${ageTrack})...`);

        const systemInstruction = `You are an expert children's educational video scriptwriter for "Likkle Legends", a Caribbean-themed learning platform.
        Create an engaging, culturally authentic video script (puppet show or animation style).
        
        Target Audience: ${ageTrack === 'mini' ? 'Preschool (3-5 years)' : 'Early Primary (6-8 years)'}.
        Island Theme: ${island}.
        Topic: ${topic}.
        Duration: Approximately ${duration} minutes.
        
        Characters: Use typical Caribbean characters (e.g., Tanty Spice the wise grandmother, Captain Calypso the fisherman, Miss Melody the teacher).
        Language: Standard English with gentle Caribbean lilt and specific Patois words/phrases (provide meanings).
        Tone: Fun, educational, warm, energetic.
        Structure: Intro (Hook), Core Lesson, Fun Activity/Song snippet, Conclusion (Review).`;

        const prompt = `Write a complete video script for a ${duration}-minute lesson about ${topic} set in ${island}.
        
        Return the result as a JSON object with this schema:
        {
            "title": "Catchy Video Title",
            "description": "Brief summary of the video lesson",
            "targetAge": "${ageTrack}",
            "topic": "${topic}",
            "islandTheme": "${island}",
            "characters": ["List of characters used"],
            "learningObjectives": ["Objective 1", "Objective 2"],
            "totalDurationSeconds": ${duration * 60},
            "scenes": [
                {
                    "number": 1,
                    "setting": "Description of the visual setting",
                    "actionDescription": "What happens in this scene",
                    "visualCues": "Notes for the animator/editor (e.g. 'Show map of Jamaica', 'Pop up word: COCONUT')",
                    "durationSeconds": 60,
                    "dialogue": [
                        {
                            "speaker": "Character Name",
                            "text": "Spoken line...",
                            "emotion": "Happy/Confused/Excited",
                            "action": "Box wave/Pointing/Dancing"
                        }
                    ]
                }
            ],
            "thumbnailPrompt": "Detailed prompt for generating the video thumbnail image"
        }`;

        const script = await contentGenerator.generateJSON<GeneratedVideoScript>(prompt, {}, {
            systemInstruction,
            temperature: 0.7,
            maxTokens: 8192
        });

        // Ensure thumbnail prompt exists
        if (!script.thumbnailPrompt) {
            script.thumbnailPrompt = await this.generateThumbnailPrompt(script);
        }

        return script;
    }

    /**
     * Generate a thumbnail prompt if missing
     */
    private async generateThumbnailPrompt(script: GeneratedVideoScript): Promise<string> {
        return contentGenerator.generateText(
            `Create a detailed image generation prompt for a YouTube thumbnail for this children's educational video:
            Title: ${script.title}
            Island: ${script.islandTheme}
            Characters: ${script.characters.join(', ')}
            
            Style: ${IMAGE_STYLE.base}, ${IMAGE_STYLE.palette}.
            Requirements: High contrast, bright colors, catchy, shows the characters having fun.`,
            { temperature: 0.7 }
        );
    }
}

export const videoGenerator = new VideoGenerator();
