/**
 * Parent music order states. Entitlements are a later step than capture.
 * created → paypal_pending → captured → entitled
 * Custom song work, after payment: paid → queued → in_progress → delivered
 */

export const COMMERCE_ORDER_STATES = ['created', 'paypal_pending', 'captured', 'entitled', 'failed'] as const;
export type CommerceOrderState = (typeof COMMERCE_ORDER_STATES)[number];

export type CommerceOrderEvent = 'paypal_created' | 'capture_verified' | 'entitlement_written' | 'paypal_failed';

const COMMERCE_TRANSITIONS: Record<CommerceOrderEvent, Partial<Record<CommerceOrderState, CommerceOrderState>>> = {
    paypal_created: { created: 'paypal_pending' },
    capture_verified: { created: 'captured', paypal_pending: 'captured', captured: 'captured', entitled: 'entitled' },
    entitlement_written: { captured: 'entitled', entitled: 'entitled' },
    paypal_failed: { created: 'failed', paypal_pending: 'failed' },
};

export function nextCommerceOrderState(from: string | null | undefined, event: CommerceOrderEvent): CommerceOrderState | null {
    const current = normalizeCommerceState(from);
    if (!current) return null;
    return COMMERCE_TRANSITIONS[event][current] ?? null;
}

export function normalizeCommerceState(value: string | null | undefined): CommerceOrderState | null {
    const state = String(value || '').toLowerCase();
    return (COMMERCE_ORDER_STATES as readonly string[]).includes(state) ? state as CommerceOrderState : null;
}

export function commerceOrderLabel(state: string | null | undefined): string {
    switch (normalizeCommerceState(state)) {
        case 'created': return 'Started';
        case 'paypal_pending': return 'Waiting on PayPal';
        case 'captured': return 'Payment captured';
        case 'entitled': return 'On your account';
        case 'failed': return 'Not completed';
        default: return 'Started';
    }
}

export const CUSTOM_WORK_STATES = ['created', 'paypal_pending', 'paid', 'queued', 'in_progress', 'delivered'] as const;
export type CustomWorkState = (typeof CUSTOM_WORK_STATES)[number];

export function normalizeCustomWorkState(value: string | null | undefined): CustomWorkState {
    const state = String(value || '').toLowerCase();
    if (state === 'awaiting_payment' || state === 'pending' || state === '') return 'created';
    if (state === 'creating') return 'in_progress';
    if (state === 'ready') return 'delivered';
    if ((CUSTOM_WORK_STATES as readonly string[]).includes(state)) return state as CustomWorkState;
    return 'created';
}

/** Payment verified moves the request to the queue. Admin advances it from there. */
export function customSongStateAfterPayment(from: string | null | undefined): CustomWorkState | null {
    const current = normalizeCustomWorkState(from);
    if (current === 'created' || current === 'paypal_pending' || current === 'paid') return 'queued';
    if (current === 'queued' || current === 'in_progress' || current === 'delivered') return current;
    return null;
}

export function decideCustomSongAdvance(from: string | null | undefined, to: 'in_progress' | 'delivered'): boolean {
    const current = normalizeCustomWorkState(from);
    if (to === 'in_progress') return current === 'queued';
    return current === 'in_progress';
}

export function customSongLabel(status: string | null | undefined): string {
    switch (normalizeCustomWorkState(status)) {
        case 'created': return 'Saved';
        case 'paypal_pending': return 'Payment started';
        case 'paid': return 'Paid';
        case 'queued': return 'Queued';
        case 'in_progress': return 'In progress';
        case 'delivered': return 'Delivered';
        default: return 'Saved';
    }
}

/** Support log. Never include notes, child names, emails, or PayPal secrets. */
export function musicOrderLog(event: string, fields: {
    userId?: string;
    sku?: string;
    orderId?: string;
    paypalOrderId?: string;
    from?: string;
    to?: string;
    reason?: string;
}) {
    console.info(JSON.stringify({
        scope: 'music-order',
        event,
        userId: fields.userId || null,
        sku: fields.sku || null,
        orderId: fields.orderId || null,
        paypalOrderId: fields.paypalOrderId || null,
        from: fields.from || null,
        to: fields.to || null,
        reason: fields.reason || null,
    }));
}
