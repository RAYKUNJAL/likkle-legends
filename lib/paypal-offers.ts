/**
 * Parent checkout catalog for Island Packs and annual plans.
 * Prices live here. PayPal plan IDs stay in env and are resolved on the server.
 * Nothing in this file grants access — capture/confirm must verify with PayPal.
 */

export const PARENT_PAYER_ROLES = ['parent', 'grandparent', 'caregiver', 'admin', 'super_admin'] as const;

export type OfferKind = 'one_time' | 'subscription';

export type ParentOffer = {
    sku: string;
    name: string;
    kind: OfferKind;
    /** Catalog USD amount. One-time orders are created at this price. Subscriptions are billed by the PayPal plan. */
    price: number;
    interval?: 'year';
    description: string;
    features: string[];
    /** Internal tier written to subscriptions.plan_id after verification. */
    entitlementTier: string;
    accessDays: number;
    /** First non-empty env var wins. Subscriptions only. */
    planEnvNames?: string[];
};

export const ISLAND_PACK_10 = 'island_pack_10';
export const ISLAND_PACK_25 = 'island_pack_25';
export const ISLAND_PASS_ANNUAL = 'island_pass_annual';
export const FAMILY_PLAN_ANNUAL = 'family_plan_annual';

export const PARENT_OFFERS: Record<string, ParentOffer> = {
    [ISLAND_PACK_10]: {
        sku: ISLAND_PACK_10,
        name: 'Digital Island Starter',
        kind: 'one_time',
        price: 10,
        description: 'One-time Island Pack. Starter access unlocks only after PayPal captures the payment.',
        features: [
            'Starter stories, music, and printables',
            'Parent-guided first adventure',
            '30 days of Island Starter access after capture',
        ],
        entitlementTier: 'plan_mail_intro',
        accessDays: 30,
    },
    [ISLAND_PACK_25]: {
        sku: ISLAND_PACK_25,
        name: 'Legends Discovery Pack',
        kind: 'one_time',
        price: 25,
        description: 'One-time Island Pack. Discovery access unlocks only after PayPal captures the payment.',
        features: [
            'A wider set of digital learning adventures',
            'Activities to share as a family',
            '30 days of Legends Plus access after capture',
        ],
        entitlementTier: 'plan_legends_plus',
        accessDays: 30,
    },
    [ISLAND_PASS_ANNUAL]: {
        sku: ISLAND_PASS_ANNUAL,
        name: 'Island Pass',
        kind: 'subscription',
        interval: 'year',
        price: 49.9,
        description: 'Optional annual Island Pass. PayPal bills the yearly plan. Access unlocks only when that subscription is ACTIVE.',
        features: [
            'Annual digital Island Pass',
            'Stories, games, and island radio',
            'Renews with the PayPal yearly plan',
        ],
        entitlementTier: 'plan_digital_legends',
        accessDays: 365,
        planEnvNames: ['NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY'],
    },
    [FAMILY_PLAN_ANNUAL]: {
        sku: FAMILY_PLAN_ANNUAL,
        name: 'Family Plan',
        kind: 'subscription',
        interval: 'year',
        price: 349,
        description: 'Optional annual Family Plan. PayPal bills the family yearly plan. Access unlocks only when that subscription is ACTIVE.',
        features: [
            'Annual family access',
            'Multiple child profiles',
            'Renews with the PayPal family yearly plan',
        ],
        entitlementTier: 'plan_family_legacy',
        accessDays: 365,
        planEnvNames: ['NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY', 'NEXT_PUBLIC_PLAN_FAMILY_YEARLY'],
    },
};

/** Products that must never be sold inside the child experience. */
export const KID_IAP_PRODUCT_IDS = new Set(['streak_freeze']);

/**
 * Plan IDs already committed in the webhook handler. They are billing identifiers,
 * not secrets. Env vars override these when set.
 */
export const LEGACY_PAYPAL_PLAN_TIERS: Record<string, string> = {
    'P-0LU582199P7741420NGQA4JI': 'plan_digital_legends',
    'P-9Y7503296X038324YNGN72CI': 'plan_mail_intro',
    'P-1R150232CG183332XNFLNNBQ': 'plan_mail_intro',
    'P-0YY72736T56573355NFLOZZQ': 'plan_mail_intro',
    'P-45M32159VV6033601NFLOOYI': 'plan_legends_plus',
    'P-2503312149524980NNFLO34Y': 'plan_legends_plus',
    'P-9MP32022V70125639NFLT4IA': 'plan_family_legacy',
    'P-4G842008M1421443UNFLO3MY': 'plan_family_legacy',
    'P-5U054702T9664311ANFLO53A': 'plan_family_legacy',
    'P-5U054702T9664311ANFLO53': 'plan_family_legacy',
};

const ENV_PLAN_TIERS: Array<[string, string]> = [
    ['NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL', 'plan_digital_legends'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY', 'plan_digital_legends'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_STARTER', 'plan_mail_intro'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY', 'plan_mail_intro'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS', 'plan_legends_plus'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY', 'plan_legends_plus'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_FAMILY', 'plan_family_legacy'],
    ['NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY', 'plan_family_legacy'],
    ['NEXT_PUBLIC_PLAN_FAMILY_YEARLY', 'plan_family_legacy'],
];

export function getParentOffer(sku: string | null | undefined): ParentOffer | null {
    if (!sku) return null;
    return PARENT_OFFERS[sku] ?? null;
}

export function listParentOffers(): ParentOffer[] {
    return [
        PARENT_OFFERS[ISLAND_PACK_10],
        PARENT_OFFERS[ISLAND_PACK_25],
        PARENT_OFFERS[ISLAND_PASS_ANNUAL],
        PARENT_OFFERS[FAMILY_PLAN_ANNUAL],
    ];
}

export function isParentPayerRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return (PARENT_PAYER_ROLES as readonly string[]).includes(role.toLowerCase());
}

export function isChildRoute(pathname: string | null | undefined): boolean {
    if (!pathname) return false;
    return pathname === '/portal' || pathname.startsWith('/portal/');
}

export function amountsMatch(captured: number, expected: number): boolean {
    return Number.isFinite(captured) && Number.isFinite(expected) && Math.abs(captured - expected) <= 0.01;
}

export function formatUsd(amount: number): string {
    return amount.toFixed(2);
}

/** PayPal custom_id max length is 127. */
export function packCustomId(userId: string, sku: string): string {
    return `${userId}:${sku}`.slice(0, 127);
}

export function parsePackCustomId(value: string | null | undefined): { userId: string; sku: string } | null {
    if (!value || !value.includes(':')) return null;
    const idx = value.indexOf(':');
    const userId = value.slice(0, idx).trim();
    const sku = value.slice(idx + 1).trim();
    if (!userId || !sku) return null;
    return { userId, sku };
}

export function resolveSubscriptionPlanId(
    offer: ParentOffer,
    env: Record<string, string | undefined> = process.env
): string | null {
    if (offer.kind !== 'subscription' || !offer.planEnvNames?.length) return null;
    for (const name of offer.planEnvNames) {
        const value = env[name]?.trim();
        if (value) return value;
    }
    return null;
}

export function tierForPaypalPlanId(
    planId: string | null | undefined,
    env: Record<string, string | undefined> = process.env
): string | null {
    if (!planId) return null;
    const map: Record<string, string> = { ...LEGACY_PAYPAL_PLAN_TIERS };
    for (const [envName, tier] of ENV_PLAN_TIERS) {
        const id = env[envName]?.trim();
        if (id) map[id] = tier;
    }
    return map[planId] ?? null;
}

export type GrantDecision = { ok: true } | { ok: false; reason: string };

export function decideOneTimeGrant(input: {
    offer: ParentOffer | null;
    captureStatus: string | null | undefined;
    capturedAmount: number;
    currency: string | null | undefined;
    customId: string | null | undefined;
    buyerUserId: string;
}): GrantDecision {
    if (!input.offer || input.offer.kind !== 'one_time') {
        return { ok: false, reason: 'unknown_offer' };
    }
    if (String(input.captureStatus || '').toUpperCase() !== 'COMPLETED') {
        return { ok: false, reason: 'capture_not_completed' };
    }
    if (String(input.currency || '').toUpperCase() !== 'USD') {
        return { ok: false, reason: 'currency_mismatch' };
    }
    if (!amountsMatch(input.capturedAmount, input.offer.price)) {
        return { ok: false, reason: 'amount_mismatch' };
    }
    const parsed = parsePackCustomId(input.customId);
    if (!parsed || parsed.userId !== input.buyerUserId || parsed.sku !== input.offer.sku) {
        return { ok: false, reason: 'buyer_mismatch' };
    }
    return { ok: true };
}

/**
 * v1 sale events (PAYMENT.SALE.COMPLETED). Subscription sales carry a billing
 * agreement and stay on the subscription webhook. One-time packs grant only
 * when the re-fetched sale is completed at the catalog price for that buyer.
 */
export function decideSaleGrant(input: {
    offer: ParentOffer | null;
    saleState: string | null | undefined;
    amount: number;
    currency: string | null | undefined;
    customId: string | null | undefined;
    buyerUserId: string;
    billingAgreementId?: string | null;
}): GrantDecision {
    if (input.billingAgreementId) {
        return { ok: false, reason: 'subscription_sale' };
    }
    const state = String(input.saleState || '').toUpperCase();
    const captureStatus = state === 'COMPLETED' || state === 'COMPLETE' ? 'COMPLETED' : state;
    return decideOneTimeGrant({
        offer: input.offer,
        captureStatus,
        capturedAmount: input.amount,
        currency: input.currency,
        customId: input.customId,
        buyerUserId: input.buyerUserId,
    });
}

export function decideSubscriptionGrant(input: {
    offer: ParentOffer | null;
    status: string | null | undefined;
    paypalPlanId: string | null | undefined;
    expectedPlanId: string | null;
    customId: string | null | undefined;
    buyerUserId: string;
}): GrantDecision {
    if (!input.offer || input.offer.kind !== 'subscription') {
        return { ok: false, reason: 'unknown_offer' };
    }
    if (!input.expectedPlanId) {
        return { ok: false, reason: 'plan_unconfigured' };
    }
    if (String(input.status || '').toUpperCase() !== 'ACTIVE') {
        return { ok: false, reason: 'subscription_not_active' };
    }
    if (input.paypalPlanId !== input.expectedPlanId) {
        return { ok: false, reason: 'plan_mismatch' };
    }
    const parsed = parsePackCustomId(input.customId);
    if (!parsed || parsed.userId !== input.buyerUserId || parsed.sku !== input.offer.sku) {
        return { ok: false, reason: 'buyer_mismatch' };
    }
    return { ok: true };
}
