/**
 * 🔐 Feature Access Control System
 * Determines which subscription tiers have access to which features
 */

export type SubscriptionTier = 'free' | 'starter_mailer' | 'legends_plus' | 'family_legacy' | 'admin';

export interface FeatureAccess {
    name: string;
    description: string;
    tier_required: SubscriptionTier;
    free_limit?: number; // e.g., 3 free stories per month
}

/**
 * Feature access matrix - define all features and their tier requirements
 */
export const FEATURE_ACCESS: Record<string, FeatureAccess> = {
    // STORY BUILDER
    'story_builder': {
        name: 'Story Builder',
        description: 'Create custom Caribbean stories for your child',
        tier_required: 'starter_mailer',
        free_limit: 3 // Free tier gets 3 stories/month
    },
    'story_builder_unlimited': {
        name: 'Unlimited Stories',
        description: 'Create unlimited stories with all traditions',
        tier_required: 'legends_plus'
    },
    'story_ai_generation': {
        name: 'AI Story Generation',
        description: 'Generate new unique stories with AI',
        tier_required: 'legends_plus'
    },

    // GAMES
    'games_premium': {
        name: 'Premium Games',
        description: 'Access all premium games',
        tier_required: 'starter_mailer'
    },
    'games_unlimited': {
        name: 'Unlimited Game Plays',
        description: 'Play games unlimited times',
        tier_required: 'legends_plus'
    },

    // MUSIC
    'music_store': {
        name: 'Music Store',
        description: 'Purchase Caribbean songs',
        tier_required: 'free'
    },
    'music_unlimited': {
        name: 'Unlimited Music',
        description: 'Stream unlimited music library',
        tier_required: 'legends_plus'
    },

    // LEADERBOARD
    'leaderboard': {
        name: 'Family Leaderboard',
        description: 'See family rankings',
        tier_required: 'starter_mailer'
    },

    // ADMIN
    'admin_dashboard': {
        name: 'Admin Dashboard',
        description: 'Manage platform',
        tier_required: 'family_legacy'
    }
};

/**
 * TIER HIERARCHY (free < starter < legends < family < admin)
 * Accepts both internal names and PayPal plan_* naming stored in DB.
 */
export const TIER_LEVELS: Record<string, number> = {
    // Internal names
    'free': 0,
    'starter_mailer': 1,
    'legends_plus': 2,
    'family_legacy': 3,
    'admin': 10,
    // PayPal plan_* naming stored in DB
    'plan_free_forever': 0,
    'plan_mail_intro': 1,
    'plan_digital_legends': 1,
    'plan_legends_plus': 2,
    'plan_family_legacy': 3,
};

/**
 * TIER DESCRIPTIONS & PRICING
 */
export const TIER_INFO: Record<SubscriptionTier, {
    name: string;
    description: string;
    price_monthly?: number;
    price_yearly?: number;
    features: string[];
}> = {
    'free': {
        name: 'Free',
        description: 'Try Likkle Legends',
        features: [
            '3 free stories per month',
            'Limited free games',
            'Music store access',
            'Character chat'
        ]
    },
    'starter_mailer': {
        name: 'Mini Legend',
        description: 'Everything your child needs',
        price_monthly: 4.99,
        price_yearly: 49.99,
        features: [
            'Unlimited story builder',
            'All premium games',
            'Family leaderboard',
            'Custom challenges',
            'Monthly XP goals',
            'Email progress reports'
        ]
    },
    'legends_plus': {
        name: 'Legends Plus',
        description: 'Premium family experience',
        price_monthly: 9.99,
        price_yearly: 99.99,
        features: [
            'Everything in Mini Legend',
            'AI story generation',
            'Unlimited music streaming',
            'Advanced analytics',
            'Priority support',
            'Extended character library'
        ]
    },
    'family_legacy': {
        name: 'Family Legacy',
        description: 'Complete family plan',
        price_monthly: 14.99,
        price_yearly: 149.99,
        features: [
            'Everything in Legends Plus',
            'Up to 6 children profiles',
            'Family calendar & planning',
            'Admin dashboard',
            'Custom content requests',
            'Dedicated account manager'
        ]
    }
};

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
    userTier: string,
    featureKey: string
): boolean {
    const feature = FEATURE_ACCESS[featureKey];
    if (!feature) return false; // Feature doesn't exist

    const userTierLevel = TIER_LEVELS[userTier] ?? 0; // Unknown tier = free
    const requiredTierLevel = TIER_LEVELS[feature.tier_required];

    // Allow access if user tier >= required tier
    if (userTierLevel >= requiredTierLevel) {
        return true;
    }

    // Special case: Free tier users can access features with free_limit
    // (they just have usage restrictions)
    if (userTier === 'free' && feature.free_limit && feature.free_limit > 0) {
        return true;
    }

    return false;
}

/**
 * Get feature access info
 */
export function getFeatureInfo(featureKey: string): FeatureAccess | null {
    return FEATURE_ACCESS[featureKey] || null;
}

/**
 * Check if user is on free tier
 */
export function isFreeTier(tier: string): boolean {
    return (TIER_LEVELS[tier] ?? 0) === 0;
}

/**
 * Check if user is on premium tier (any paid tier)
 */
export function isPremiumTier(tier: string): boolean {
    return (TIER_LEVELS[tier] ?? 0) > 0;
}

/**
 * Get upgrade tier recommendation
 */
export function getUpgradeTier(currentTier: SubscriptionTier): SubscriptionTier {
    const tierProgression: Record<SubscriptionTier, SubscriptionTier> = {
        'free': 'starter_mailer',
        'starter_mailer': 'legends_plus',
        'legends_plus': 'family_legacy',
        'family_legacy': 'family_legacy', // Already at max
        'admin': 'admin' // Admin stays admin
    };
    return tierProgression[currentTier];
}

/**
 * Check story builder usage against limits
 */
export async function checkStoryBuilderUsage(
    userId: string,
    userTier: SubscriptionTier
): Promise<{ allowed: boolean; remaining: number; resetDate: string }> {
    // Free tier: 3 stories per calendar month
    if (userTier === 'free') {
        // TODO: Query user's story count for current month from database
        // For now, return mock data
        return {
            allowed: true,
            remaining: 2, // They've used 1 of 3
            resetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
        };
    }

    // Paid tiers: unlimited
    return {
        allowed: true,
        remaining: Infinity,
        resetDate: ''
    };
}

/**
 * Story builder access check with details
 */
export async function getStoryBuilderAccess(
    userTier: SubscriptionTier,
    userId?: string
) {
    const hasAccess = hasFeatureAccess(userTier, 'story_builder');

    if (!hasAccess) {
        return {
            allowed: false,
            tier_required: 'starter_mailer',
            upgrade_to: 'starter_mailer',
            message: 'Upgrade to Mini Legend to unlock the Story Builder',
            cta: 'Upgrade Now'
        };
    }

    const usage = userId ? await checkStoryBuilderUsage(userId, userTier) : null;

    return {
        allowed: true,
        tier: userTier,
        usage,
        unlimited: userTier !== 'free',
        message: userTier === 'free' ? `You have ${usage?.remaining} free stories left this month` : 'Unlimited stories!'
    };
}
