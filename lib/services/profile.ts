
import { supabase } from '@/lib/storage';
import { calculateLevel, getNextLevel } from '@/lib/gamification';

export interface UserProfileStats {
    totalStars: number;
    storiesRead: number;
    songsListened: number;
    currentStreak: number;
    level: number;
    levelName: string;
    nextLevelXP: number;
    currentXP: number;
    badges: any[];
    recentActivity: any[];
}

export async function getUserStats(userId?: string): Promise<UserProfileStats> {
    // 1. Get User ID (if not provided, try to get current session)
    let effectiveUserId = userId;
    if (!effectiveUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        effectiveUserId = user?.id;
    }

    // Default return for no user (or guest)
    if (!effectiveUserId) {
        return {
            totalStars: 0,
            storiesRead: 0,
            songsListened: 0,
            currentStreak: 0,
            level: 1,
            levelName: 'Likkle Sprout',
            nextLevelXP: 100,
            currentXP: 0,
            badges: [],
            recentActivity: []
        };
    }

    // 2. Fetch Activities (for XP, Stars, and Counts)
    const { data: activities, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', effectiveUserId) // Standardized on user_id
        .order('created_at', { ascending: false });

    if (activityError) console.error("Error fetching activities:", activityError);
    const activityList = activities || [];

    // 3. Calculate Stats
    const totalStars = activityList.reduce((acc, curr) => acc + (curr.stars_earned || 0), 0) +
        activityList.reduce((acc, curr) => acc + (curr.xp_earned && curr.activity_type === 'story_complete' ? 5 : 0), 0); // Fallback logic if stars column missing

    const storiesRead = activityList.filter(a => a.activity_type === 'story_complete').length;
    const songsListened = activityList.filter(a => a.activity_type === 'song_listen').length;
    const currentXP = activityList.reduce((acc, curr) => acc + (curr.xp_earned || 0), 0);

    // 4. Calculate Level
    const currentLevelInfo = calculateLevel(currentXP);
    const nextLevelInfo = getNextLevel(currentXP);

    // 5. Fetch Badges
    const { data: badgeData } = await supabase
        .from('badge_earnings')
        .select('*, badge_definitions(*)') // Assuming a relation, or we map manually
        .eq('user_id', effectiveUserId); // Check your schema for exact column name

    // Manual Badge Mapping (if no badge_definitions table yet)
    // For now, we'll return mock badges if DB is empty to show UI
    const badges = badgeData && badgeData.length > 0 ? badgeData : [];

    // 6. Format History
    const recentActivity = activityList.slice(0, 5).map(a => ({
        id: a.id,
        type: a.activity_type === 'story_complete' ? 'story' : 'song',
        title: a.metadata?.title || 'Unknown Adventure',
        date: new Date(a.created_at).toLocaleDateString(),
        result: 'Completed',
        stars: a.stars_earned || (a.activity_type === 'story_complete' ? 5 : 0)
    }));

    return {
        totalStars,
        storiesRead,
        songsListened,
        currentStreak: 1, // Need a proper streak calculation service
        level: currentLevelInfo.level,
        levelName: currentLevelInfo.name,
        nextLevelXP: nextLevelInfo ? nextLevelInfo.xpNeeded + currentXP : 100000,
        currentXP,
        badges,
        recentActivity
    };
}
