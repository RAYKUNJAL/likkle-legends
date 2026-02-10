import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log('API Request: /api/story-data');
        console.log('URL available:', !!url);
        console.log('Service Key available:', !!serviceKey);

        if (!url || !serviceKey) {
            console.error('Missing Supabase credentials');
            return NextResponse.json({
                error: `Missing credentials. URL: ${!!url}, Key: ${!!serviceKey}`
            }, { status: 500 });
        }

        const supabase = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        const { data: items, error: itemErr } = await supabase
            .from('content_items')
            .select('id, title, slug, island_code, created_at')
            .eq('content_type', 'story')
            .order('created_at', { ascending: false })
            .limit(5);

        if (itemErr) {
            console.error('Supabase Query Error:', itemErr);
            return NextResponse.json({ error: `DB Error: ${itemErr.message}` }, { status: 500 });
        }

        if (!items || items.length === 0) {
            console.warn('No stories found in database');
            return NextResponse.json({ error: 'No stories found' }, { status: 404 });
        }

        for (const item of items) {
            const { data: locRows, error: locErr } = await supabase
                .from('content_localizations')
                .select('body_text, audio_url')
                .eq('content_item_id', item.id)
                .eq('dialect_type', 'standard_english')
                .limit(1);

            if (locErr) {
                console.error(`Localization Error for ${item.id}:`, locErr);
                continue;
            }

            if (!locRows || locRows.length === 0) continue;

            try {
                const parsed = JSON.parse(locRows[0].body_text);
                if (parsed.pages && Array.isArray(parsed.pages)) {
                    return NextResponse.json({
                        title: item.title,
                        ...parsed
                    });
                }
            } catch (e) {
                console.error(`JSON Parse Error for ${item.id}:`, e);
                continue;
            }
        }

        console.warn('No interactive stories found after checking candidates');
        return NextResponse.json({ error: 'No interactive stories found' }, { status: 404 });
    } catch (err: any) {
        console.error('API Route Exception:', err);
        return NextResponse.json({ error: `Server Exception: ${err.message}` }, { status: 500 });
    }
}
