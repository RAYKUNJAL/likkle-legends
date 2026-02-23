'use server';

import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
    id: string;
    firstName: string;
    totalXp: number;
    level: number;
    avatarUrl?: string;
    isCurrentUser: boolean;
    rank: number;
}

/**
 * getLeaderboard
 * Fetches top performing children globally or within a specific family.
 */
export async function getLeaderboard(limit = 10, type: 'global' | 'family' = 'global'): Promise<LeaderboardEntry[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch data from 'children' table
    let query = supabase
        .from('children')
        .select('id, first_name, total_xp, avatar_url, parent_id')
        .order('total_xp', { ascending: false })
        .limit(limit);

    if (type === 'family' && user) {
        query = query.eq('parent_id', user.id);
    }

    const { data: children, error } = await query;

    if (error || !children) {
        console.error('[LEADERBOARD] Fetch error:', error);
        return [];
    }

    // 2. Map to entry format
    const { calculateLevel } = await import('@/lib/gamification');

    return children.map((child, index) => ({
        id: child.id,
        firstName: child.first_name,
        totalXp: child.total_xp,
        level: calculateLevel(child.total_xp).level,
        avatarUrl: child.avatar_url,
        isCurrentUser: user ? child.parent_id === user.id : false, // Approximate for "this family"
        rank: index + 1
    }));
}
