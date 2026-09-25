'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { activityContentFields, clampPortalGameXp } from '@/lib/game-xp';

export type AwardPortalGameXpResult =
    | { success: true; xpAwarded: number; totalXp: number }
    | { success: false; error: string };

type ChildXpRow = {
    id: string;
    total_xp: number | null;
    parent_id?: string | null;
    primary_user_id?: string | null;
};

async function loadOwnedChild(childId: string, userId: string): Promise<ChildXpRow | null> {
    const withLegacyOwner = await supabaseAdmin
        .from('children')
        .select('id, total_xp, parent_id, primary_user_id')
        .eq('id', childId)
        .maybeSingle();

    const row = withLegacyOwner.error
        ? (await supabaseAdmin
            .from('children')
            .select('id, total_xp, parent_id')
            .eq('id', childId)
            .maybeSingle()).data
        : withLegacyOwner.data;

    if (!row) return null;
    const child = row as ChildXpRow;
    const owns = child.parent_id === userId || child.primary_user_id === userId;
    return owns ? child : null;
}

async function readXpMultiplier(): Promise<number> {
    try {
        const { data } = await supabaseAdmin
            .from('site_settings')
            .select('content')
            .eq('key', 'xp_multiplier')
            .maybeSingle();
        const value = Number(data?.content);
        if (!Number.isFinite(value) || value <= 0) return 1;
        return value;
    } catch (_e) {
        return 1;
    }
}

/**
 * Persist XP for a portal game the child actually finished.
 * Uses the service role after an ownership check — the browser `activities`
 * insert cannot be the gate, because a non-UUID game slug fails that write
 * and used to skip the `total_xp` update entirely.
 */
export async function awardPortalGameXp(input: {
    childId: string;
    gameId: string;
    xp: number;
    score?: number;
    title?: string;
}): Promise<AwardPortalGameXpResult> {
    const childId = input?.childId?.trim();
    const gameId = input?.gameId?.trim();
    if (!childId || !gameId) {
        return { success: false, error: 'Missing child or game' };
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    const child = await loadOwnedChild(childId, user.id);
    if (!child) {
        return { success: false, error: 'Child not found' };
    }

    const multiplier = await readXpMultiplier();
    const xpAwarded = clampPortalGameXp(Math.floor(Number(input.xp) * multiplier));
    if (xpAwarded <= 0) {
        return { success: true, xpAwarded: 0, totalXp: child.total_xp || 0 };
    }

    const newTotal = (child.total_xp || 0) + xpAwarded;
    const { error: updateError } = await supabaseAdmin
        .from('children')
        .update({ total_xp: newTotal })
        .eq('id', childId);

    if (updateError) {
        console.error('awardPortalGameXp update failed:', updateError);
        return { success: false, error: 'Failed to update XP' };
    }

    const fields = activityContentFields(gameId, {
        title: input.title || gameId,
        score: Number.isFinite(input.score) ? input.score : input.xp,
        source: 'portal_game_complete',
    });

    const logged = await supabaseAdmin.from('activities').insert({
        profile_id: user.id,
        child_id: childId,
        activity_type: 'game',
        content_id: fields.content_id,
        xp_earned: xpAwarded,
        duration_seconds: 0,
        metadata: fields.metadata,
    });

    if (logged.error) {
        // Older self-hosted activities rows use user_id + type and have no content_id.
        await supabaseAdmin.from('activities').insert({
            user_id: user.id,
            child_id: childId,
            type: 'game',
            description: input.title || gameId,
            xp_earned: xpAwarded,
            metadata: { ...fields.metadata, activity_type: 'game' },
        });
    }

    return { success: true, xpAwarded, totalXp: newTotal };
}
