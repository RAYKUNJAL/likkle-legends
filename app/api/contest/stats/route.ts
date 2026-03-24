import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: contest } = await admin
        .from('contests')
        .select('id, prizes')
        .eq('slug', slug)
        .single();

    if (!contest) {
        return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Get top 10
    const { data: leaderboard } = await admin
        .from('contest_entries')
        .select('email, total_points, referral_count')
        .eq('contest_id', contest.id)
        .order('total_points', { ascending: false })
        .limit(10);

    // Get total entries count
    const { count: totalEntries } = await admin
        .from('contest_entries')
        .select('*', { count: 'exact', head: true })
        .eq('contest_id', contest.id);

    return NextResponse.json({
        leaderboard: leaderboard?.map((l) => ({
            ...l,
            email: l.email.substring(0, 3) + '***@' + l.email.split('@')[1],
        })),
        prizes: contest.prizes,
        totalEntries: totalEntries || 0,
    });
}
