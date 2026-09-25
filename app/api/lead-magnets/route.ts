import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';
import { requireContentAdmin } from '@/lib/content-library/access';
import { resolvePublishedLibraryPdf } from '@/lib/content-library/resolve-pack';

// GET all active lead magnets
export async function GET(request: NextRequest) {
    try {
        const admin = createAdminClient();
        const audience = request.nextUrl.searchParams.get('audience');

        let query = admin
            .from('lead_magnets')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (audience && audience !== 'all') {
            query = query.or(`target_audience.eq.${audience},target_audience.eq.all`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Lead magnets fetch error:', error);
            return NextResponse.json({ magnets: [] });
        }

        const magnets = await Promise.all((data || []).map(async (magnet) => {
            const libraryPdf = await resolvePublishedLibraryPdf(magnet.content_asset_id);
            return { ...magnet, library_pdf: libraryPdf };
        }));

        return NextResponse.json({ magnets });
    } catch (error) {
        console.error('Lead magnets error:', error);
        return NextResponse.json({ magnets: [] });
    }
}

// POST to create a new lead magnet (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = await requireContentAdmin(request);
        if (!auth.ok) return auth.response;

        const body = await request.json();
        if (body.content_asset_id) {
            const linked = await resolvePublishedLibraryPdf(body.content_asset_id);
            if (!linked) {
                return NextResponse.json({ error: 'content_asset_id must point at a published library file.' }, { status: 400 });
            }
        }

        const admin = createAdminClient();
        const row: Record<string, unknown> = {
            title: body.title,
            description: body.description,
            pdf_url: body.pdf_url,
            thumbnail_url: body.thumbnail_url,
            target_audience: body.target_audience || 'all',
            tags: body.tags || [],
            display_order: body.display_order || 0,
        };
        if (body.content_asset_id) row.content_asset_id = body.content_asset_id;
        const { data, error } = await admin
            .from('lead_magnets')
            .insert(row)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, magnet: data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
