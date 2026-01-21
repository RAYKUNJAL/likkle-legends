// Video Lesson Script Generator
// Generates scripts for short educational videos/animations

import { contentGenerator } from '../core';
import { CONTENT_CONFIG, CHARACTER_PROFILES } from '../config';

export interface GeneratedVideoScript {
    title: string;
    description: string;
    topic: string;
    targetAge: string;
    totalDurationSeconds: number;
    scenes: Array<{
        sceneNumber: number;
        setting: string;
        visuals: string;
        dialogue: Array<{
            character: string;
            text: string;
            action?: string;
        }>;
    }>;
    educationalKeyPoints: string[];
    thumbnailPrompt: string;
    propList: string[];
}

export interface VideoGenerationParams {
    topic?: string;
    island?: string;
    mainCharacter?: string;
    ageTrack?: 'mini' | 'big';
}

export class VideoGenerator {
    /**
     * Generate a script for a Caribbean-themed educational video
     */
    async generateScript(params: VideoGenerationParams = {}): Promise<GeneratedVideoScript> {
        const topic = params.topic || contentGenerator.getRandomTheme();
        const character = params.mainCharacter || contentGenerator.getRandomCharacter();
        const ageTrack = params.ageTrack || 'mini';
        const island = params.island || contentGenerator.getRandomIsland();

        const prompt = this.buildVideoPrompt({ topic, character, ageTrack, island });

        const data = await contentGenerator.generateJSON<any>(
            prompt,
            this.getSchema(),
            {
                systemInstruction: `You are a scriptwriter for high-quality children's educational television, like Sesame Street but set in the Caribbean. Use warmth, rhythm, and culturally authentic dialogue.`,
                temperature: 0.85,
            }
        );

        return {
            title: data.title,
            description: data.description,
            topic,
            targetAge: ageTrack,
            totalDurationSeconds: data.totalDurationSeconds || 180,
            scenes: data.scenes,
            educationalKeyPoints: data.educationalKeyPoints,
            thumbnailPrompt: data.thumbnailPrompt,
            propList: data.propList || [],
        };
    }

    private buildVideoPrompt(params: {
        topic: string;
        character: string;
        ageTrack: string;
        island: string;
    }): string {
        const { topic, character, ageTrack, island } = params;
        const charProfile = CHARACTER_PROFILES[character as keyof typeof CHARACTER_PROFILES];

        return `Write a video script for a short educational lesson.
        
        **STORYBOARD:**
        - Host Character: ${character} (${charProfile?.personality})
        - Topic: ${topic}
        - Setting: ${island}
        - Target Audience: Children aged ${ageTrack === 'mini' ? '3-5' : '6-8'}
        
        **STRUCTURE:**
        - Length: 3-5 short scenes.
        - Tone: Warm, musical, and engaging.
        - Must include an "Island Fact" related to the topic.
        - Must include a "Call to Action" (e.g., "Now you try counting your mangoes!").
        
        **FORMAT:**
        - Return scenes with visual descriptions and dialogue.
        - Include character actions (e.g., [Tanty laughs], [Waves to the camera]).
        
        Return in JSON format.`;
    }

    private getSchema() {
        return {
            title: "String",
            description: "String",
            totalDurationSeconds: "Number",
            scenes: [
                {
                    sceneNumber: "Number",
                    setting: "String",
                    visuals: "String - What is happening on screen",
                    dialogue: [
                        { character: "String", text: "String", action: "String (optional)" }
                    ]
                }
            ],
            educationalKeyPoints: ["String"],
            thumbnailPrompt: "String",
            propList: ["String"]
        };
    }
}

export const videoGenerator = new VideoGenerator();
