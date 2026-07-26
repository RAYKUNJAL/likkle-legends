import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { narrateBook, narrateAllBooks } from '@/lib/agents/tanty-narrator';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min for batch narration

/**
 * POST /api/tanty/narrate
 * Body: { bookId?: string, all?: boolean }
 * Admin-only — generates ElevenLabs narration for story library books.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin check
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_admin')
            .eq('id', user.id)
            .maybeSingle();

        if (!profile?.is_admin && profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }

        const body = await req.json();
        const { bookId, all } = body;

        if (all) {
            const results = await narrateAllBooks();
            return NextResponse.json({ success: true, results });
        }

        if (!bookId) {
            return NextResponse.json({ error: 'Provide bookId or set all=true' }, { status: 400 });
        }

        const result = await narrateBook(bookId);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error('[/api/tanty/narrate] Error:', err);
        return NextResponse.json({ error: err?.message || 'Narration failed' }, { status: 500 });
    }
}
