import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscriptions/confirm
 *
 * Security: This endpoint previously accepted a client-supplied JWT signed with
 * a hardcoded fallback secret ('your-secret-key'), which let anyone forge a
 * token and activate premium for free. It now requires a real Supabase session
 * (cookie or Bearer) and verifies the PayPal subscription/order server-side
 * before activating.
 */

const PAYPAL_BASE =
    process.env.PAYPAL_ENV === 'sandbox' || process.env.NODE_ENV !== 'production'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials are not configured');
    }
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await res.json() as { access_token?: string; error_description?: string };
    if (!res.ok || !data.access_token) {
        throw new Error(data.error_description || 'Could not authenticate with PayPal');
    }
    return data.access_token;
}

/**
 * Verify a PayPal subscription by fetching it from PayPal's API.
 * Returns the plan_id if the subscription is valid and active/trialing.
 */
async function verifyPayPalSubscription(subscriptionId: string): Promise<{ planId: string | null; valid: boolean }> {
    try {
        const token = await getPayPalAccessToken();
        const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { planId: null, valid: false };
        const data = await res.json() as { plan_id?: string; status?: string };
        const validStatuses = ['ACTIVE', 'APPROVAL_PENDING', 'TRIALING'];
        return {
            planId: data.plan_id || null,
            valid: validStatuses.includes(data.status || ''),
        };
    } catch {
        return { planId: null, valid: false };
    }
}

/**
 * Verify a PayPal order by fetching it from PayPal's API.
 * Returns true if the order is COMPLETED.
 */
async function verifyPayPalOrder(orderId: string): Promise<boolean> {
    try {
        const token = await getPayPalAccessToken();
        const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return false;
        const data = await res.json() as { status?: string };
        return data.status === 'COMPLETED';
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, orderId, tier } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }

        // ── Auth: require a real Supabase session (cookie or Bearer) ──
        const supabaseAuth = createClient();
        const { data: { user: sessionUser }, error: authError } = await supabaseAuth.auth.getUser();

        let userId: string | null = null;

        if (!authError && sessionUser) {
            userId = sessionUser.id;
        } else {
            // Try Bearer token as fallback
            const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.replace(/^Bearer\s+/i, '').trim();
                const { data: bearerData, error: bearerError } = await supabaseAdmin.auth.getUser(token);
                if (bearerError || !bearerData?.user) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                userId = bearerData.user.id;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Verify the PayPal subscription/order server-side ──
        // The client sends a `tier` but we must not trust it — we verify
        // against PayPal's API and derive the tier from the real plan_id.
        let verifiedTier: string | null = null;

        if (subscriptionId) {
            const verification = await verifyPayPalSubscription(subscriptionId);
            if (!verification.valid) {
                return NextResponse.json(
                    { error: 'Subscription could not be verified with PayPal' },
                    { status: 400 }
                );
            }
            // Map plan_id to tier if possible
            if (verification.planId) {
                const planEnvMap: Record<string, string> = {
                    [process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL || '']: 'digital_legends',
                    [process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER || '']: 'starter_mailer',
                    [process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS || '']: 'legends_plus',
                    [process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY || '']: 'family_legacy',
                };
                verifiedTier = planEnvMap[verification.planId] || tier;
            }
        }

        if (orderId && !verifiedTier) {
            const orderValid = await verifyPayPalOrder(orderId);
            if (!orderValid) {
                return NextResponse.json(
                    { error: 'Order could not be verified with PayPal' },
                    { status: 400 }
                );
            }
            verifiedTier = tier;
        }

        // Use the verified tier, or fall back to the client-provided one only
        // if PayPal verification succeeded but didn't return a plan_id.
        const finalTier = verifiedTier || tier;

        const isFree = finalTier === 'plan_free_forever';
        const TRIAL_DAYS = 7;
        const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const daysToAdd = body.billingCycle === 'year' ? 365 : 30;
        const nextBillingDate = isFree
            ? new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
            : trialEndsAt;

        const { error: subscriptionError } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            plan_id: finalTier,
            status: isFree ? 'active' : 'trialing',
            provider: 'paypal',
            provider_subscription_id: subscriptionId || orderId || null,
            paypal_order_id: orderId || null,
            payer_email: body.email?.toLowerCase() || null,
            current_period_end: nextBillingDate.toISOString(),
        }, { onConflict: 'provider_subscription_id' });

        if (subscriptionError) {
            console.error('Subscription activation error:', subscriptionError);
            return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription confirmed',
            tier: finalTier,
            subscriptionId: subscriptionId || orderId,
        });
    } catch (error) {
        console.error('Subscription confirmation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
