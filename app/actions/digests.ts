'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export interface WeeklyChildStats {
    firstName: string;
    xpEarned: number;
    activitiesCount: number;
    storiesRead: number;
    songsHeard: number;
    streakDay: number;
    newBadgesCount: number;
}

/**
 * getWeeklyDigestData
 * Aggregates stats for the last 7 days for all children of a specific parent.
 */
export async function getWeeklyDigestData(profileId: string): Promise<WeeklyChildStats[]> {
    const supabase = createClient();

    // 1. Get children
    const { data: children } = await supabase
        .from('children')
        .select('id, first_name, current_streak')
        .eq('parent_id', profileId);

    if (!children || children.length === 0) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoDate = sevenDaysAgo.toISOString();

    const stats: WeeklyChildStats[] = [];

    for (const child of children) {
        // 2. Fetch activities for the last 7 days
        const { data: activities } = await supabase
            .from('activities')
            .select('activity_type, xp_earned')
            .eq('child_id', child.id)
            .gte('created_at', isoDate);

        // 3. Fetch badges earned in last 7 days
        const { count: newBadges } = await supabase
            .from('badge_earnings')
            .select('*', { count: 'exact', head: true })
            .eq('child_id', child.id)
            .gte('earned_at', isoDate);

        // 4. Aggregate
        const weekXp = (activities || []).reduce((sum, a) => sum + (a.xp_earned || 0), 0);
        const stories = (activities || []).filter(a => a.activity_type === 'story_read').length;
        const songs = (activities || []).filter(a => a.activity_type === 'song_listened').length;

        stats.push({
            firstName: child.first_name,
            xpEarned: weekXp,
            activitiesCount: activities?.length || 0,
            storiesRead: stories,
            songsHeard: songs,
            streakDay: child.current_streak,
            newBadgesCount: newBadges || 0
        });
    }

    return stats;
}

/**
 * sendWeeklyDigests
 * Cron-ready function to send digests to all active parents.
 */
export async function sendWeeklyDigests() {
    // This would typically iterate over users and call getWeeklyDigestData
    // For now, providing the logic skeleton that connects to lib/email.ts
    const { sendEmail, WEEKLY_DIGEST_TEMPLATE } = await import('@/lib/email');

    // Fetch all users with marketing_opt_in
    const { data: users } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('marketing_opt_in', true);

    if (!users) return { success: false, count: 0 };

    let sentCount = 0;
    for (const user of users) {
        const stats = await getWeeklyDigestData(user.id);

        // Only send if there was some activity or they have children
        if (stats.length > 0 && stats.some(s => s.activitiesCount > 0)) {
            const html = WEEKLY_DIGEST_TEMPLATE(user.full_name || 'Legend Parent', stats);
            await sendEmail({
                to: user.email,
                subject: "Weekly Legend Wrap-up! 🌴✨",
                html
            });
            sentCount++;
        }
    }

    return { success: true, count: sentCount };
}

/**
 * sendStreakNudges
 * Identifies children at risk of losing their streak and sends a nudge to parents.
 */
export async function sendStreakNudges() {
    const { sendEmail, STREAK_PROTECTION_TEMPLATE } = await import('@/lib/email');

    // 1. Find children with active streaks who haven't logged in TODAY
    // We use a raw query or secondary check because 'daily_logins' stores the records
    const today = new Date().toISOString().split('T')[0];

    // Fetch children with streak > 0
    const { data: atRiskChildren } = await supabaseAdmin
        .from('children')
        .select(`
            id, 
            first_name, 
            current_streak, 
            parent_id,
            profiles:parent_id (email, full_name)
        `)
        .gt('current_streak', 0);

    if (!atRiskChildren) return { success: false, count: 0 };

    let sentCount = 0;
    for (const child of atRiskChildren) {
        // Check if they have a login record for today
        const { data: todayLogin } = await supabaseAdmin
            .from('daily_logins')
            .select('id')
            .eq('child_id', child.id)
            .eq('login_date', today)
            .single();

        // If no login today, they are at risk!
        if (!todayLogin) {
            const parent = child.profiles as any;
            if (parent?.email) {
                const html = STREAK_PROTECTION_TEMPLATE(
                    parent.full_name || 'Legend Parent',
                    child.first_name,
                    child.current_streak
                );

                await sendEmail({
                    to: parent.email,
                    subject: `${child.first_name}'s ${child.current_streak}-day streak is at risk! 😱🔥`,
                    html
                });
                sentCount++;
            }
        }
    }

    return { success: true, count: sentCount };
}
