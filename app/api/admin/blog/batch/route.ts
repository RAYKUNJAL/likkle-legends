// API Route: Batch Generate Blog Posts
// POST /api/admin/blog/batch

import { NextRequest, NextResponse } from 'next/server';
import { batchGeneratePosts, CONTENT_IDEAS, BlogGenerationRequest } from '@/lib/services/blog-agent';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { topics, count, category, autoPublish } = body;

        let postsToGenerate: BlogGenerationRequest[] = [];

        if (topics && Array.isArray(topics)) {
            // Use provided topics
            postsToGenerate = topics;
        } else if (count && typeof count === 'number') {
            // Generate from pre-defined ideas
            let ideas = [...CONTENT_IDEAS];

            if (category) {
                ideas = ideas.filter(i => i.category === category);
            }

            // Shuffle and pick
            ideas.sort(() => Math.random() - 0.5);
            postsToGenerate = ideas.slice(0, Math.min(count, 10));
        } else {
            return NextResponse.json(
                { error: 'Provide either topics array or count number' },
                { status: 400 }
            );
        }

        if (postsToGenerate.length === 0) {
            return NextResponse.json(
                { error: 'No topics to generate' },
                { status: 400 }
            );
        }

        // Start generation (this runs in background for large batches)
        const posts = await batchGeneratePosts(postsToGenerate, {
            autoPublish: autoPublish || false,
            delayMs: 2000 // Rate limit between posts
        });

        return NextResponse.json({
            success: true,
            generated: posts.length,
            requested: postsToGenerate.length,
            posts: posts.map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                status: p.status,
                category: p.category
            })),
            message: `Generated ${posts.length} blog posts successfully!`
        });

    } catch (error: any) {
        console.error('Batch blog generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to batch generate posts' },
            { status: 500 }
        );
    }
}
