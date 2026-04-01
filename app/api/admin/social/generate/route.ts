import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklySocialPosts } from '@/lib/ai-content-generator/generators/social-generator';
import { requireAdminToken } from '@/lib/api/require-admin-token';
import { logAdminAction, logAdminActionError, extractIpAddress } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
    try {
        // Validate admin token before processing
        const adminInfo = await requireAdminToken(request);

        const posts = await generateWeeklySocialPosts();

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
                    'generate_social',
                    'social_post',
                    undefined,
                    { post_count: posts?.length || 0 },
                    extractIpAddress(Object.fromEntries(request.headers))
                );
            }
        } catch (auditError) {
            console.error('Failed to log social generation:', auditError);
        }

        return NextResponse.json({ posts });
    } catch (error: any) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error('Social generation error:', error);

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
                            'generate_social',
                            'social_post',
                            error.message || 'Generation failed',
                            undefined,
                            undefined,
                            extractIpAddress(Object.fromEntries(request.headers))
                        );
                    }
                }
            }
        } catch (auditError) {
            console.error('Failed to log social generation error:', auditError);
        }

        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
