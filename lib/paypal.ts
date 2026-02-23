// PayPal Integration for Likkle Legends
// Handles subscription billing and one-time purchases

export const PAYPAL_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'subscription',
};

export const SUBSCRIPTION_PLANS = {
    plan_free_forever: {
        id: 'plan_free_forever',
        name: 'Free Forever',
        paypalPlanId: '', // Free plan has no PayPal ID
        paypalPlanIdYearly: '',
        price: 0.00,
        priceYearly: 0.00,
        interval: 'month',
        description: 'Everything your child needs to begin their journey',
        features: [
            'Core stories, songs, and activities',
            'Island Radio access',
            'Basic progress badges',
            'Dialect Dial (Standard + Local)',
            'Teacher/school access (unlimited)'
        ],
        highlight: true,
        badge: 'Default',
        margin: 0,
    },
    plan_digital_legends: {
        id: 'plan_digital_legends',
        name: 'Digital Legends',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL || 'P-4W703714E9171780MNFLN65Y',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY || 'P-0YY72736T56573355NFLOZZQ',
        price: 4.99,
        priceYearly: 49.90, // Approx 2 months free
        interval: 'month',
        description: 'Unlimited digital learning — no mail required',
        features: [
            'Everything in Free Forever',
            'Unlimited digital downloads',
            'Personalized storybooks',
            'Offline access packs',
            'Ad-free experience'
        ],
        highlight: true,
        badge: 'Most Popular',
        margin: 0.95,
    },
    plan_mail_intro: {
        id: 'plan_mail_intro',
        name: 'Island Starter',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER || 'P-1R150232CG183332XNFLNNBQ',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY || 'P-0YY72736T56573355NFLOZZQ',
        price: 9.99,
        priceYearly: 99.00,
        interval: 'month',
        description: 'Bring Caribbean culture into your child’s hands',
        features: [
            'Everything in Digital Legends',
            'Monthly physical mail package',
            'Printed stories and activities',
            'Stickers, badges, and surprises',
            'Collectible character keepsakes'
        ],
        highlight: false,
        margin: 0.60,
    },
    plan_legends_plus: {
        id: 'plan_legends_plus',
        name: 'Legends Plus',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS || 'P-45M32159VV6033601NFLOOYI',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY || 'P-2503312149524980NNFLO34Y',
        price: 19.99,
        priceYearly: 199.00,
        interval: 'month',
        description: 'The complete cultural learning experience',
        features: [
            'Everything in Legend Mail Intro',
            'Expanded AI Story Studio access',
            'Premium digital library',
            'Exclusive monthly activities',
            'Enhanced personalization'
        ],
        highlight: false,
        badge: 'Premium',
        margin: 0.70,
    },
    plan_family_legacy: {
        id: 'plan_family_legacy',
        name: 'Family Legacy',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY || 'P-4G842008M1421443UNFLO3MY',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY || 'P-5U054702T9664311ANFLO53',
        price: 34.99,
        priceYearly: 349.00,
        interval: 'month',
        description: 'Preserve culture across generations',
        features: [
            'Everything in Legends Plus',
            'Multiple child profiles',
            'Quarterly heritage box',
            'Grandparent participation access',
            'Priority support'
        ],
        highlight: false,
        badge: 'Best for Families',
        margin: 0.50,
    },
};

export const UPSELLS = {
    grandparent_dashboard: {
        id: 'grandparent_dashboard',
        name: 'Grandparent Mirror Dashboard',
        price: 0.00,
        interval: 'month',
        description: 'Launch Bonus: Include extended family for FREE!',
    },
    heritage_dna_story: {
        id: 'heritage_dna_story',
        name: 'Heritage DNA Custom AI Story',
        price: 14.99,
        type: 'one-time',
        description: 'A deeply personalized story based on your family heritage',
    },
};

export const MUSIC_STORE_PRODUCTS = {
    single_track: {
        id: 'single_track',
        name: 'Single Track Download',
        price: 0.99,
        type: 'one-time',
    },
    track_bundle_5: {
        id: 'track_bundle_5',
        name: '5-Track Bundle',
        price: 3.99,
        type: 'one-time',
    },
    custom_song_request: {
        id: 'custom_song_request',
        name: 'Custom Song Request',
        price: 24.99,
        type: 'one-time',
    },
};

export const GAMIFICATION_PRODUCTS = {
    streak_freeze: {
        id: 'streak_freeze',
        name: 'Streak Freeze (1x)',
        price: 0.99,
        type: 'one-time',
        description: 'Protect your streak for one day',
    },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;
export type UpsellProduct = keyof typeof UPSELLS;
export type MusicStoreProduct = keyof typeof MUSIC_STORE_PRODUCTS;
export type GamificationProduct = keyof typeof GAMIFICATION_PRODUCTS;

// Currency localization based on country
export const CURRENCY_MAP: Record<string, { code: string; symbol: string; multiplier: number }> = {
    US: { code: 'USD', symbol: '$', multiplier: 1 },
    GB: { code: 'GBP', symbol: '£', multiplier: 0.79 },
    CA: { code: 'CAD', symbol: 'C$', multiplier: 1.36 },
    JM: { code: 'USD', symbol: '$', multiplier: 1 },
    TT: { code: 'USD', symbol: '$', multiplier: 1 },
    BB: { code: 'USD', symbol: '$', multiplier: 1 },
};

export function getLocalizedPrice(basePrice: number, countryCode: string): { price: number; currency: string; symbol: string } {
    const currencyInfo = CURRENCY_MAP[countryCode] || CURRENCY_MAP.US;
    return {
        price: Math.round(basePrice * currencyInfo.multiplier * 100) / 100,
        currency: currencyInfo.code,
        symbol: currencyInfo.symbol,
    };
}
