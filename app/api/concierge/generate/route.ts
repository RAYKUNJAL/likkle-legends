import { NextRequest, NextResponse } from 'next/server';
import { getIslandConcierge } from '@/lib/agents/island-concierge';
import { ISLAND_REGISTRY } from '@/lib/registries/islands';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { islandCode, childName, ageTrack, characterHost, action } = body;

        if (action === 'list-islands') {
            const concierge = getIslandConcierge();
            return NextResponse.json({ islands: concierge.getAvailableIslands() });
        }

        if (!islandCode || !ISLAND_REGISTRY[islandCode]) {
            return NextResponse.json({ error: 'Invalid island code' }, { status: 400 });
        }

        if (!childName) {
            return NextResponse.json({ error: 'Child name required' }, { status: 400 });
        }

        const track: 'mini' | 'big' = ageTrack === 'mini' ? 'mini' : 'big';
        const host: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko' = characterHost || 'roti';

        const concierge = getIslandConcierge();

        if (!concierge.isAvailable()) {
            return NextResponse.json({
                error: 'AI concierge is not configured. Please contact support.',
                fallback: true,
            }, { status: 503 });
        }

        const curriculum = await concierge.generateWeeklyCurriculum(
            islandCode,
            childName,
            track,
            host
        );

        // Store in Supabase if table exists
        try {
            await supabaseAdmin
                .from('island_curricula')
                .upsert({
                    user_id: user.id,
                    island_code: islandCode,
                    child_name: childName,
                    age_track: track,
                    character_host: host,
                    curriculum: curriculum,
                    generated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,island_code,child_name' });
        } catch (_e) {
            console.log('[CONCIERGE] Could not store curriculum (table may not exist):', _e);
        }

        return NextResponse.json({
            success: true,
            curriculum,
        });
    } catch (err: any) {
        console.error('[CONCIERGE] Error:', err);
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const islandCode = new URL(request.url).searchParams.get('island');
        const childName = new URL(request.url).searchParams.get('child');

        let query = supabaseAdmin.from('island_curricula').select('*').eq('user_id', user.id);
        if (islandCode) query = query.eq('island_code', islandCode);
        if (childName) query = query.eq('child_name', childName);

        const { data, error } = await query.order('generated_at', { ascending: false }).limit(10);

        if (error) throw error;

        return NextResponse.json({ curricula: data || [] });
    } catch (err: any) {
        console.error('[CONCIERGE] GET error:', err);
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
    }
}
