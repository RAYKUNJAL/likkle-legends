/**
 * Canonical subscription plan_id values stored in `subscriptions.plan_id`
 * and read via the profiles view as `subscription_tier`.
 *
 * Writers (PayPal confirm + webhooks) MUST normalize to these forms so
 * `lib/feature-access.ts` TIER_LEVELS grants paid entitlements correctly.
 */
export type CanonicalPlanId =
    | 'plan_free_forever'
    | 'plan_digital_legends'
    | 'plan_mail_intro'
    | 'plan_legends_plus'
    | 'plan_family_legacy';

const ALIAS_TO_CANONICAL: Record<string, CanonicalPlanId> = {
    // Already-canonical
    plan_free_forever: 'plan_free_forever',
    plan_digital_legends: 'plan_digital_legends',
    plan_mail_intro: 'plan_mail_intro',
    plan_legends_plus: 'plan_legends_plus',
    plan_family_legacy: 'plan_family_legacy',
    // Short / legacy names
    free: 'plan_free_forever',
    digital_legends: 'plan_digital_legends',
    starter_mailer: 'plan_mail_intro',
    legends_plus: 'plan_legends_plus',
    family_legacy: 'plan_family_legacy',
    // Occasional checkout aliases
    digital_explorer: 'plan_digital_legends',
    mail_intro: 'plan_mail_intro',
};

/** Known sandbox/live PayPal plan IDs historically used by this app. */
const KNOWN_PAYPAL_PLAN_IDS: Record<string, CanonicalPlanId> = {
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

function envPlanMap(): Record<string, CanonicalPlanId> {
    const map: Record<string, CanonicalPlanId> = {};
    const pairs: Array<[string | undefined, CanonicalPlanId]> = [
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL, 'plan_digital_legends'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY, 'plan_digital_legends'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER, 'plan_mail_intro'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY, 'plan_mail_intro'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS, 'plan_legends_plus'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY, 'plan_legends_plus'],
        [process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY, 'plan_family_legacy'],
        [
            process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY_YEARLY || process.env.NEXT_PUBLIC_PLAN_FAMILY_YEARLY,
            'plan_family_legacy',
        ],
    ];
    for (const [id, canonical] of pairs) {
        if (id) map[id] = canonical;
    }
    return map;
}

/**
 * Map any PayPal plan id (P-...), short name, or plan_* alias to the
 * canonical plan_* enum used by feature-access. Returns null if unknown.
 */
export function normalizePlanId(raw: string | null | undefined): CanonicalPlanId | null {
    if (!raw) return null;
    const key = String(raw).trim();
    if (!key) return null;

    if (ALIAS_TO_CANONICAL[key]) return ALIAS_TO_CANONICAL[key];

    const fromEnv = envPlanMap()[key];
    if (fromEnv) return fromEnv;

    if (KNOWN_PAYPAL_PLAN_IDS[key]) return KNOWN_PAYPAL_PLAN_IDS[key];

    return null;
}

/**
 * Like normalizePlanId, but falls back to a safe paid default when the
 * raw value is an unrecognized PayPal P-... id (subscription already paid).
 */
export function normalizePlanIdOrDefault(
    raw: string | null | undefined,
    fallback: CanonicalPlanId = 'plan_mail_intro'
): CanonicalPlanId {
    return normalizePlanId(raw) ?? fallback;
}
