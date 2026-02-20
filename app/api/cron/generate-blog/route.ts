import { NextRequest, NextResponse } from 'next/server';
import { generateAndSavePost, CONTENT_IDEAS } from '@/lib/services/blog-agent';

// This is a Vercel Cron compatible route
// To secure this, you should set a CRON_SECRET in your environment variables
// and check it in the request headers

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    // In development or if CRON_SECRET is not set, we allow it for testing
    // In production, you should ALWAYS enforce this
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET && !isCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('🤖 CRON: Starting autonomous blog generation...');

        // Pick a random topic from the catalog
        const randomIndex = Math.floor(Math.random() * CONTENT_IDEAS.length);
        const topic = CONTENT_IDEAS[randomIndex];

        console.log(`📝 CRON: Generating post for topic: "${topic.topic}"`);

        const post = await generateAndSavePost(topic, {
            autoPublish: true, // Auto-publish for the cron agent
            authorName: 'Tanty Spice (AI Agent)'
        });

        return NextResponse.json({
            success: true,
            message: 'Blog post generated and published successfully',
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug
            }
        });
    } catch (error: any) {
        console.error('❌ CRON: Blog generation failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to generate blog post'
        }, { status: 500 });
    }
}
