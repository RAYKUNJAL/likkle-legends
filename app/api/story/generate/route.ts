
import { NextResponse } from 'next/server';
import { storyGenerator } from '@/lib/ai-content-generator/generators/story-generator';

import { databasePoster } from '@/lib/ai-content-generator/database-poster';
import { audioGenerationService } from '@/lib/services/audio-generation-service';

export const runtime = 'nodejs'; // Use nodejs runtime for heavier AI operations
export const maxDuration = 60; // Allow 1 minute for generation (if platform supports it)

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, heroName, heroType, style } = body;

        if (!topic || !heroName || !heroType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`🪄 API: Generating story for ${heroName} (${heroType}) about ${topic} in style ${style}`);

        // Construct the prompt
        // Map style ID to a descriptive string
        const styleMap: Record<string, string> = {
            'folklore': 'Traditional Caribbean Folklore, mysterious and magical',
            'scifi': 'Afro-Futurist Sci-Fi, colorful and high-tech',
            'nature': 'Lush Island Nature, peaceful and grounded'
        };
        const styleDesc = styleMap[style] || 'Caribbean Folklore';

        const customPrompt = `
        Write a world-class children's story about "${topic}".
        
        **HERO DETAILS:**
        Name: ${heroName}
        Type: ${heroType}
        
        **AESTHETIC & VIBE:**
        ${styleDesc}
        
        The story must be engaging, age-appropriate, and rooted in Caribbean culture.
        `;

        // Call the generator
        let story = await storyGenerator.generateStory({
            customPrompt,
            ageTrack: 'big', // Default to 'big' for more detail for now, or make this dynamic later
            theme: topic // Fallback theme
            // characterId defaults to Roti (host)
        });

        let storyId: string | undefined;

        // 1. Save to Database
        const postResult = await databasePoster.postStory(story);
        if (postResult.success) {
            storyId = postResult.id;
            console.log(`💾 Story saved with ID: ${storyId}`);

            // 2. Generate Audio (Voice)
            // We await this because Vercel/Next.js serverless functions might kill background tasks
            if (storyId) {
                try {
                    console.log("🎙️ Starting synchronous audio generation...");
                    const storyWithAudio = await audioGenerationService.generateAudioForStory(story, storyId);
                    story = storyWithAudio; // Update story object with audio URLs
                } catch (audioError) {
                    console.error("Audio generation failed (partial success):", audioError);
                    // Continue with text-only story
                }
            }
        } else {
            console.error("Failed to save story:", postResult.error);
        }

        return NextResponse.json({
            success: true,
            story,
            storyId
        });


    } catch (error: any) {
        console.error("Story Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate story", details: error.message },
            { status: 500 }
        );
    }
}
