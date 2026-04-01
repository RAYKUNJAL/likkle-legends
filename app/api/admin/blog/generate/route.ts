// API Route: Generate Blog Post with AI
// POST /api/admin/blog/generate

import { NextRequest, NextResponse } from 'next/server';
import { generateAndSavePost, BlogGenerationRequest } from '@/lib/services/blog-agent';
import { requireAdminToken } from '@/lib/api/require-admin-token';
import { logAdminAction, logAdminActionError, extractIpAddress } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
    try {
        // Validate admin token before processing
        const adminInfo = await requireAdminToken(request);

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

        // Log the action (non-blocking)
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (url && serviceKey && adminInfo) {
                const { createClient } = await import('@supabase/supabase-js');
                const loggingClient = createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
                logAdminAction(
                    loggingClient,
                    adminInfo.user.id,
                    adminInfo.user.email || '',
                    'generate_blog',
                    'blog_post',
                    post.id,
                    { topic, category, auto_publish: autoPublish },
                    extractIpAddress(Object.fromEntries(request.headers))
                );
            }
        } catch (auditError) {
            console.error('Failed to log blog generation:', auditError);
        }

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

        // Log the error (non-blocking)
        try {
            const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
            if (adminToken) {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                if (url && serviceKey) {
                    const { createClient } = await import('@supabase/supabase-js');
                    const admin = createClient(url, serviceKey, {
                        auth: { persistSession: false, autoRefreshToken: false }
                    });
                    const { data: { user } } = await admin.auth.getUser(adminToken);
                    if (user) {
                        const loggingClient = createClient(url, serviceKey, {
                            auth: { persistSession: false, autoRefreshToken: false }
                        });
                        logAdminActionError(
                            loggingClient,
                            user.id,
                            user.email || '',
                            'generate_blog',
                            'blog_post',
                            error.message || 'Failed to generate blog post',
                            undefined,
                            { topic: body.topic, category: body.category },
                            extractIpAddress(Object.fromEntries(request.headers))
                        );
                    }
                }
            }
        } catch (auditError) {
            console.error('Failed to log blog generation error:', auditError);
        }

        return NextResponse.json(
            { error: error.message || 'Failed to generate blog post' },
            { status: 500 }
        );
    }
}
