'use server';

import { createClient } from '@/lib/supabase/server';
import { addXP } from '@/lib/services/gamification';

// ============================================================
// XP rewards for referrals
// ============================================================
const REFERRAL_XP_PER_INVITE = 100;  // both referrer + new user get 100 XP
const REFERRAL_MILESTONE_5_XP = 500; // social butterfly badge threshold
const REFERRAL_MILESTONE_10_CREDIT = 500; // XP credit at 10 referrals

// ============================================================
// generateReferralCode
// Creates (or returns existing) unique ref code for a parent
// ============================================================
export async function generateReferralCode(): Promise<{
    code: string;
    url: string;
    conversions: number;
    clicks: number;
}> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if referral already exists
    const { data: existing } = await supabase
        .from('referrals')
        .select('ref_code, conversions, clicks')
        .eq('referrer_id', user.id)
        .eq('ref_type', 'friend')
        .maybeSingle();

    if (existing) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com';
        return {
            code: existing.ref_code,
            url: `${siteUrl}/signup?ref=${existing.ref_code}`,
            conversions: existing.conversions,
            clicks: existing.clicks,
        };
    }

    // Generate short unique code based on user ID
    const code = `LL${user.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

    const { error } = await supabase.from('referrals').insert({
        referrer_id: user.id,
        ref_code: code,
        ref_type: 'friend',
    });

    if (error) throw error;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com';
    return {
        code,
        url: `${siteUrl}/signup?ref=${code}`,
        conversions: 0,
        clicks: 0,
    };
}

// ============================================================
// claimReferralReward
// Called during signup when a ref code is present.
// Awards XP to both the new user's first child AND the referrer's first child.
// ============================================================
export async function claimReferralReward(refCode: string, newUserId: string): Promise<void> {
    const supabase = createClient();

    // Look up the referral
    const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id, conversions')
        .eq('ref_code', refCode)
        .maybeSingle();

    if (!referral) return;

    // Guard: same user referring themselves
    if (referral.referrer_id === newUserId) return;

    // Guard: already converted by this user
    const { data: existingConversion } = await supabase
        .from('referral_conversions')
        .select('id')
        .eq('referral_id', referral.id)
        .eq('referred_user', newUserId)
        .maybeSingle();

    if (existingConversion) return;

    // Log the conversion
    await supabase.from('referral_conversions').insert({
        referral_id: referral.id,
        referred_user: newUserId,
        xp_awarded: REFERRAL_XP_PER_INVITE,
    });

    const newConversions = referral.conversions + 1;

    // Update referral stats
    await supabase.from('referrals').update({
        conversions: newConversions,
        xp_earned: (referral.conversions || 0) + REFERRAL_XP_PER_INVITE,
    }).eq('id', referral.id);

    // Award XP to referrer's child using admin client (they may not be logged in)
    const { data: referrerChild } = await supabase
        .from('children')
        .select('id, parent_id')
        .eq('parent_id', referral.referrer_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (referrerChild) {
        await addXP(referrerChild.id, REFERRAL_XP_PER_INVITE, 'referral_invite');

        // Milestone badges
        if (newConversions === 5) {
            const { data: child } = await supabase.from('children').select('earned_badges').eq('id', referrerChild.id).single();
            const badges: string[] = child?.earned_badges || [];
            if (!badges.includes('social_butterfly')) {
                await Promise.all([
                    supabase.from('children').update({ earned_badges: [...badges, 'social_butterfly'] }).eq('id', referrerChild.id),
                    supabase.from('badge_earnings').upsert({ child_id: referrerChild.id, badge_id: 'social_butterfly' }, { onConflict: 'child_id,badge_id', ignoreDuplicates: true }),
                    addXP(referrerChild.id, REFERRAL_MILESTONE_5_XP, 'referral_milestone_5'),
                ]);
            }
        }

        if (newConversions === 10) {
            await addXP(referrerChild.id, REFERRAL_MILESTONE_10_CREDIT, 'referral_milestone_10');
        }
    }
}

// ============================================================
// trackReferralClick
// Called when the signup page loads with a ?ref= param
// ============================================================
export async function trackReferralClick(refCode: string): Promise<void> {
    const supabase = createClient();

    // Use a simple increment query — silently skip if RPC not set up
    await Promise.resolve(
        supabase.rpc('increment_referral_clicks', { code: refCode })
    ).catch(() => {
        // Non-critical — RPC may not be configured
    });
}

// ============================================================
// getReferralStats — for the Invite section in portal settings
// ============================================================
export async function getReferralStats(): Promise<{
    code: string;
    url: string;
    clicks: number;
    conversions: number;
    xpEarned: number;
} | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('referrals')
        .select('ref_code, clicks, conversions, xp_earned')
        .eq('referrer_id', user.id)
        .maybeSingle();

    if (!data) return null;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com';
    return {
        code: data.ref_code,
        url: `${siteUrl}/signup?ref=${data.ref_code}`,
        clicks: data.clicks,
        conversions: data.conversions,
        xpEarned: data.xp_earned,
    };
}
