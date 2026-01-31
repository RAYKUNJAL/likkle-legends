
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// ==============================================================================
// 1. PROMOTER ACTIONS (The "Cash" Engine)
// ==============================================================================

/**
 * Apply to become a promoter
 */
export async function applyToBecomePromoter(paypalEmail: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in to apply");

    // Check if already exists
    const { data: existing } = await supabase
        .from('promoters')
        .select('status')
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { success: false, message: "Application already submitted", status: existing.status };
    }

    // Generate unique code based on name or random
    const baseCode = user.user_metadata?.full_name?.split(' ')[0]?.toUpperCase() || 'LEGEND';
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `${baseCode}${uniqueSuffix}`;

    const { error } = await supabase.from('promoters').insert({
        user_id: user.id,
        paypal_email: paypalEmail,
        referral_code: referralCode,
        status: 'pending_approval' // Manual approval for quality control
    });

    if (error) throw error;

    return { success: true, message: "Application submitted! We will review it shortly." };
}

/**
 * Get Promoter Dashboard Data
 */
export async function getPromoterStats() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: promoter } = await supabase
        .from('promoters')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!promoter) return null;

    // Get clicks (mocking count for now if table empty, or real query)
    const { count: clicks } = await supabase
        .from('referral_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('referral_code', promoter.referral_code);

    // Get conversions via Referral Credits or Orders (logic to link order to ref code needed in checkout)
    // For MVP, we pass simple stats
    return {
        ...promoter,
        clicks: clicks || 0,
        referralLink: `https://likklelegends.com/?ref=${promoter.referral_code}`
    };
}

// ==============================================================================
// 2. PARENT REFERRAL ACTIONS (The "Credit" Engine)
// ==============================================================================

/**
 * Get unique parent referral code (auto-generated if missing)
 */
export async function getParentReferralCode() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // We store the simple parent ref code in user_metadata for lightweight access
    let refCode = user.user_metadata?.my_referral_code;

    if (!refCode) {
        // Generate one
        const namePart = user.user_metadata?.full_name?.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'FAM';
        const randomPart = Math.floor(100 + Math.random() * 900);
        refCode = `${namePart}${randomPart}`;

        await supabase.auth.updateUser({
            data: { my_referral_code: refCode }
        });
    }

    return refCode;
}

/**
 * Get earned credits
 */
export async function getReferralCredits() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { earned_months: 0, pending: 0 };

    const { data: credits } = await supabase
        .from('referral_credits')
        .select('status, credit_amount')
        .eq('referrer_id', user.id);

    const earned = credits?.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + (c.credit_amount || 0), 0) || 0;
    const pending = credits?.filter(c => c.status === 'pending').length || 0;

    return { earned_months: earned, pending };
}

// ==============================================================================
// 3. VIRAL CONTEST ACTIONS (The "UpViral" Clone)
// ==============================================================================

/**
 * Enter a contest
 */
export async function enterContest(contestSlug: string, email: string, referredBy?: string) {
    const supabase = createClient();

    // 1. Get Contest ID
    const { data: contest } = await supabase
        .from('contests')
        .select('id, settings, is_active')
        .eq('slug', contestSlug)
        .single();

    if (!contest || !contest.is_active) {
        throw new Error("Contest not active");
    }

    // 2. Check if already entered
    const { data: existing } = await supabase
        .from('contest_entries')
        .select('*')
        .eq('contest_id', contest.id)
        .eq('email', email)
        .single();

    if (existing) {
        return {
            success: true,
            entry: existing,
            message: "You are already entered!"
        };
    }

    // 3. Create Entry
    const { data: newEntry, error } = await supabase
        .from('contest_entries')
        .insert({
            contest_id: contest.id,
            email: email,
            referred_by_code: referredBy || null,
            total_points: contest.settings?.points_signup || 10
        })
        .select()
        .single();

    if (error) throw error;

    return {
        success: true,
        entry: newEntry,
        message: "You're in! Share to win more."
    };
}

/**
 * Get Contest Leaderboard & User Stats
 */
export async function getContestStats(contestSlug: string, userEntryId?: string) {
    const supabase = createClient();

    const { data: contest } = await supabase
        .from('contests')
        .select('id, prizes')
        .eq('slug', contestSlug)
        .single();

    if (!contest) return null;

    // Get Top 10
    const { data: leaderboard } = await supabase
        .from('contest_entries')
        .select('email, total_points, referral_count')
        .eq('contest_id', contest.id)
        .order('total_points', { ascending: false })
        .limit(10);

    // Get User Stats if provided
    let userStats = null;
    if (userEntryId) {
        const { data: me } = await supabase
            .from('contest_entries')
            .select('*')
            .eq('id', userEntryId)
            .single();
        userStats = me;
    }

    return {
        leaderboard: leaderboard?.map(l => ({
            ...l,
            email: l.email.substring(0, 3) + '***' + l.email.split('@')[1] // Mask email
        })),
        prizes: contest.prizes,
        userStats
    };
}
