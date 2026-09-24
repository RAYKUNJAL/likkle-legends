/**
 * Server-side PayPal checkout. Entitlements are written only after PayPal
 * confirms a completed capture or an ACTIVE subscription for the expected plan.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';
import {
    ParentOffer,
    decideOneTimeGrant,
    decideSaleGrant,
    decideSubscriptionGrant,
    formatUsd,
    getParentOffer,
    isParentPayerRole,
    packCustomId,
    parsePackCustomId,
    resolveSubscriptionPlanId,
} from '@/lib/paypal-offers';
import { fulfillMusicPurchase } from '@/lib/music-fulfillment';
import {
    MusicSku,
    decideMusicGrant,
    isMusicSku,
    musicCustomId,
    musicSkuName,
    priceForMusicSku,
} from '@/lib/music-store';

export type PayerUser = {
    id: string;
    email: string | null;
    role: string;
};

/** Sandbox only when PAYPAL_ENV=sandbox. Unset or live uses the live API. */
export function paypalApiBase(): string {
    if (process.env.PAYPAL_ENV === 'sandbox') return 'https://api-m.sandbox.paypal.com';
    return 'https://api-m.paypal.com';
}

export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials are not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json().catch(() => ({})) as { access_token?: string; error_description?: string };
    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || 'PayPal authentication failed');
    }
    return data.access_token;
}

export async function resolveRequestUser(request: NextRequest): Promise<{ id: string; email: string | null } | null> {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length).trim();
        if (token) {
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && data.user) {
                return { id: data.user.id, email: data.user.email ?? null };
            }
        }
    }

    try {
        const supabaseAuth = createClient();
        const { data, error } = await supabaseAuth.auth.getUser();
        if (!error && data.user) {
            return { id: data.user.id, email: data.user.email ?? null };
        }
    } catch (err) {
        console.error('[PAYMENTS] Session lookup failed:', err);
    }

    return null;
}

export async function requireParentPayer(request: NextRequest): Promise<
    { ok: true; user: PayerUser } | { ok: false; response: NextResponse }
> {
    const authUser = await resolveRequestUser(request);
    if (!authUser) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Unauthorized', entitled: false }, { status: 401 }),
        };
    }

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, role, email')
        .eq('id', authUser.id)
        .maybeSingle();

    // Accounts created before role was stored are parents. Explicit non-parent roles stay blocked.
    const role = (data?.role && String(data.role).trim()) || 'parent';
    if (error || !data || !isParentPayerRole(role)) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Only a parent account can check out.', entitled: false },
                { status: 403 }
            ),
        };
    }

    return {
        ok: true,
        user: {
            id: authUser.id,
            email: data.email || authUser.email,
            role,
        },
    };
}

async function paypalFetch(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any }> {
    const token = await getPayPalAccessToken();
    const response = await fetch(`${paypalApiBase()}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

export async function createOneTimeOrder(offer: ParentOffer, userId: string): Promise<{ id: string; status: string }> {
    if (offer.kind !== 'one_time') {
        throw new Error('Subscription plans are not created as one-time orders');
    }

    const result = await paypalFetch('/v2/checkout/orders', {
        method: 'POST',
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: offer.sku,
                    custom_id: packCustomId(userId, offer.sku),
                    description: offer.name,
                    amount: {
                        currency_code: 'USD',
                        value: formatUsd(offer.price),
                    },
                },
            ],
        }),
    });

    if (!result.ok || !result.data?.id) {
        throw new Error(result.data?.message || 'PayPal did not create an order');
    }

    return { id: result.data.id, status: result.data.status || 'CREATED' };
}

export async function createSubscription(offer: ParentOffer, userId: string, returnUrl: string, cancelUrl: string): Promise<{ id: string }> {
    const planId = resolveSubscriptionPlanId(offer);
    if (!planId) {
        throw new Error('PayPal plan is not configured');
    }

    const result = await paypalFetch('/v1/billing/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
            plan_id: planId,
            custom_id: packCustomId(userId, offer.sku),
            application_context: {
                brand_name: 'Likkle Legends',
                locale: 'en-US',
                user_action: 'SUBSCRIBE_NOW',
                return_url: returnUrl,
                cancel_url: cancelUrl,
            },
        }),
    });

    if (!result.ok || !result.data?.id) {
        throw new Error(result.data?.message || 'PayPal did not create a subscription');
    }

    return { id: result.data.id };
}

function captureFromOrder(order: any): { status?: string; amount?: string; currency?: string; customId?: string } {
    const unit = order?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    return {
        status: capture?.status || order?.status,
        amount: capture?.amount?.value,
        currency: capture?.amount?.currency_code || unit?.amount?.currency_code,
        customId: unit?.custom_id || capture?.custom_id || order?.custom_id,
    };
}

async function captureOrReloadOrder(orderId: string): Promise<{ ok: true; data: any } | { ok: false; status: number; error: string }> {
    if (!orderId || !/^[A-Z0-9]+$/i.test(orderId)) {
        return { ok: false, status: 400, error: 'Invalid PayPal order' };
    }

    let result = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: 'POST',
        body: JSON.stringify({}),
    });

    const alreadyCaptured = result.data?.details?.some?.((detail: { issue?: string }) =>
        detail.issue === 'ORDER_ALREADY_CAPTURED'
    );

    if (!result.ok && alreadyCaptured) {
        result = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
    }

    if (!result.ok) {
        return { ok: false, status: 402, error: 'PayPal capture verification failed' };
    }
    return { ok: true, data: result.data };
}

export async function createMusicOrder(userId: string, sku: MusicSku, extra?: string): Promise<{ id: string; status: string }> {
    const price = priceForMusicSku(sku);
    if (price == null) throw new Error('Unknown music product');
    const result = await paypalFetch('/v2/checkout/orders', {
        method: 'POST',
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: sku,
                    custom_id: musicCustomId(userId, sku, extra),
                    description: musicSkuName(sku),
                    amount: {
                        currency_code: 'USD',
                        value: formatUsd(price),
                    },
                },
            ],
        }),
    });
    if (!result.ok || !result.data?.id) {
        throw new Error(result.data?.message || 'PayPal did not create an order');
    }
    return { id: result.data.id, status: result.data.status || 'CREATED' };
}

export async function captureOneTimeOrder(orderId: string, buyer: PayerUser, requestedSku?: string | null) {
    const loaded = await captureOrReloadOrder(orderId);
    if (!loaded.ok) {
        return { entitled: false as const, status: loaded.status, error: loaded.error };
    }

    const captured = captureFromOrder(loaded.data);
    const parsed = parsePackCustomId(captured.customId);
    const offer = getParentOffer(parsed?.sku || requestedSku);
    const decision = decideOneTimeGrant({
        offer,
        captureStatus: captured.status === 'COMPLETED' ? 'COMPLETED' : loaded.data?.status,
        capturedAmount: parseFloat(captured.amount || 'NaN'),
        currency: captured.currency,
        customId: captured.customId,
        buyerUserId: buyer.id,
    });

    if (!decision.ok || !offer) {
        console.error(`[SECURITY] One-time grant refused order=${orderId} reason=${decision.ok ? 'unknown_offer' : decision.reason}`);
        return {
            entitled: false as const,
            status: 402,
            error: 'Payment was not verified',
        };
    }

    const granted = await grantParentEntitlement({
        userId: buyer.id,
        offer,
        providerRef: orderId,
        paypalOrderId: orderId,
        amount: offer.price,
        payerEmail: buyer.email,
    });

    if (!granted.ok) {
        return { entitled: false as const, status: 500, error: 'Payment was captured but access was not unlocked' };
    }

    return {
        entitled: true as const,
        status: 200,
        sku: offer.sku,
        tier: offer.entitlementTier,
        orderId,
    };
}

/**
 * Capture a parent one-time order and grant either an Island Pack or a music
 * license from the reloaded PayPal order. Client sku and amount are ignored.
 */
export async function captureCommerceOrder(orderId: string, buyer: PayerUser) {
    const loaded = await captureOrReloadOrder(orderId);
    if (!loaded.ok) {
        return { entitled: false as const, status: loaded.status, error: loaded.error, handled: true as const };
    }

    const customId = captureFromOrder(loaded.data).customId || '';
    if (customId.trim().startsWith('{')) {
        return { entitled: false as const, status: 200, handled: false as const, captureData: loaded.data };
    }

    const outcome = await grantFromPayPalOrder(loaded.data, orderId, buyer.id);
    if (!outcome.granted) {
        return {
            entitled: false as const,
            status: outcome.reason === 'invalid_order' ? 400 : 402,
            error: 'Payment was not verified',
            handled: true as const,
        };
    }
    return {
        entitled: true as const,
        status: 200,
        handled: true as const,
        sku: outcome.sku,
        tier: outcome.tier,
        entitlement: outcome.entitlement,
        orderId,
    };
}

export async function confirmSubscription(subscriptionId: string, buyer: PayerUser, requestedSku?: string | null) {
    if (!subscriptionId || !/^I-[A-Za-z0-9]+$/.test(subscriptionId)) {
        return { entitled: false as const, status: 400, error: 'Invalid PayPal subscription' };
    }

    let result = await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
    if (result.ok && String(result.data?.status || '').toUpperCase() === 'APPROVED') {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        result = await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
    }
    if (!result.ok) {
        return { entitled: false as const, status: 402, error: 'PayPal subscription verification failed' };
    }

    const customId = result.data?.custom_id || result.data?.custom;
    const parsed = parsePackCustomId(customId);
    const offer = getParentOffer(parsed?.sku || requestedSku);
    const expectedPlanId = offer ? resolveSubscriptionPlanId(offer) : null;
    const decision = decideSubscriptionGrant({
        offer,
        status: result.data?.status,
        paypalPlanId: result.data?.plan_id,
        expectedPlanId,
        customId,
        buyerUserId: buyer.id,
    });

    if (!decision.ok || !offer) {
        console.error(`[SECURITY] Subscription grant refused id=${subscriptionId} reason=${decision.ok ? 'unknown_offer' : decision.reason} status=${result.data?.status}`);
        return { entitled: false as const, status: 402, error: 'Subscription was not verified' };
    }

    const nextBilling = result.data?.billing_info?.next_billing_time;
    const granted = await grantParentEntitlement({
        userId: buyer.id,
        offer,
        providerRef: subscriptionId,
        payerEmail: buyer.email,
        periodEnd: nextBilling || null,
    });

    if (!granted.ok) {
        return { entitled: false as const, status: 500, error: 'Subscription was verified but access was not unlocked' };
    }

    return {
        entitled: true as const,
        status: 200,
        sku: offer.sku,
        tier: offer.entitlementTier,
        subscriptionId,
    };
}

async function loadParentPayer(userId: string): Promise<{ id: string; email: string | null; role: string } | null> {
    const { data } = await supabaseAdmin
        .from('users')
        .select('id, role, email')
        .eq('id', userId)
        .maybeSingle();
    if (!data) return null;
    const role = (data.role && String(data.role).trim()) || 'parent';
    if (!isParentPayerRole(role)) return null;
    return { id: data.id, email: data.email || null, role };
}

type GrantOutcome = {
    granted: boolean;
    reason: string;
    sku?: string;
    tier?: string;
    entitlement?: string;
};

/**
 * Grant from a PayPal order payload that was captured or reloaded from PayPal.
 * Webhook bodies are never passed here.
 */
async function grantFromPayPalOrder(orderData: any, orderId: string, sessionBuyerId?: string): Promise<GrantOutcome> {
    const unit = orderData?.purchase_units?.[0];
    const capture = unit?.payments?.captures?.find((item: { status?: string }) =>
        String(item.status || '').toUpperCase() === 'COMPLETED'
    ) || unit?.payments?.captures?.[0];
    const captured = captureFromOrder(orderData);
    const customId = captured.customId || unit?.custom_id || capture?.custom_id;
    const parsed = parsePackCustomId(customId);
    if (!parsed) return { granted: false, reason: 'missing_custom' };
    if (sessionBuyerId && sessionBuyerId !== parsed.userId) {
        return { granted: false, reason: 'buyer_mismatch' };
    }

    const payer = await loadParentPayer(parsed.userId);
    if (!payer) return { granted: false, reason: 'non_parent' };

    const amount = parseFloat(captured.amount || capture?.amount?.value || 'NaN');
    const currency = captured.currency || capture?.amount?.currency_code || unit?.amount?.currency_code;
    const captureStatus = capture?.status || captured.status;

    const offer = getParentOffer(parsed.sku);
    if (offer?.kind === 'one_time') {
        const decision = decideOneTimeGrant({
            offer,
            captureStatus,
            capturedAmount: amount,
            currency,
            customId,
            buyerUserId: parsed.userId,
        });
        if (!decision.ok) return { granted: false, reason: decision.reason };
        const granted = await grantParentEntitlement({
            userId: parsed.userId,
            offer,
            providerRef: orderId,
            paypalOrderId: orderId,
            amount: offer.price,
            payerEmail: payer.email,
        });
        return granted.ok
            ? { granted: true, reason: 'granted', sku: offer.sku, tier: offer.entitlementTier }
            : { granted: false, reason: 'write_failed' };
    }

    const music = decideMusicGrant({
        captureStatus,
        capturedAmount: amount,
        currency,
        customId,
        buyerUserId: parsed.userId,
    });
    if (!music.ok) {
        return { granted: false, reason: music.reason === 'unknown_offer' ? 'not_one_time_pack' : music.reason };
    }

    const fulfilled = await fulfillMusicPurchase({
        decision: music,
        userId: parsed.userId,
        orderId,
    });
    if (!fulfilled.ok) return { granted: false, reason: fulfilled.reason };
    return {
        granted: true,
        reason: fulfilled.reason,
        sku: music.sku,
        entitlement: music.kind === 'download' ? music.entitlement : undefined,
    };
}

/**
 * Reload a PayPal order and grant a one-time Island Pack or music license
 * only when the captured amount, currency, custom id, and parent role match.
 * Webhook bodies are never trusted on their own.
 */
export async function grantVerifiedOrderById(orderId: string): Promise<{ granted: boolean; reason: string }> {
    if (!orderId || !/^[A-Z0-9]+$/i.test(orderId)) {
        return { granted: false, reason: 'invalid_order' };
    }

    const result = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
    if (!result.ok) {
        return { granted: false, reason: 'order_reload_failed' };
    }

    const outcome = await grantFromPayPalOrder(result.data, orderId);
    return { granted: outcome.granted, reason: outcome.reason };
}

/**
 * Reload a v1 sale. Subscription sales (billing agreement) are ignored.
 * One-time packs grant only from the re-fetched sale, never the webhook payload.
 */
export async function grantVerifiedSaleById(saleId: string): Promise<{ granted: boolean; reason: string }> {
    if (!saleId || !/^[A-Za-z0-9_-]+$/.test(saleId)) {
        return { granted: false, reason: 'invalid_sale' };
    }

    const result = await paypalFetch(`/v1/payments/sale/${encodeURIComponent(saleId)}`);
    if (!result.ok) {
        return { granted: false, reason: 'sale_reload_failed' };
    }

    const sale = result.data || {};
    if (sale.billing_agreement_id) {
        return { granted: false, reason: 'subscription_sale' };
    }

    const linkedOrderId = sale.supplementary_data?.related_ids?.order_id as string | undefined;
    if (linkedOrderId) {
        return grantVerifiedOrderById(linkedOrderId);
    }

    const customId = sale.custom || sale.custom_id;
    const parsed = parsePackCustomId(customId);
    if (!parsed) {
        return { granted: false, reason: 'missing_custom' };
    }

    const offer = getParentOffer(parsed.sku);
    const amountRaw = sale.amount?.total ?? sale.amount?.value;
    const currency = sale.amount?.currency ?? sale.amount?.currency_code;
    const capturedAmount = parseFloat(String(amountRaw ?? 'NaN'));
    const saleState = String(sale.state || sale.status || '');
    const captureStatus = ['COMPLETED', 'COMPLETE'].includes(saleState.toUpperCase()) ? 'COMPLETED' : saleState;

    if (isMusicSku(parsed.sku)) {
        const payer = await loadParentPayer(parsed.userId);
        if (!payer) return { granted: false, reason: 'non_parent' };
        const music = decideMusicGrant({
            captureStatus,
            capturedAmount,
            currency,
            customId,
            buyerUserId: parsed.userId,
        });
        if (!music.ok) return { granted: false, reason: music.reason };
        const fulfilled = await fulfillMusicPurchase({
            decision: music,
            userId: parsed.userId,
            orderId: saleId,
        });
        return fulfilled.ok
            ? { granted: true, reason: fulfilled.reason }
            : { granted: false, reason: fulfilled.reason };
    }

    const decision = decideSaleGrant({
        offer,
        saleState: sale.state || sale.status,
        amount: parseFloat(String(amountRaw ?? 'NaN')),
        currency,
        customId,
        buyerUserId: parsed.userId,
        billingAgreementId: sale.billing_agreement_id,
    });
    if (!decision.ok) {
        return { granted: false, reason: decision.reason };
    }
    if (!offer) {
        return { granted: false, reason: 'unknown_offer' };
    }

    const payer = await loadParentPayer(parsed.userId);
    if (!payer) {
        return { granted: false, reason: 'non_parent' };
    }

    const granted = await grantParentEntitlement({
        userId: parsed.userId,
        offer,
        providerRef: saleId,
        paypalOrderId: saleId,
        amount: offer.price,
        payerEmail: payer.email,
    });
    return granted.ok
        ? { granted: true, reason: 'granted' }
        : { granted: false, reason: 'write_failed' };
}

export async function grantParentEntitlement(input: {
    userId: string;
    offer: ParentOffer;
    providerRef: string;
    paypalOrderId?: string | null;
    amount?: number;
    payerEmail?: string | null;
    periodEnd?: string | null;
}): Promise<{ ok: boolean }> {
    const periodEnd = input.periodEnd
        ? new Date(input.periodEnd)
        : new Date(Date.now() + input.offer.accessDays * 24 * 60 * 60 * 1000);

    if (Number.isNaN(periodEnd.getTime())) {
        return { ok: false };
    }

    const row = {
        user_id: input.userId,
        plan_id: input.offer.entitlementTier,
        status: 'active',
        provider: 'paypal',
        provider_subscription_id: input.providerRef,
        paypal_order_id: input.paypalOrderId || null,
        payer_email: input.payerEmail || null,
        current_period_end: periodEnd.toISOString(),
    };

    const saved = await saveSubscription(row);
    if (!saved) return { ok: false };

    if (input.offer.kind === 'one_time' && input.paypalOrderId) {
        const { error } = await supabaseAdmin.from('one_time_orders').upsert({
            order_id: input.paypalOrderId,
            user_id: input.userId,
            product_id: input.offer.sku,
            product_name: input.offer.name,
            parent_email: input.payerEmail || `${input.userId}@parent.invalid`,
            amount: input.amount ?? input.offer.price,
            currency: 'USD',
            status: 'paid',
            metadata: {
                verified: true,
                sku: input.offer.sku,
                entitlement_tier: input.offer.entitlementTier,
            },
        }, { onConflict: 'order_id' });

        if (error) {
            console.error('[PAYMENTS] one_time_orders write failed:', error);
        }
    }

    return { ok: true };
}

async function saveSubscription(row: Record<string, unknown>): Promise<boolean> {
    const upsert = await supabaseAdmin
        .from('subscriptions')
        .upsert(row, { onConflict: 'provider_subscription_id' });

    if (!upsert.error) return true;

    console.error('[PAYMENTS] subscription upsert failed:', upsert.error);

    const providerRef = String(row.provider_subscription_id || '');
    const existing = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('provider_subscription_id', providerRef)
        .maybeSingle();

    if (existing.data?.id) {
        const update = await supabaseAdmin.from('subscriptions').update(row).eq('id', existing.data.id);
        return !update.error;
    }

    const insert = await supabaseAdmin.from('subscriptions').insert(row);
    if (insert.error) {
        console.error('[PAYMENTS] subscription insert failed:', insert.error);
        return false;
    }
    return true;
}

export function paymentErrorResponse(error: unknown, status = 503) {
    const message = error instanceof Error ? error.message : 'Payment service unavailable';
    const safe = /not configured|authentication failed|plan is not configured/i.test(message)
        ? message
        : 'Payment could not be completed';
    return NextResponse.json({ error: safe, entitled: false }, { status });
}
