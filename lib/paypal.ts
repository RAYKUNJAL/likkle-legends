// PayPal Integration for Likkle Legends
// Handles subscription billing and one-time purchases

export const PAYPAL_CONFIG = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'subscription',
};

export const SUBSCRIPTION_PLANS = {
    starter_mailer: {
        id: 'starter_mailer',
        name: 'Starter Mailer',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER || 'P-1R150232CG183332XNFLNNBQ',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER_YEARLY || 'P-0YY72736T56573355NFLOZZQ',
        price: 9.99,
        priceYearly: 99.00,
        interval: 'month',
        description: 'Character Letter, Coloring Postcard, Flashcard, Stickers',
        features: [
            'Personalized character letter monthly',
            'Coloring postcard & sticker sheet',
            'Alphabet flashcard',
            'Digital Island Experience',
        ],
        margin: 0.78,
    },
    legends_plus: {
        id: 'legends_plus',
        name: 'Legends Plus',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS || 'P-45M32159VV6033601NFLOOYI',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS_YEARLY || 'P-2503312149524980NNFLO34Y',
        price: 19.99,
        priceYearly: 199.00,
        interval: 'month',
        description: 'Everything in Starter + Premium Storybook & AI Studio',
        features: [
            'Everything in Starter Mailer',
            'Premium cardstock storybook',
            'Unlimited AI Story Studio',
            'AR Character Overlay',
        ],
        margin: 0.72,
        popular: true,
    },
    family_legacy: {
        id: 'family_legacy',
        name: 'Family Legacy',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY || 'P-FAMILY_TEST_ID',
        paypalPlanIdYearly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY || 'P-5U054702T9664311ANFLO53',
        price: 34.99,
        priceYearly: 349.00,
        interval: 'month',
        description: 'Everything in Plus + Heritage Box & 3 Child Profiles',
        features: [
            'Everything in Legends Plus',
            'Quarterly Heritage Box',
            'Up to 3 child profiles',
            'Parent 1-on-1 AI Coaching',
            'Printable Family Tree Kit',
        ],
        margin: 0.56,
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
        price: 49.99,
        type: 'one-time',
    },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;
export type UpsellProduct = keyof typeof UPSELLS;
export type MusicStoreProduct = keyof typeof MUSIC_STORE_PRODUCTS;

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
