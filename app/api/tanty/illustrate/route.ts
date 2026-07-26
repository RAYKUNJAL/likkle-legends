import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    illustratePage,
    illustrateBook,
    illustrateAllBooks,
} from '@/lib/agents/tanty-illustrator';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min — batch illustration can take a while

/**
 * POST /api/tanty/illustrate
 * Body options (any combination):
 *   { bookId, page }            -> illustrate a single page of a book
 *   { bookId, force? }          -> illustrate every page of a book (skips pages that already have an image_url unless force=true)
 *   { all: true, force? }      -> illustrate every page of every active book
 *
 * Admin-only — protected by CRON_SECRET bearer token or an admin Supabase session.
 */
export async function POST(req: NextRequest) {
    try {
        // Auth: CRON_SECRET bearer OR admin Supabase session
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
            // Authorized via CRON_SECRET — proceed
        } else {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile?.is_admin && profile?.role !== 'admin' && profile?.role !== 'super_admin') {
                return NextResponse.json({ error: 'Admin only' }, { status: 403 });
            }
        }

        const body = await req.json();
        const { bookId, page, all, force } = body;

        // Batch: every active book
        if (all) {
            const results = await illustrateAllBooks({ force: !!force });
            return NextResponse.json({ success: true, results });
        }

        if (!bookId) {
            return NextResponse.json(
                { error: 'Provide bookId (with optional page) or set all=true' },
                { status: 400 },
            );
        }

        // Single page
        if (typeof page === 'number') {
            const result = await illustratePage(bookId, page);
            return NextResponse.json(result);
        }

        // Every page of one book
        const result = await illustrateBook(bookId, { force: !!force });
        return NextResponse.json(result);
    } catch (err: any) {
        console.error('[/api/tanty/illustrate] Error:', err);
        return NextResponse.json({ error: err?.message || 'Illustration failed' }, { status: 500 });
    }
}
