
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

    // Fetch from the new column in the users/profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('my_referral_code')
        .eq('id', user.id)
        .single();

    return profile?.my_referral_code || null;
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
        .select('id, settings, is_active, slug')
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

    // 3. Handle Referral from Cookie if not provided
    let finalReferredBy = referredBy;
    if (!finalReferredBy) {
        const cookieStore = cookies();
        finalReferredBy = cookieStore.get('likkle_ref')?.value;
    }

    // 4. Create Entry
    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const linkCode = `${email.split('@')[0].replace(/[^a-zA-Z]/g, '').substring(0, 4)}-${uniqueSuffix}`;

    const { data: newEntry, error } = await supabase
        .from('contest_entries')
        .insert({
            contest_id: contest.id,
            email: email,
            referred_by_code: finalReferredBy || null,
            referral_link_code: linkCode,
            total_points: contest.settings?.points_signup || 10
        })
        .select()
        .single();

    if (error) throw error;

    // 5. If referred, award points to the referrer
    if (finalReferredBy) {
        // Find referrer entry for THIS contest
        const { data: referrer } = await supabase
            .from('contest_entries')
            .select('id, total_points, referral_count')
            .eq('contest_id', contest.id)
            .eq('referral_link_code', finalReferredBy) // We need to ensure entries have their own link codes
            .single();

        if (referrer) {
            await supabase
                .from('contest_entries')
                .update({
                    total_points: referrer.total_points + (contest.settings?.points_per_referral || 50),
                    referral_count: (referrer.referral_count || 0) + 1
                })
                .eq('id', referrer.id);
        }
    }

    return {
        success: true,
        entry: newEntry,
        message: "You're in! Share to win more."
    };
}

/**
 * Award points for manual actions (like social sharing)
 */
export async function awardActionPoints(entryId: string, actionSlug: string) {
    const supabase = createClient();

    const { data: entry } = await supabase
        .from('contest_entries')
        .select('*, contests(settings)')
        .eq('id', entryId)
        .single();

    if (!entry) throw new Error("Entry not found");

    const points = entry.contests?.settings?.action_points?.[actionSlug] || 5;

    const { error } = await supabase
        .from('contest_entries')
        .update({
            total_points: entry.total_points + points
        })
        .eq('id', entryId);

    if (error) throw error;

    return { success: true, pointsAdded: points };
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

// ==============================================================================
// 4. ADMIN AFFILIATE MANAGEMENT
// ==============================================================================

/**
 * Get all promoters for admin dashboard
 */
export async function getAllPromotersAdmin(token: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('promoters')
        .select(`
            *,
            profiles:user_id (
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching promoters:', error);
        return [];
    }

    return data || [];
}

/**
 * Update promoter status (approve/suspend)
 */
export async function updatePromoterStatus(token: string, promoterId: string, status: 'approved' | 'suspended') {
    const supabase = createClient();

    const { error } = await supabase
        .from('promoters')
        .update({ status })
        .eq('id', promoterId);

    if (error) {
        console.error('Error updating promoter status:', error);
        throw error;
    }

    return { success: true };
}

/**
 * Get affiliate analytics for admin dashboard
 */
export async function getAffiliateAnalytics(token: string) {
    const supabase = createClient();

    // Get all promoters
    const { data: promoters, error } = await supabase
        .from('promoters')
        .select('status, total_earned, total_paid');

    if (error) {
        console.error('Error fetching affiliate analytics:', error);
        return null;
    }

    const totalAffiliates = promoters?.length || 0;
    const activeAffiliates = promoters?.filter(p => p.status === 'approved').length || 0;
    const pendingApplications = promoters?.filter(p => p.status === 'pending_approval').length || 0;
    const totalCommissionsEarned = promoters?.reduce((sum, p) => sum + (p.total_earned || 0), 0) || 0;
    const totalCommissionsPaid = promoters?.reduce((sum, p) => sum + (p.total_paid || 0), 0) || 0;

    // Get referral count
    const { count: totalReferrals } = await supabase
        .from('referral_clicks')
        .select('*', { count: 'exact', head: true });

    return {
        totalAffiliates,
        activeAffiliates,
        pendingApplications,
        totalCommissionsEarned,
        totalCommissionsPaid,
        totalReferrals: totalReferrals || 0
    };
}

