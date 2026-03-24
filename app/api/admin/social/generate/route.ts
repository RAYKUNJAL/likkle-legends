import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklySocialPosts } from '@/lib/ai-content-generator/generators/social-generator';

export async function POST(request: NextRequest) {
    // Basic admin auth check via Bearer token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const posts = await generateWeeklySocialPosts();
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Social generation error:', error);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}
