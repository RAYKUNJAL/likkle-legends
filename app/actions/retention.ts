'use server';

import { createClient } from '@/lib/supabase/server';
import { XP_ACTIONS } from '@/lib/gamification';

// ============================================================
// Streak XP milestone map
// ============================================================
const STREAK_MILESTONES: Record<number, { xp: number; badge?: string; cosmetic?: string }> = {
    1: { xp: XP_ACTIONS.DAILY_LOGIN_DAY1 },
    3: { xp: XP_ACTIONS.DAILY_LOGIN_DAY3_BONUS },
    7: { xp: XP_ACTIONS.STREAK_BONUS_7_DAYS, badge: 'week_warrior' },
    14: { xp: XP_ACTIONS.STREAK_BONUS_14_DAYS, badge: 'fortnight_fire' },
    30: { xp: XP_ACTIONS.STREAK_BONUS_30_DAYS, badge: 'legend_title' },
};

// Base XP per daily login (non-milestone days)
const BASE_LOGIN_XP = 10;

// ============================================================
// checkDailyLogin
// Idempotent — safe to call on every portal load.
// Awards XP and updates streak once per calendar day.
// ============================================================
export async function checkDailyLogin(childId: string): Promise<{
    alreadyLoggedIn: boolean;
    streakDay: number;
    xpAwarded: number;
    badgeUnlocked: string | null;
    chestReady: boolean;
}> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // --- Check if already logged in today ---
    const { data: existingLogin } = await supabase
        .from('daily_logins')
        .select('id, streak_day')
        .eq('child_id', childId)
        .eq('login_date', today)
        .maybeSingle();

    // Check chess state for today regardless
    const { data: chestRow } = await supabase
        .from('reward_chests')
        .select('id, unlocked_at')
        .eq('child_id', childId)
        .eq('chest_date', today)
        .maybeSingle();

    const chestReady = !!chestRow && !chestRow.unlocked_at;

    if (existingLogin) {
        return {
            alreadyLoggedIn: true,
            streakDay: existingLogin.streak_day,
            xpAwarded: 0,
            badgeUnlocked: null,
            chestReady,
        };
    }

    // --- Compute new streak ---
    const { data: child } = await supabase
        .from('children')
        .select('current_streak, last_activity_date, total_xp, earned_badges')
        .eq('id', childId)
        .single();

    if (!child) return { alreadyLoggedIn: false, streakDay: 1, xpAwarded: 0, badgeUnlocked: null, chestReady: false };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = child.last_activity_date?.split('T')[0];

    let newStreak = 1;
    if (lastDate === yesterday) {
        newStreak = (child.current_streak || 0) + 1;
    } else if (lastDate === today) {
        // Shouldn't happen but guard
        newStreak = child.current_streak || 1;
    }

    // --- Determine XP for this streak day ---
    const milestone = STREAK_MILESTONES[newStreak];
    const xpAwarded = milestone ? milestone.xp : BASE_LOGIN_XP;
    const badgeToGrant = milestone?.badge || null;

    // --- Award badge if eligible and not already earned ---
    let badgeUnlocked: string | null = null;
    if (badgeToGrant) {
        const earnedBadges: string[] = child.earned_badges || [];
        if (!earnedBadges.includes(badgeToGrant)) {
            badgeUnlocked = badgeToGrant;
        }
    }

    const newXP = (child.total_xp || 0) + xpAwarded;
    const earnedBadges: string[] = child.earned_badges || [];
    const updatedBadges = badgeUnlocked ? [...earnedBadges, badgeUnlocked] : earnedBadges;

    // --- Persist: update child + insert daily_login + create today's chest ---
    await Promise.all([
        supabase.from('children').update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, child.current_streak || 0),
            total_xp: newXP,
            last_activity_date: new Date().toISOString(),
            earned_badges: updatedBadges,
        }).eq('id', childId),

        supabase.from('daily_logins').insert({
            child_id: childId,
            login_date: today,
            xp_awarded: xpAwarded,
            streak_day: newStreak,
            badge_earned: badgeUnlocked,
        }),

        // Create today's chest (if it doesn't exist yet)
        supabase.from('reward_chests').upsert({
            child_id: childId,
            chest_date: today,
        }, { onConflict: 'child_id,chest_date', ignoreDuplicates: true }),

        // Log badge earning if any
        ...(badgeUnlocked ? [supabase.from('badge_earnings').upsert(
            { child_id: childId, badge_id: badgeUnlocked },
            { onConflict: 'child_id,badge_id', ignoreDuplicates: true }
        )] : []),
    ]);

    return {
        alreadyLoggedIn: false,
        streakDay: newStreak,
        xpAwarded,
        badgeUnlocked,
        chestReady: true, // Just created — always ready
    };
}

// ============================================================
// openDailyChest
// Assigns a random reward and marks the chest as opened.
// ============================================================

const CHEST_REWARDS = [
    // Weighted: 60% XP, 30% badge, 10% cosmetic
    ...Array(60).fill(null).map((_, i) => ({
        type: 'xp' as const,
        value: String([5, 10, 15, 20, 25][i % 5]), // vary the xp amounts
    })),
    ...Array(30).fill(null).map((_, i) => ({
        type: 'badge' as const,
        value: ['first_story', 'first_song', 'patois_starter'][i % 3],
    })),
    ...Array(10).fill(null).map(() => ({
        type: 'cosmetic' as const,
        value: 'tanty_spice_hat', // first cosmetic — expand later
    })),
];

export async function openDailyChest(childId: string): Promise<{
    success: boolean;
    rewardType: 'xp' | 'badge' | 'cosmetic' | null;
    rewardValue: string | null;
    error?: string;
}> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's chest
    const { data: chest } = await supabase
        .from('reward_chests')
        .select('id, unlocked_at')
        .eq('child_id', childId)
        .eq('chest_date', today)
        .maybeSingle();

    if (!chest) return { success: false, rewardType: null, rewardValue: null, error: 'No chest for today' };
    if (chest.unlocked_at) return { success: false, rewardType: null, rewardValue: null, error: 'Already opened today' };

    // Pick random reward
    const reward = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)];

    // Apply reward
    if (reward.type === 'xp') {
        const { data: child } = await supabase.from('children').select('total_xp').eq('id', childId).single();
        if (child) {
            await supabase.from('children').update({
                total_xp: (child.total_xp || 0) + parseInt(reward.value)
            }).eq('id', childId);
        }
    } else if (reward.type === 'badge') {
        const { data: child } = await supabase.from('children').select('earned_badges').eq('id', childId).single();
        const earnedBadges: string[] = child?.earned_badges || [];
        if (!earnedBadges.includes(reward.value)) {
            await Promise.all([
                supabase.from('children').update({ earned_badges: [...earnedBadges, reward.value] }).eq('id', childId),
                supabase.from('badge_earnings').upsert({ child_id: childId, badge_id: reward.value }, { onConflict: 'child_id,badge_id', ignoreDuplicates: true }),
            ]);
        }
    }

    // Mark chest as opened
    await supabase.from('reward_chests').update({
        unlocked_at: new Date().toISOString(),
        reward_type: reward.type,
        reward_value: reward.value,
    }).eq('id', chest.id);

    return { success: true, rewardType: reward.type, rewardValue: reward.value };
}

// ============================================================
// buyStreakFreeze
// Uses a banked freeze if available; otherwise fails gracefully
// (PayPal $0.99 flow can be wired separately via checkout page)
// ============================================================
export async function buyStreakFreeze(childId: string): Promise<{
    success: boolean;
    usedExisting: boolean;
    remainingFreezes: number;
    error?: string;
}> {
    const supabase = createClient();

    // Get current freeze inventory
    const { data: freezeRow } = await supabase
        .from('streak_freezes')
        .select('id, freeze_count')
        .eq('child_id', childId)
        .maybeSingle();

    const currentFreezes = freezeRow?.freeze_count || 0;

    if (currentFreezes > 0) {
        // Use one from inventory
        const newCount = currentFreezes - 1;
        if (freezeRow) {
            await supabase.from('streak_freezes').update({
                freeze_count: newCount,
                updated_at: new Date().toISOString(),
            }).eq('id', freezeRow.id);
        }

        // Apply freeze: insert yesterday's login with streak preserved
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        await supabase.from('daily_logins').upsert({
            child_id: childId,
            login_date: yesterday,
            xp_awarded: 0,
            streak_day: -1, // -1 = freeze-applied marker
        }, { onConflict: 'child_id,login_date', ignoreDuplicates: true });

        return { success: true, usedExisting: true, remainingFreezes: newCount };
    }

    // No freeze available — signal to the UI to offer purchase
    return {
        success: false,
        usedExisting: false,
        remainingFreezes: 0,
        error: 'no_freezes_available',
    };
}

// ============================================================
// getFreezeCount — simple getter for the streak widget
// ============================================================
export async function getFreezeCount(childId: string): Promise<number> {
    const supabase = createClient();
    const { data } = await supabase
        .from('streak_freezes')
        .select('freeze_count')
        .eq('child_id', childId)
        .maybeSingle();
    return data?.freeze_count || 0;
}
