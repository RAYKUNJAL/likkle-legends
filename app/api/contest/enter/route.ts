import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function POST(request: NextRequest) {
    try {
        const { slug, email, referred_by } = await request.json();

        if (!slug || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Get contest
        const { data: contest } = await admin
            .from('contests')
            .select('id, settings, is_active')
            .eq('slug', slug)
            .single();

        if (!contest || !contest.is_active) {
            return NextResponse.json({ error: 'Contest not active' }, { status: 404 });
        }

        // 2. Check existing entry
        const { data: existing } = await admin
            .from('contest_entries')
            .select('*')
            .eq('contest_id', contest.id)
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json({
                success: true,
                entry: existing,
                message: 'You are already entered!',
            });
        }

        // 3. Create entry with unique referral code
        const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const linkCode = `${email.split('@')[0].replace(/[^a-zA-Z]/g, '').substring(0, 4)}-${uniqueSuffix}`;
        const signupPoints = contest.settings?.points_signup || 10;

        const { data: newEntry, error: insertError } = await admin
            .from('contest_entries')
            .insert({
                contest_id: contest.id,
                email: email.toLowerCase(),
                referred_by_code: referred_by || null,
                referral_link_code: linkCode,
                total_points: signupPoints,
                referral_count: 0,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Contest entry error:', insertError);
            return NextResponse.json({ error: 'Failed to enter contest' }, { status: 500 });
        }

        // 4. Award referral points
        if (referred_by) {
            const { data: referrer } = await admin
                .from('contest_entries')
                .select('id, total_points, referral_count')
                .eq('contest_id', contest.id)
                .eq('referral_link_code', referred_by)
                .single();

            if (referrer) {
                const referralPoints = contest.settings?.points_per_referral || 50;
                await admin
                    .from('contest_entries')
                    .update({
                        total_points: referrer.total_points + referralPoints,
                        referral_count: (referrer.referral_count || 0) + 1,
                    })
                    .eq('id', referrer.id);
            }
        }

        return NextResponse.json({
            success: true,
            entry: newEntry,
            message: "You're in! Share to win more.",
        });
    } catch (error) {
        console.error('Contest enter error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
