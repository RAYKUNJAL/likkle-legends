import { NextResponse } from 'next/server';
import { storyGenerator } from '@/lib/ai-content-generator/generators/story-generator';
import { databasePoster } from '@/lib/ai-content-generator/database-poster';
import { audioGenerationService } from '@/lib/services/audio-generation-service';
import { VOICES } from '@/lib/services/elevenlabs';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';
import { CONTENT_CONFIG } from '@/lib/ai-content-generator/config';

export const runtime = 'nodejs';
export const maxDuration = 300; // Increased to 5 mins for Gemini Story Maker image generation overhead

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in to generate stories." }, { status: 401 });
        }

        const body = await req.json();
        const { topic, heroName, heroType, style, narrator = 'roti' } = body;

        if (!topic || !heroName || !heroType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // --- USAGE LIMIT CHECK ---
        const today = new Date().toISOString().split('T')[0];
        const { count, error: usageError } = await supabaseAdmin
            .from('ai_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('feature', 'story_studio')
            .gte('used_at', today);

        if (usageError) console.error("Usage check error:", usageError);

        // Fetch user profile for tier check
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const tier = profile?.subscription_tier || 'free';
        const limit = tier === 'legends_plus' ? 5 : (tier === 'family_legacy' ? 20 : CONTENT_CONFIG.generation.storiesPerDay);

        if (count !== null && count >= limit) {
            return NextResponse.json({
                error: "Daily limit reached",
                details: `You have used all ${limit} story generations for today on your ${tier.replace('_', ' ')} plan. Upgrade for more magic!`
            }, { status: 429 });
        }

        console.log(`🪄 API: Generating story for ${heroName} (${heroType}) about ${topic} in style ${style} for user ${user.id}`);

        // Construct the prompt
        const styleMap: Record<string, string> = {
            'silly_funny': 'Silly & Funny: Goofy, lighthearted, and full of jokes kids understand.',
            'brave_adventure': 'Brave Adventure: Heroic, exploring, and exciting with a happy ending.',
            'bedtime_calm': 'Bedtime Calm: Soft, gentle, and peaceful words for relaxation.',
            'friendship_kindness': 'Friendship & Kindness: Focused on helping, sharing, and being kind.',
            'mystery_not_scary': 'Mystery: A curious investigation with no scary parts.',
            'carnival_party': 'Carnival Party: Vibrant, musical, and full of big island energy.',
            'animal_helpers': 'Animal Helpers: Friendly animals solving simple problems together.',
            'super_helpers': 'Super Helpers: Heroic kid actions with simple powers and a big heart.'
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
            ageTrack: tier === 'starter_mailer' ? 'mini' : 'big',
            theme: topic
        });

        let storyId: string | undefined;

        // 1. Save to Database
        const postResult = await databasePoster.postStory(story, user.id);
        if (postResult.success) {
            storyId = postResult.id;
            if (postResult.updatedStory) {
                story = postResult.updatedStory;
            }
            console.log(`💾 Story saved with ID: ${storyId}`);

            // Increment usage
            await supabaseAdmin.from('ai_usage').insert({
                user_id: user.id,
                feature: 'story_studio',
                metadata: { story_id: storyId, tier }
            });

            // 2. Generate Audio (Voice)
            if (storyId) {
                try {
                    console.log(`🎙️ Starting synchronous audio generation for narrator: ${narrator}...`);
                    const voiceId = narrator === 'tanty_spice' ? VOICES.tanty_spice : VOICES.roti;
                    const storyWithAudio = await audioGenerationService.generateAudioForStory(story, storyId, true, voiceId);
                    story = storyWithAudio;
                } catch (audioError) {
                    console.error("Audio generation failed (partial success):", audioError);
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
