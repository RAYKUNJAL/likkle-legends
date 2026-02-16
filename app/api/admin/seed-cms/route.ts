
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Lazy imports to prevent Supabase initialization at build time
        const { createAdminClient } = await import('@/lib/admin');
        const { siteContent } = await import('@/lib/content');

        const admin = createAdminClient();
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
