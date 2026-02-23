'use server';

import { createClient } from '@/lib/supabase/server';
import { addXP } from '@/lib/services/gamification';

type ChallengeType = 'read_stories' | 'earn_xp' | 'beat_streak' | 'complete_missions';

const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
    read_stories: 'Read stories',
    earn_xp: 'Earn XP',
    beat_streak: 'Build a streak',
    complete_missions: 'Complete missions',
};

export interface FamilyChallenge {
    id: string;
    title: string;
    description: string | null;
    challenge_type: ChallengeType;
    target_value: number;
    reward_xp: number;
    reward_badge: string | null;
    starts_at: string;
    ends_at: string;
    status: 'active' | 'completed' | 'expired';
    participants: Array<{
        child_id: string;
        first_name: string;
        avatar_id: string | null;
        progress: number;
        completed: boolean;
        reward_claimed: boolean;
    }>;
}

// ============================================================
// createFamilyChallenge
// Parent creates a challenge targeting one or more children
// ============================================================
export async function createFamilyChallenge(input: {
    title: string;
    description?: string;
    challengeType: ChallengeType;
    targetValue: number;
    rewardXp: number;
    rewardBadge?: string;
    durationDays: number;
    childIds: string[];
}): Promise<{ success: boolean; challengeId?: string; error?: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Validate all childIds belong to this parent
    const { data: ownedChildren } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .in('id', input.childIds);

    if (!ownedChildren?.length) return { success: false, error: 'No valid children selected' };

    const endsAt = new Date(Date.now() + input.durationDays * 86400000).toISOString();

    const { data: challenge, error: challengeError } = await supabase
        .from('family_challenges')
        .insert({
            parent_id: user.id,
            title: input.title,
            description: input.description || null,
            challenge_type: input.challengeType,
            target_value: input.targetValue,
            reward_xp: input.rewardXp,
            reward_badge: input.rewardBadge || null,
            ends_at: endsAt,
        })
        .select('id')
        .single();

    if (challengeError || !challenge) return { success: false, error: challengeError?.message };

    // Add participants
    const participantRows = ownedChildren.map(c => ({
        challenge_id: challenge.id,
        child_id: c.id,
    }));

    await supabase.from('challenge_participants').insert(participantRows);

    return { success: true, challengeId: challenge.id };
}

// ============================================================
// getFamilyChallenges
// Returns active challenges for the logged-in parent with participant progress
// ============================================================
export async function getFamilyChallenges(): Promise<FamilyChallenge[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: challenges } = await supabase
        .from('family_challenges')
        .select(`
            id, title, description, challenge_type, target_value,
            reward_xp, reward_badge, starts_at, ends_at, status,
            challenge_participants (
                child_id, progress, completed, reward_claimed,
                children ( first_name, avatar_id )
            )
        `)
        .eq('parent_id', user.id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

    if (!challenges) return [];

    return challenges.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        challenge_type: c.challenge_type,
        target_value: c.target_value,
        reward_xp: c.reward_xp,
        reward_badge: c.reward_badge,
        starts_at: c.starts_at,
        ends_at: c.ends_at,
        status: c.status,
        participants: (c.challenge_participants || []).map((p: any) => ({
            child_id: p.child_id,
            first_name: p.children?.first_name || 'Child',
            avatar_id: p.children?.avatar_id || null,
            progress: p.progress,
            completed: p.completed,
            reward_claimed: p.reward_claimed,
        })),
    }));
}

// ============================================================
// updateChallengeProgress
// Called whenever a child does an activity that counts toward a challenge.
// Safe to call on every activity — idempotent once completed.
// ============================================================
export async function updateChallengeProgress(childId: string, activityType: string): Promise<void> {
    const supabase = createClient();

    // Map activity to challenge types it counts toward
    const activityMap: Record<string, ChallengeType[]> = {
        read_story: ['read_stories'],
        xp_earn: ['earn_xp'],
        xp: ['earn_xp'],
        daily_login: ['beat_streak'],
        mission_completed: ['complete_missions'],
    };

    const applicableTypes: ChallengeType[] = activityMap[activityType] || [];
    if (!applicableTypes.length) return;

    // Find active challenge participations for this child
    const { data: participations } = await supabase
        .from('challenge_participants')
        .select(`
            id, progress, completed, reward_claimed, challenge_id,
            family_challenges ( target_value, reward_xp, reward_badge, challenge_type, status, ends_at, parent_id )
        `)
        .eq('child_id', childId)
        .eq('completed', false);

    if (!participations?.length) return;

    for (const p of participations) {
        const challenge = (p as any).family_challenges;
        if (!challenge || challenge.status !== 'active') continue;
        if (!applicableTypes.includes(challenge.challenge_type)) continue;

        // Check not expired
        if (new Date(challenge.ends_at) < new Date()) continue;

        const newProgress = p.progress + 1;
        const isNowComplete = newProgress >= challenge.target_value;

        await supabase.from('challenge_participants').update({
            progress: newProgress,
            completed: isNowComplete,
            completed_at: isNowComplete ? new Date().toISOString() : null,
        }).eq('id', p.id);

        // Auto-grant XP reward when first completing
        if (isNowComplete) {
            await addXP(childId, challenge.reward_xp, 'family_challenge');

            if (challenge.reward_badge) {
                const { data: child } = await supabase.from('children').select('earned_badges').eq('id', childId).single();
                const badges: string[] = child?.earned_badges || [];
                if (!badges.includes(challenge.reward_badge)) {
                    await Promise.all([
                        supabase.from('children').update({ earned_badges: [...badges, challenge.reward_badge] }).eq('id', childId),
                        supabase.from('badge_earnings').upsert({ child_id: childId, badge_id: challenge.reward_badge }, { onConflict: 'child_id,badge_id', ignoreDuplicates: true }),
                    ]);
                }
            }

            // Check if ALL participants completed → mark challenge as completed
            const { data: allParticipants } = await supabase
                .from('challenge_participants')
                .select('completed')
                .eq('challenge_id', p.challenge_id);

            const allDone = allParticipants?.every(p => p.completed);
            if (allDone) {
                await supabase.from('family_challenges').update({ status: 'completed' }).eq('id', p.challenge_id);
            }
        }
    }
}
