"use server";

import { getStoriesByTradition, getStoryBySlug } from '@/lib/stories-database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tradition = searchParams.get('tradition') || 'anansi';
        const level = searchParams.get('level') || 'emergent';
        const island = searchParams.get('island') || 'JM';

        console.log('[DebugEndpoint] 🧪 Testing story loading with:', { tradition, level, island });

        const result = {
            timestamp: new Date().toISOString(),
            query: { tradition, level, island },
            steps: [] as any[]
        };

        // Step 1: Query stories
        console.log('[DebugEndpoint] Step 1: Querying for stories...');
        result.steps.push({ step: 1, action: 'Query stories', status: 'in_progress' });

        const stories = await getStoriesByTradition(tradition, {
            reading_level: level,
            island_code: island,
            limit: 10
        });

        result.steps[result.steps.length - 1] = {
            ...result.steps[result.steps.length - 1],
            status: 'complete',
            found: stories.length,
            stories: stories.map((s: any) => ({ id: s.id, title: s.title, slug: s.slug }))
        };

        if (stories.length === 0) {
            return NextResponse.json({
                ...result,
                error: 'No stories found',
                success: false
            }, { status: 400 });
        }

        // Step 2: Fetch full story
        console.log('[DebugEndpoint] Step 2: Fetching full story by slug...');
        result.steps.push({ step: 2, action: 'Fetch full story', status: 'in_progress', slug: stories[0].slug });

        const fullStory = await getStoryBySlug(stories[0].slug);

        if (!fullStory) {
            result.steps[result.steps.length - 1] = {
                ...result.steps[result.steps.length - 1],
                status: 'failed',
                error: 'getStoryBySlug returned null'
            };

            return NextResponse.json({
                ...result,
                error: 'Failed to fetch full story',
                success: false
            }, { status: 400 });
        }

        result.steps[result.steps.length - 1] = {
            ...result.steps[result.steps.length - 1],
            status: 'complete',
            story: {
                title: fullStory.book_meta?.title,
                pages: fullStory.structure?.pages?.length,
                hasGuides: !!fullStory.guides
            }
        };

        return NextResponse.json({
            ...result,
            success: true,
            story: fullStory
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('[DebugEndpoint] ❌ Error:', errorMsg);

        return NextResponse.json({
            error: errorMsg,
            success: false,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
