
'use server'

import { createClient } from '@/lib/supabase/server';
import { educationalContentAgent } from '@/lib/ai-content-generator/agents/educational-agent';
import { AgentInputPayload } from '@/lib/ai-content-generator/agents/schemas';
import { redirect } from 'next/navigation';

export interface GenerateStoryInput {
    topic: string;
    island_override?: string;
    child_id?: string; // Optional if only one child, but good for future
}

export async function generateStoryAction(input: GenerateStoryInput) {
    const supabase = createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // 2. Fetch Family Profile
        const { data: family, error: familyError } = await supabase
            .from('family_profile')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (familyError || !family) {
            return { success: false, error: 'Family profile not set up. Please visit settings.' };
        }

        // 3. Fetch Child Profile (First one for MVP, or specific if provided)
        let childQuery = supabase.from('child_profile').select('*').eq('family_id', family.id);
        if (input.child_id) {
            childQuery = childQuery.eq('id', input.child_id);
        }

        const { data: children, error: childError } = await childQuery.limit(1);
        const child = children?.[0];

        if (childError || !child) {
            return { success: false, error: 'Child profile not found. Please add a child.' };
        }

        // 4. Fetch Learning State (Optional)
        const { data: learningState } = await supabase
            .from('child_learning_state')
            .select('*')
            .eq('child_id', child.id)
            .eq('subject', 'Culture') // Logic for subject selection could be dynamic
            .maybeSingle();

        // 5. Construct Payload (V3)
        const payload: AgentInputPayload = {
            request_id: `studio-${user.id}-${Date.now()}`,
            user_id: user.id,
            family_profile: family,
            child_profile: {
                id: child.id,
                child_name: child.child_name,
                child_age: child.age_years || 5, // fallback
                reading_level: child.reading_level,
                favourite_topics: child.favourite_topics,
                favourite_characters: child.favourite_characters,
                attention_span: child.attention_span
            },
            child_learning_state: learningState || undefined,
            education_context: {
                island: input.island_override || family.home_islands[0] || 'Jamaica',
                subject: 'Culture', // Defaulting to Culture for "Story Studio" free play
                topic_keywords: [input.topic]
            },
            creative_context: {
                tone: 'Fun and Adventurous',
                folklore_type: family.allow_trickster_folklore ? 'Anansi' : 'None' // Simple logic
            },
            platform_settings: {
                auto_publish: true, // Auto-save to DB
                visibility: 'private'
            },
            trace_metadata: {
                source: 'web-studio'
            }
        };

        // 6. Run Agent
        console.log('🚀 Launching Agent for:', child.child_name, 'Topic:', input.topic);
        const result = await educationalContentAgent.run(payload);

        if (result.status === 'success' && result.publication_record?.platform_story_id) {
            return { success: true, storyId: result.publication_record.platform_story_id };
        } else {
            return { success: false, error: result.errors?.join(', ') || 'Generation failed' };
        }

    } catch (error: any) {
        console.error('Generation Action Error:', error);
        return { success: false, error: error.message };
    }
}
