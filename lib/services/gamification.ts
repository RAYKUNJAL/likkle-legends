import { supabase } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import { getChild, updateChild } from './children';

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
        await addXP(childId, xpEarned, activityType);
    }
    // Check for badges
    await checkBadgeUnlock(childId, activityType);
}

import { BADGES } from '@/lib/gamification';

async function checkBadgeUnlock(childId: string, activityType: string) {
    // 1. Get counts
    const { count } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .eq('activity_type', activityType);

    if (!count) return;

    // 2. Define Rules (Simple MVP map)
    const rules = [
        { type: 'story', threshold: 1, badge: BADGES.first_story.id },
        { type: 'story', threshold: 10, badge: BADGES.story_explorer.id },
        { type: 'story', threshold: 50, badge: BADGES.story_master.id },
        { type: 'song', threshold: 1, badge: BADGES.first_song.id },
        { type: 'song', threshold: 25, badge: BADGES.music_lover.id },
        { type: 'song', threshold: 100, badge: BADGES.steelpan_star.id },
    ];

    // 3. Check and Award
    for (const rule of rules) {
        if (activityType === rule.type && count >= rule.threshold) {
            await earnBadge(childId, rule.badge);
        }
    }
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

    await updateChild(childId, {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
    });

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
    const { data, error } = await supabase
        .from('badge_earnings')
        .select('*')
        .eq('child_id', childId)
        .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
