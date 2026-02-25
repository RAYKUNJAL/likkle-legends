import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

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

        return NextResponse.json({ magnets: data || [] });
    } catch (error) {
        console.error('Lead magnets error:', error);
        return NextResponse.json({ magnets: [] });
    }
}

// POST to create a new lead magnet (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const admin = createAdminClient();
        const { data, error } = await admin
            .from('lead_magnets')
            .insert({
                title: body.title,
                description: body.description,
                pdf_url: body.pdf_url,
                thumbnail_url: body.thumbnail_url,
                target_audience: body.target_audience || 'all',
                tags: body.tags || [],
                display_order: body.display_order || 0,
            })
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
