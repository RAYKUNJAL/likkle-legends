// API Route: Generate Blog Post with AI
// POST /api/admin/blog/generate

import { NextRequest, NextResponse } from 'next/server';
import { generateAndSavePost, BlogGenerationRequest } from '@/lib/services/blog-agent';
import { requireAdminToken } from '@/lib/api/require-admin-token';

export async function POST(request: NextRequest) {
    try {
        // Validate admin token before processing
        await requireAdminToken(request);

        console.log('Blog Generation API called');
        console.log('API Key present:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

        const body = await request.json();

        const { topic, category, targetKeywords, tone, targetAudience, wordCount, autoPublish } = body;

        if (!topic || !category) {
            return NextResponse.json(
                { error: 'Topic and category are required' },
                { status: 400 }
            );
        }

        const generationRequest: BlogGenerationRequest = {
            topic,
            category,
            targetKeywords,
            tone: tone || 'educational',
            targetAudience: targetAudience || 'parents',
            wordCount: wordCount || 1200
        };

        const post = await generateAndSavePost(generationRequest, {
            autoPublish: autoPublish || false
        });

        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                status: post.status,
                excerpt: post.excerpt,
                read_time_minutes: post.read_time_minutes
            },
            message: autoPublish
                ? `Post "${post.title}" published successfully!`
                : `Draft "${post.title}" created successfully!`
        });

    } catch (error: any) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error('Blog generation API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate blog post' },
            { status: 500 }
        );
    }
}
