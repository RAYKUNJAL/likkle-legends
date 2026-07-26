import { supabaseAdmin } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug');

        if (slug) {
            // Fetch single book with full content for the reader
            const { data: book, error } = await supabaseAdmin
                .from('stories_library')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .maybeSingle();

            if (error || !book) {
                return NextResponse.json({ error: 'Story not found' }, { status: 404 });
            }

            return NextResponse.json({ story: book });
        }

        // List all active books with full content (for library + reader)
        const { data: stories, error } = await supabaseAdmin
            .from('stories_library')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Library stories error:', error.message);
            return NextResponse.json({ stories: [] });
        }

        return NextResponse.json({ stories: stories || [] });
    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ stories: [] });
    }
}
