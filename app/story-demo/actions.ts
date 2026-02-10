"use server";

import { createClient } from '@supabase/supabase-js';

export async function fetchLatestStory() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            return { success: false, error: 'Supabase credentials not configured' };
        }

        const supabase = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        // Fetch the most recently created interactive story (has pages JSON in body_text)
        const { data: items, error: itemErr } = await supabase
            .from('content_items')
            .select('id, title, slug, island_code, created_at')
            .eq('content_type', 'story')
            .order('created_at', { ascending: false })
            .limit(5);

        if (itemErr) {
            return { success: false, error: `DB Error: ${itemErr.message}` };
        }
        if (!items || items.length === 0) {
            return { success: false, error: 'No stories found. Generate one first!' };
        }

        // Find the first story that has a proper localization with pages JSON
        for (const item of items) {
            const { data: locRows, error: locErr } = await supabase
                .from('content_localizations')
                .select('body_text, audio_url')
                .eq('content_item_id', item.id)
                .eq('dialect_type', 'standard_english')
                .limit(1);

            if (locErr || !locRows || locRows.length === 0) continue;

            const loc = locRows[0];

            // Check if body_text is a JSON with pages (interactive story format)
            try {
                const parsed = JSON.parse(loc.body_text);
                if (parsed.pages && Array.isArray(parsed.pages)) {
                    return {
                        success: true,
                        story: {
                            title: item.title,
                            ...parsed
                        }
                    };
                }
            } catch {
                // Not JSON, skip this one
                continue;
            }
        }

        return { success: false, error: 'No interactive stories found with page data.' };
    } catch (err: any) {
        console.error('Failed to load story:', err);
        return { success: false, error: err.message || 'Failed to load story' };
    }
}
