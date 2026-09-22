import { supabaseAdmin } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';
import {
    attachPageIllustrations,
    isKidsLibraryReady,
    localCatalogStories,
} from '@/lib/library-stories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function prepareStory(book: any) {
    return attachPageIllustrations(book);
}

function catalogByIdOrSlug(id?: string | null, slug?: string | null) {
    return localCatalogStories().find((story) =>
        (id && String(story.id) === id) || (slug && String(story.slug) === slug)
    ) || null;
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug');
        const id = url.searchParams.get('id');
        const kidsOnly = url.searchParams.get('kids') !== '0';

        if (slug || id) {
            let book: any = null;
            try {
                let query = supabaseAdmin
                    .from('stories_library')
                    .select('*')
                    .eq('is_active', true);
                query = id ? query.eq('id', id) : query.eq('slug', slug);
                const { data, error } = await query.maybeSingle();
                if (!error && data) book = data;
            } catch (error) {
                console.warn('Library story lookup fell back to local catalog:', error);
            }

            if (!book) {
                book = catalogByIdOrSlug(id, slug);
            }

            if (!book) {
                return NextResponse.json({ error: 'Story not found' }, { status: 404 });
            }

            const prepared = prepareStory(book);
            if (kidsOnly && !isKidsLibraryReady(prepared)) {
                return NextResponse.json({ error: 'Story is not fully illustrated yet' }, { status: 404 });
            }

            return NextResponse.json({ story: prepared });
        }

        let rows: any[] = [];
        try {
            const { data, error } = await supabaseAdmin
                .from('stories_library')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (!error && data?.length) {
                rows = data;
            }
        } catch (error) {
            console.warn('Library list fell back to local catalog:', error);
        }

        if (!rows.length) {
            rows = localCatalogStories();
        }

        const prepared = rows.map(prepareStory);
        const visible = kidsOnly ? prepared.filter(isKidsLibraryReady) : prepared;

        return NextResponse.json({
            stories: visible,
            counts: {
                total: prepared.length,
                ready: visible.length,
                missingCover: prepared.filter((s) => !s.cover_image_url).length,
                fullyIllustrated: prepared.filter(isKidsLibraryReady).length,
            },
        });
    } catch (e: any) {
        console.error('API Error:', e);
        const fallback = localCatalogStories().filter(isKidsLibraryReady);
        return NextResponse.json({ stories: fallback, counts: { total: fallback.length, ready: fallback.length } });
    }
}
