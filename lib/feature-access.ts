/**
 * 🔐 Feature Access Control System
 * Determines which subscription tiers have access to which features
 */

export type SubscriptionTier = 'free' | 'starter_mailer' | 'digital_legends' | 'legends_plus' | 'family_legacy' | 'admin';

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
    'digital_legends': 1,
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
    'digital_legends': {
        name: 'Digital Legends',
        description: 'Digital access for your little legend',
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
    },
    'admin': {
        name: 'Admin',
        description: 'Full platform access',
        features: ['All features', 'Admin dashboard', 'Content management']
    }
};

/**
 * Check if user has access to a feature.
 * Canceled subscriptions are treated as free tier regardless of stored tier name.
 */
export function hasFeatureAccess(
    userTier: string,
    featureKey: string,
    subscriptionStatus?: string
): boolean {
    const feature = FEATURE_ACCESS[featureKey];
    if (!feature) return false;

    // Canceled or past_due → treat as free regardless of stored tier
    const effectiveTier = (subscriptionStatus === 'canceled' || subscriptionStatus === 'past_due')
        ? 'free'
        : userTier;

    const userTierLevel = TIER_LEVELS[effectiveTier] ?? 0;
    const requiredTierLevel = TIER_LEVELS[feature.tier_required];

    if (userTierLevel >= requiredTierLevel) {
        return true;
    }

    // Free tier users can access features that have a free_limit
    if (userTierLevel === 0 && feature.free_limit && feature.free_limit > 0) {
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
        'digital_legends': 'legends_plus',
        'legends_plus': 'family_legacy',
        'family_legacy': 'family_legacy', // Already at max
        'admin': 'admin' // Admin stays admin
    };
    return tierProgression[currentTier];
}

