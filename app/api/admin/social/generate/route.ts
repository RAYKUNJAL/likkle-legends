import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklySocialPosts } from '@/lib/ai-content-generator/generators/social-generator';
import { requireAdminToken } from '@/lib/api/require-admin-token';

export async function POST(request: NextRequest) {
    try {
        // Validate admin token before processing
        await requireAdminToken(request);

        const posts = await generateWeeklySocialPosts();
        return NextResponse.json({ posts });
    } catch (error: any) {
        if (error instanceof NextResponse) {
            return error;
        }
        console.error('Social generation error:', error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
