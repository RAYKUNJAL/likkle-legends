'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateLevel, BADGES } from '@/lib/gamification';

export interface ShareCardData {
    childName: string;
    streakDay: number;
    totalXp: number;
    level: number;
    levelName: string;
    levelIcon: string;
    topBadges: Array<{ id: string; name: string; icon: string }>;
    memberSince: string;
    referralCode?: string;
}

/**
 * getShareCardData
 * Collects everything needed to render a beautiful shareable streak card.
 */
export async function getShareCardData(childId: string): Promise<ShareCardData | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: child } = await supabase
        .from('children')
        .select('first_name, total_xp, current_streak, earned_badges, created_at, parent_id')
        .eq('id', childId)
        .eq('parent_id', user.id)
        .single();

    if (!child) return null;

    const level = calculateLevel(child.total_xp);
    const badges: string[] = child.earned_badges || [];

    // Get top 3 most impressive badges
    const topBadges = badges
        .map(bId => BADGES[bId as keyof typeof BADGES])
        .filter(Boolean)
        .sort((a, b) => {
            const rarityOrder: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        })
        .slice(0, 3)
        .map(b => ({ id: b.id, name: b.name, icon: b.icon }));

    // Get referral code if exists
    const { data: referral } = await supabase
        .from('referrals')
        .select('ref_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

    return {
        childName: child.first_name,
        streakDay: child.current_streak || 0,
        totalXp: child.total_xp || 0,
        level: level.level,
        levelName: level.name,
        levelIcon: level.icon,
        topBadges,
        memberSince: new Date(child.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        referralCode: referral?.ref_code || undefined,
    };
}
