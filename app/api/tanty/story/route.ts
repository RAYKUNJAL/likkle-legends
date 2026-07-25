import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { generateTantyStory, saveTantyStory, TantyStoryRequest } from '@/lib/agents/tanty-story-agent';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/tanty/story
 * Body: { childName, childAge, island?, theme?, character? }
 * Generates a personalized Caribbean story via Tanty Spice AI agent.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Please log in so Tanty can tell you a story.' }, { status: 401 });
        }

        const body = await req.json();
        const { childName, childAge, island, theme, character } = body;

        if (!childName || !childAge) {
            return NextResponse.json({ error: 'Tanty needs to know the child\'s name and age.' }, { status: 400 });
        }

        // Usage check — free tier: 1/day, paid: 5/day
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabaseAdmin
            .from('ai_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('feature', 'tanty_story')
            .gte('used_at', today);

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .maybeSingle();

        const tier = profile?.subscription_tier || 'free';
        const limit = tier === 'family_legacy' ? 10 : (tier === 'legends_plus' ? 5 : (tier === 'starter_mailer' ? 3 : 1));

        if (count !== null && count >= limit) {
            return NextResponse.json({
                error: `Tanty has told you ${limit} stories today! Come back tomorrow for more.`,
                limit,
                used: count,
            }, { status: 429 });
        }

        // Get child's active profile for personalization
        let childId: string | undefined;
        try {
            const { data: children } = await supabaseAdmin
                .from('children')
                .select('id, first_name, age, primary_island')
                .or(`parent_id.eq.${user.id},primary_user_id.eq.${user.id}`)
                .order('created_at', { ascending: true })
                .limit(1);
            if (children && children.length > 0) {
                childId = children[0].id;
            }
        } catch {}

        const request: TantyStoryRequest = {
            childName: String(childName),
            childAge: Number(childAge) || 5,
            island: island || 'TT',
            theme: theme || undefined,
            character: character || 'tanty_spice',
        };

        const story = await generateTantyStory(request);

        // Save to DB
        const storyId = await saveTantyStory(user.id, childId || user.id, story, {
            island: request.island,
            theme: request.theme,
        });

        // Log usage
        try {
            await supabaseAdmin.from('ai_usage').insert({
                user_id: user.id,
                feature: 'tanty_story',
                used_at: new Date().toISOString(),
                metadata: { title: story.title, theme: request.theme },
            });
        } catch {}

        return NextResponse.json({
            success: true,
            story,
            storyId,
        });
    } catch (err: any) {
        console.error('[/api/tanty/story] Error:', err);
        return NextResponse.json({
            error: err?.message || 'Tanty Spice is resting her voice. Please try again.',
        }, { status: 500 });
    }
}

/**
 * GET /api/tanty/story
 * Returns the child's previously generated stories.
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('stories')
            .select('id, title, character, island, content, metadata, created_at')
            .or(`user_id.eq.${user.id},child_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json({ stories: [] });
        }

        return NextResponse.json({ stories: data || [] });
    } catch {
        return NextResponse.json({ stories: [] });
    }
}
