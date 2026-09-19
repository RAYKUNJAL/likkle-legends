import { supabaseAdmin } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';
import { attachLocalCover, isKidsLibraryReady } from '@/lib/library-stories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function prepareStory(book: any) {
    return attachLocalCover(book);
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug');
        const id = url.searchParams.get('id');
        const kidsOnly = url.searchParams.get('kids') !== '0';

        if (slug || id) {
            let query = supabaseAdmin
                .from('stories_library')
                .select('*')
                .eq('is_active', true);

            query = id ? query.eq('id', id) : query.eq('slug', slug);

            const { data: book, error } = await query.maybeSingle();

            if (error || !book) {
                return NextResponse.json({ error: 'Story not found' }, { status: 404 });
            }

            const prepared = prepareStory(book);
            if (kidsOnly && !isKidsLibraryReady(prepared)) {
                return NextResponse.json({ error: 'Story is not ready to read' }, { status: 404 });
            }

            return NextResponse.json({ story: prepared });
        }

        const { data: stories, error } = await supabaseAdmin
            .from('stories_library')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Library stories error:', error.message);
            return NextResponse.json({ stories: [] });
        }

        const prepared = (stories || []).map(prepareStory);
        const visible = kidsOnly ? prepared.filter(isKidsLibraryReady) : prepared;

        return NextResponse.json({
            stories: visible,
            counts: {
                total: prepared.length,
                ready: visible.length,
                missingCover: prepared.filter((s) => !s.cover_image_url).length,
            },
        });
    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ stories: [] });
    }
}
