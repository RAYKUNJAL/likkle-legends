import { supabaseAdmin } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: stories, error } = await supabaseAdmin
            .from('stories_library')
            .select('id, title, slug, summary, cover_image_url, tradition, reading_level, age_track, island_code, character, xp_reward, estimated_reading_time_minutes')
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
