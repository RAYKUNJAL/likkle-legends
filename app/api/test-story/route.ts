import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
        }

        const supabase = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        const { data: items, error: itemErr } = await supabase
            .from('content_items')
            .select('id, title')
            .eq('content_type', 'story')
            .order('created_at', { ascending: false })
            .limit(5);

        if (itemErr) {
            return NextResponse.json({ error: itemErr.message }, { status: 500 });
        }

        // Find first story with interactive data
        for (const item of items || []) {
            const { data: locRows } = await supabase
                .from('content_localizations')
                .select('body_text, audio_url')
                .eq('content_item_id', item.id)
                .eq('dialect_type', 'standard_english')
                .limit(1);

            if (!locRows || locRows.length === 0) continue;

            try {
                const parsed = JSON.parse(locRows[0].body_text);
                if (parsed.pages && Array.isArray(parsed.pages)) {
                    return NextResponse.json({
                        success: true,
                        title: item.title,
                        pageCount: parsed.pages.length,
                        hasAudio: !!parsed.pages[0]?.audioUrl,
                        hasWords: !!parsed.pages[0]?.words,
                        wordCount: parsed.pages[0]?.words?.length || 0
                    });
                }
            } catch {
                continue;
            }
        }

        return NextResponse.json({ error: 'No interactive stories found' }, { status: 404 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
