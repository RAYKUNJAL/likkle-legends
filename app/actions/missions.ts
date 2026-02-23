'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/admin';

/**
 * Claim a mission reward — saves XP + increments missions_completed on the child record.
 * Called when the child clicks "Claim Reward" on a completed mission.
 */
export async function claimMissionReward(missionId: string, rewardXp: number) {
    const supabase = createClient();

    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // 2. Find the active child for this parent
        const { data: child, error: childError } = await supabase
            .from('children')
            .select('id, total_xp, missions_completed, current_streak, last_activity_date')
            .eq('parent_id', user.id)
            .order('last_activity_date', { ascending: false })
            .limit(1)
            .single();

        if (childError || !child) {
            return { success: false, error: 'No child profile found' };
        }

        // 3. Calculate streak (if last activity was yesterday, increment; if today already, keep; else reset)
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = child.last_activity_date?.split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let newStreak = child.current_streak || 0;
        if (lastActivity === today) {
            // Already active today — don't change streak
        } else if (lastActivity === yesterday) {
            // Consecutive day — increment
            newStreak = newStreak + 1;
        } else {
            // Gap — reset to 1
            newStreak = 1;
        }

        // 4. Update child XP + missions_completed + streak
        const newXp = (child.total_xp || 0) + rewardXp;
        const newMissionCount = (child.missions_completed || 0) + 1;

        const { error: updateError } = await supabase
            .from('children')
            .update({
                total_xp: newXp,
                missions_completed: newMissionCount,
                current_streak: newStreak,
                last_activity_date: new Date().toISOString(),
            })
            .eq('id', child.id);

        if (updateError) {
            console.error('Failed to update child XP:', updateError);
            return { success: false, error: updateError.message };
        }

        // 5. Log to usage_logs for analytics tracking
        await supabase.from('usage_logs').insert({
            user_id: user.id,
            action: 'mission_completed',
            metadata: {
                mission_id: missionId,
                xp_awarded: rewardXp,
                child_id: child.id,
                new_total_xp: newXp,
            },
        }).then(() => { }); // fire-and-forget, non-critical

        console.log(`✅ Mission claimed: +${rewardXp} XP for child ${child.id}. Total: ${newXp}`);

        return {
            success: true,
            newXp,
            newStreak,
            newMissionCount,
        };

    } catch (err: any) {
        console.error('claimMissionReward exception:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Load mission progress for the active child.
 * Returns a map of missionId → { completed, progress }
 */
export async function getMissionProgress(): Promise<Record<string, { completed: boolean; progress: number }>> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    // Get today's completed missions from usage_logs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: logs } = await supabase
        .from('usage_logs')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('action', 'mission_completed')
        .gte('created_at', todayStart.toISOString());

    if (!logs) return {};

    const progressMap: Record<string, { completed: boolean; progress: number }> = {};
    for (const log of logs) {
        const missionId = log.metadata?.mission_id;
        if (missionId) {
            progressMap[missionId] = { completed: true, progress: 1 };
        }
    }

    return progressMap;
}
