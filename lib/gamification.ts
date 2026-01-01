// Gamification System for Likkle Legends
// XP, badges, streaks, and achievements

export const XP_ACTIONS = {
    STORY_COMPLETED: 50,
    SONG_LISTENED: 20,
    FLASHCARD_REVIEWED: 10,
    COLORING_COMPLETED: 30,
    MISSION_COMPLETED: 100,
    DAILY_LOGIN: 15,
    PATOIS_WORD_LEARNED: 25,
    VR_PORTAL_VISITED: 40,
    AR_EXPERIENCE_USED: 35,
    STREAK_BONUS_7_DAYS: 200,
    STREAK_BONUS_30_DAYS: 500,
};

export const LEVELS = [
    { level: 1, name: 'Likkle Sprout', minXP: 0, icon: '🌱' },
    { level: 2, name: 'Island Explorer', minXP: 200, icon: '🏝️' },
    { level: 3, name: 'Story Seeker', minXP: 500, icon: '📚' },
    { level: 4, name: 'Rhythm Keeper', minXP: 1000, icon: '🎵' },
    { level: 5, name: 'Culture Champion', minXP: 2000, icon: '🏆' },
    { level: 6, name: 'Heritage Hero', minXP: 3500, icon: '⭐' },
    { level: 7, name: 'Caribbean Captain', minXP: 5000, icon: '⚓' },
    { level: 8, name: 'Legendary Legend', minXP: 7500, icon: '👑' },
    { level: 9, name: 'Island Master', minXP: 10000, icon: '🌟' },
    { level: 10, name: 'Diaspora Legend', minXP: 15000, icon: '💎' },
];

export const BADGES = {
    // Story Badges
    first_story: { id: 'first_story', name: 'First Adventure', description: 'Completed your first story', icon: '📖', category: 'stories' },
    story_explorer: { id: 'story_explorer', name: 'Story Explorer', description: 'Read 10 stories', icon: '🗺️', category: 'stories' },
    story_master: { id: 'story_master', name: 'Story Master', description: 'Read 50 stories', icon: '📚', category: 'stories' },

    // Music Badges
    first_song: { id: 'first_song', name: 'First Vibes', description: 'Listened to your first song', icon: '🎶', category: 'music' },
    music_lover: { id: 'music_lover', name: 'Music Lover', description: 'Listened to 25 songs', icon: '🎧', category: 'music' },
    steelpan_star: { id: 'steelpan_star', name: 'Steelpan Star', description: 'Listened to 100 songs', icon: '🥁', category: 'music' },

    // Cultural Badges
    patois_starter: { id: 'patois_starter', name: 'Patois Pickney', description: 'Learned 5 Patois words', icon: '🗣️', category: 'culture' },
    dialect_master: { id: 'dialect_master', name: 'Dialect Master', description: 'Learned 25 words', icon: '💬', category: 'culture' },
    island_hopper: { id: 'island_hopper', name: 'Island Hopper', description: 'Explored 5 island VR portals', icon: '✈️', category: 'culture' },

    // Streak Badges
    week_warrior: { id: 'week_warrior', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', category: 'streaks' },
    month_champion: { id: 'month_champion', name: 'Month Champion', description: '30-day learning streak', icon: '💪', category: 'streaks' },
    consistency_king: { id: 'consistency_king', name: 'Consistency Crown', description: '100-day streak', icon: '👑', category: 'streaks' },

    // Special Badges
    ar_pioneer: { id: 'ar_pioneer', name: 'AR Pioneer', description: 'Used AR coloring overlay', icon: '📱', category: 'special' },
    ai_storyteller: { id: 'ai_storyteller', name: 'AI Storyteller', description: 'Created an AI story', icon: '✨', category: 'special' },
    family_legacy: { id: 'family_legacy', name: 'Family Legacy', description: 'Added family to heritage tree', icon: '🌳', category: 'special' },
};

export type BadgeId = keyof typeof BADGES;

export function calculateLevel(xp: number): typeof LEVELS[0] {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

export function getNextLevel(xp: number): { level: typeof LEVELS[0]; xpNeeded: number } | null {
    const currentLevel = calculateLevel(xp);
    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;

    if (nextLevelIndex >= LEVELS.length) return null;

    const nextLevel = LEVELS[nextLevelIndex];
    return {
        level: nextLevel,
        xpNeeded: nextLevel.minXP - xp,
    };
}

export function getProgressToNextLevel(xp: number): number {
    const currentLevel = calculateLevel(xp);
    const next = getNextLevel(xp);

    if (!next) return 100;

    const currentLevelXP = currentLevel.minXP;
    const nextLevelXP = next.level.minXP;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return Math.min(100, Math.max(0, progress));
}

// Cultural Milestones
export const CULTURAL_MILESTONES = [
    { id: 'island_introduction', name: 'Island Introduction', description: 'Selected your heritage islands' },
    { id: 'first_patois', name: 'First Patois Word', description: 'Learned your first Patois/Creole word' },
    { id: 'tradition_learned', name: 'Tradition Keeper', description: 'Learned about a Caribbean tradition' },
    { id: 'food_explorer', name: 'Food Explorer', description: 'Learned about Caribbean cuisine' },
    { id: 'music_heritage', name: 'Music Heritage', description: 'Explored Caribbean music history' },
    { id: 'carnival_spirit', name: 'Carnival Spirit', description: 'Completed a Carnival-themed mission' },
    { id: 'family_tree', name: 'Family Roots', description: 'Created your family heritage tree' },
    { id: 'elder_wisdom', name: 'Elder Wisdom', description: 'Learned 10 proverbs from the islands' },
];
