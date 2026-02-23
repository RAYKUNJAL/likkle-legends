import { supabase } from '@/lib/storage';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase-client';
import { getChild, updateChild } from './children';
import { BADGES } from '@/lib/gamification';

export async function logActivity(
    profileId: string,
    childId: string,
    activityType: string,
    contentId?: string,
    xpEarned = 0,
    durationSeconds?: number,
    metadata: Record<string, unknown> = {}
) {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('activities').insert({
        profile_id: profileId,
        child_id: childId,
        activity_type: activityType,
        content_id: contentId,
        xp_earned: xpEarned,
        duration_seconds: durationSeconds,
        metadata,
    });

    if (error) throw error;

    // Update streak
    await updateStreak(childId);

    // If it's a mission, update cultural_milestones
    if (activityType === 'mission' && contentId) {
        const child = await getChild(childId);
        const milestones = [...(child.cultural_milestones || [])];
        if (!milestones.includes(contentId)) {
            milestones.push(contentId);
            await updateChild(childId, { cultural_milestones: milestones });
        }
    }

    // Add XP if earned
    if (xpEarned > 0) {
        // Apply global multiplier
        const multiplier = await getXPMultiplier();
        const adjustedXP = Math.floor(xpEarned * multiplier);
        await addXP(childId, adjustedXP, activityType);
    }

    // Update family challenge progress (fire-and-forget, non-blocking)
    try {
        const { updateChallengeProgress } = await import('@/app/actions/challenges');
        await updateChallengeProgress(childId, activityType);
    } catch {
        // Silently skip if challenges table doesn't exist yet
    }

    // Check for badges
    const unlockedBadge = await checkBadgeUnlock(childId, activityType);

    return {
        xpEarned,
        unlockedBadge
    };
}

async function checkBadgeUnlock(childId: string, activityType: string): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;

    // 1. Weekend Warrior Badge (Earning > 500 XP over a weekend)
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday or Saturday

    if (isWeekend) {
        // Calculate start of weekend (last Saturday 00:00)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -1 : 6); // Last Saturday
        const weekendStart = new Date(now.setDate(diff));
        weekendStart.setHours(0, 0, 0, 0);

        const { data: xpData } = await supabase
            .from('activities')
            .select('xp_earned')
            .eq('child_id', childId)
            .gte('created_at', weekendStart.toISOString());

        const totalWeekendXP = xpData?.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0) || 0;

        if (totalWeekendXP >= 500) {
            const hasBadge = await earnBadge(childId, 'weekend_warrior');
            if (hasBadge) return 'weekend_warrior';
        }
    }

    return null;
}

export async function getRecentActivities(childId: string, limit = 20) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function addXP(childId: string, xpAmount: number, source: string) {
    // Get current XP
    const child = await getChild(childId);
    const newXP = (child.total_xp || 0) + xpAmount;

    // Update child XP
    await updateChild(childId, { total_xp: newXP });

    // Log the activity
    await supabase.from('activities').insert({
        child_id: childId,
        profile_id: child.parent_id,
        activity_type: 'xp_earn',
        xp_earned: xpAmount,
        metadata: { source },
    });

    return newXP;
}

export async function updateStreak(childId: string) {
    const child = await getChild(childId);
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = child.last_activity_date;

    let newStreak = child.current_streak || 0;

    if (!lastActivity) {
        newStreak = 1;
    } else {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
    }

    const longestStreak = Math.max(newStreak, child.longest_streak || 0);

    // Only update if changed
    if (newStreak !== child.current_streak || lastActivity !== today) {
        await updateChild(childId, {
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_activity_date: today,
        });
    }

    return { currentStreak: newStreak, longestStreak };
}

export async function earnBadge(childId: string, badgeId: string) {
    // Check if already earned
    const { data: existing } = await supabase
        .from('badge_earnings')
        .select('id')
        .eq('child_id', childId)
        .eq('badge_id', badgeId)
        .single();

    if (existing) return false;

    // Award badge
    const { error } = await supabase.from('badge_earnings').insert({
        child_id: childId,
        badge_id: badgeId,
    });

    if (error) throw error;

    // Update child's earned badges array
    const child = await getChild(childId);
    const earnedBadges = [...(child.earned_badges || []), badgeId];
    await updateChild(childId, { earned_badges: earnedBadges });

    return true;
}

export async function getEarnedBadges(childId: string) {
    if (!isSupabaseConfigured()) return [];

    // Check if badge_earnings table exists first or handle error gracefully
    // For now assuming it exists
    const { data, error } = await supabase
        .from('badge_earnings')
        .select('*')
        .eq('child_id', childId)
        .order('earned_at', { ascending: false });

    if (error) {
        console.warn("Failed to fetch badges (table might be missing):", error);
        return [];
    }
    return data || [];
}

// Alias for compatibility
export const getChildBadges = getEarnedBadges;

/**
 * getXPMultiplier
 * Fetches the global XP multiplier from site_settings.
 */
export async function getXPMultiplier(): Promise<number> {
    try {
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'xp_multiplier')
            .maybeSingle();

        return Number(data?.value) || 1;
    } catch {
        return 1;
    }
}

/**
 * sendMangoGift
 * Allows children to send small XP gifts to friends.
 */
export async function sendMangoGift(senderId: string, receiverId: string, message?: string) {
    // 1. Check daily limit
    const sentToday = await getDailyGiftsSent(senderId);
    if (sentToday >= 3) return { success: false, error: 'Daily gift limit (3) reached!' };

    // 2. Insert gift
    const { error } = await supabase.from('mango_gifts').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        xp_value: 5
    });

    if (error) throw error;

    // 3. Award XP to receiver
    await addXP(receiverId, 5, 'mango_gift');

    return { success: true };
}

async function getDailyGiftsSent(senderId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
        .from('mango_gifts')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', senderId)
        .eq('created_at', today);

    return count || 0;
}
