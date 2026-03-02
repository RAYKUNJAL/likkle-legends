
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Accept either bearer token auth or active cookie session
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        let userId: string | null = null;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const { supabaseAdmin } = await import('@/lib/supabase-client');
            const { data: { user } } = await supabaseAdmin.auth.getUser(token);
            userId = user?.id || null;
        }

        if (!userId) {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id || null;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Lazy imports to prevent Supabase initialization at build time
        const { createAdminClient } = await import('@/lib/admin');
        const { siteContent } = await import('@/lib/content');

        const admin = createAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('role, is_admin')
            .eq('id', userId)
            .single();

        if (!(profile?.is_admin || profile?.role === 'admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const keys = Object.keys(siteContent);
        const updates = keys.map(key => ({
            key,
            content: (siteContent as any)[key],
            updated_at: new Date().toISOString()
        }));

        const { error } = await admin
            .from('site_settings')
            .upsert(updates);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Seeded ${keys.length} sections` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
    }
}
