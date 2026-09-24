import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { sendEmail, SUBSCRIPTION_CONFIRMATION_TEMPLATE, TRIAL_REMINDER_TEMPLATE } from '@/lib/email';
import { getParentOffer, parsePackCustomId, tierForPaypalPlanId } from '@/lib/paypal-offers';
import { getPayPalAccessToken, grantVerifiedOrderById, grantVerifiedSaleById, paypalApiBase } from '@/lib/paypal-checkout';

// ── Env validation ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

function hasSupabaseWebhookConfig(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

// ── PayPal base URL ───────────────────────────────────────────────────────────
const PAYPAL_BASE = paypalApiBase();

// ── Get PayPal access token ───────────────────────────────────────────────────
function payerIdFromCustom(customId: string | undefined): string | undefined {
    return parsePackCustomId(customId)?.userId || customId;
}

// ── Verify PayPal webhook signature ──────────────────────────────────────────
async function verifyWebhookSignature(
    request: NextRequest,
    rawBody: string
): Promise<boolean> {
    if (!PAYPAL_WEBHOOK_ID) {
        console.error('PAYPAL_WEBHOOK_ID is not set — rejecting webhook');
        return false;
    }

    const transmissionId = request.headers.get('paypal-transmission-id');
    const transmissionTime = request.headers.get('paypal-transmission-time');
    const certUrl = request.headers.get('paypal-cert-url');
    const authAlgo = request.headers.get('paypal-auth-algo');
    const transmissionSig = request.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        console.error('PayPal webhook: missing required signature headers');
        return false;
    }

    // Cert URL must be a PayPal domain — prevent SSRF
    let certHostname: string;
    try {
        certHostname = new URL(certUrl).hostname;
    } catch (_e) {
        console.error('PayPal webhook: cert URL is invalid');
        return false;
    }

    if (!certHostname.endsWith('.paypal.com') && certHostname !== 'paypal.com') {
        console.error('PayPal webhook: cert URL is not from paypal.com domain');
        return false;
    }

    try {
        const accessToken = await getPayPalAccessToken();
        const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transmission_id: transmissionId,
                transmission_time: transmissionTime,
                cert_url: certUrl,
                auth_algo: authAlgo,
                transmission_sig: transmissionSig,
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: JSON.parse(rawBody),
            }),
        });

        if (!verifyRes.ok) {
            console.error(`PayPal signature verify API error: ${verifyRes.status}`);
            return false;
        }

        const verifyData = await verifyRes.json() as { verification_status: string };
        return verifyData.verification_status === 'SUCCESS';
    } catch (err) {
        console.error('PayPal webhook signature verification threw:', err);
        return false;
    }
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    if (!hasSupabaseWebhookConfig()) {
        console.error('PayPal webhook: missing Supabase environment variables');
        return NextResponse.json({ error: 'Webhook storage is not configured' }, { status: 503 });
    }

    // 1. Read raw body BEFORE parsing — needed for signature verification
    const rawBody = await request.text();

    // 2. Verify signature — reject anything that doesn't pass
    const isValid = await verifyWebhookSignature(request, rawBody);
    if (!isValid) {
        console.error('PayPal webhook: signature verification FAILED — rejecting');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 3. Parse event
    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch (_e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const eventType = event.event_type;
    const resource = event.resource;
    const supabase = supabaseAdmin;

    // `profiles` is a read-only VIEW (no paypal_subscription_id column).
    // Subscription ids must be resolved through the `subscriptions` table.
    const findProfile = async (customId: string | undefined, subscriptionId: string | undefined, email: string | undefined, columns: string) => {
        if (customId) {
            const { data } = await supabase.from('profiles').select(columns).eq('id', customId).maybeSingle();
            if (data) return data as any;
        }
        if (subscriptionId) {
            const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('provider_subscription_id', subscriptionId).maybeSingle();
            if (sub?.user_id) {
                const { data } = await supabase.from('profiles').select(columns).eq('id', sub.user_id).maybeSingle();
                if (data) return data as any;
            }
        }
        if (email) {
            const { data } = await supabase.from('profiles').select(columns).eq('email', email).maybeSingle();
            if (data) return data as any;
        }
        return null;
    };

    console.log('PayPal webhook event:', eventType);

    try {
        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                const subscriptionId = resource.id;
                const subscriberEmail = resource.subscriber?.email_address;
                const customId = resource.custom_id || resource.custom;

                const profile = await findProfile(payerIdFromCustom(customId), subscriptionId, subscriberEmail, 'id, parent_name, email, subscription_status');

                if (profile) {
                    const planId = resource.plan_id;
                    const tier = tierForPaypalPlanId(planId);
                    if (!tier) {
                        console.error(`[SECURITY] Webhook activation ignored unmapped plan_id=${planId}`);
                        break;
                    }
                    const nextBillingTime = resource.billing_info?.next_billing_time;
                    const annualOffer = getParentOffer(parsePackCustomId(customId)?.sku);
                    const isAnnual = annualOffer?.interval === 'year';
                    const isTrialing = !isAnnual && nextBillingTime &&
                        new Date(nextBillingTime).getTime() > Date.now() + 24 * 60 * 60 * 1000;
                    const alreadyTrialing = profile.subscription_status === 'trialing';
                    const newStatus = isAnnual ? 'active' : ((isTrialing || alreadyTrialing) ? 'trialing' : 'active');

                    await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: profile.id,
                            plan_id: tier,
                            status: newStatus as any,
                            provider: 'paypal',
                            provider_subscription_id: subscriptionId,
                            current_period_end: nextBillingTime ?? null,
                        }, { onConflict: 'provider_subscription_id' });

                    console.log(`Subscription activated for ${profile.id}, tier: ${tier}, status: ${newStatus}`);

                    if (newStatus === 'active') {
                        const { data: child } = await supabase
                            .from('children')
                            .select('first_name')
                            .eq('parent_id', profile.id)
                            .limit(1)
                            .maybeSingle();

                        await sendEmail({
                            to: profile.email || subscriberEmail,
                            subject: "You're Officially in the Club!",
                            html: SUBSCRIPTION_CONFIRMATION_TEMPLATE(
                                profile.parent_name || 'Legend Parent',
                                tier.replace('_', ' ').toUpperCase(),
                                child?.first_name || 'your little legend'
                            )
                        });
                    }
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.RENEWED':
            case 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED': {
                const subscriptionId = resource.id ?? resource.billing_agreement_id;
                const subscriberEmail = resource.subscriber?.email_address;
                const customId = resource.custom_id || resource.custom;

                const profile = await findProfile(payerIdFromCustom(customId), subscriptionId, subscriberEmail, 'id, parent_name, email, subscription_status, subscription_tier');

                if (profile) {
                    const wasTrialing = profile.subscription_status === 'trialing';
                    const planId = resource.plan_id;
                    const tier = tierForPaypalPlanId(planId);
                    if (!tier) {
                        console.error(`[SECURITY] Webhook renewal ignored unmapped plan_id=${planId}`);
                        break;
                    }

                    // Record renewal in the subscriptions table (drives the profiles view)
                    await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: profile.id,
                            plan_id: tier,
                            status: 'active',
                            provider: 'paypal',
                            provider_subscription_id: subscriptionId,
                            current_period_end: resource.billing_info?.next_billing_time ?? null,
                        }, { onConflict: 'provider_subscription_id' });

                    console.log(`Payment completed for ${profile.id}, tier: ${tier}, was trialing: ${wasTrialing}`);

                    if (wasTrialing) {
                        const { data: child } = await supabase
                            .from('children')
                            .select('first_name')
                            .eq('parent_id', profile.id)
                            .limit(1)
                            .maybeSingle();

                        await sendEmail({
                            to: profile.email || subscriberEmail,
                            subject: "You're Officially in the Club!",
                            html: SUBSCRIPTION_CONFIRMATION_TEMPLATE(
                                profile.parent_name || 'Legend Parent',
                                tier.replace('_', ' ').toUpperCase(),
                                child?.first_name || 'your little legend'
                            )
                        });
                    }
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.TRIAL.ENDING': {
                const subscriptionId = resource.id;
                const subscriberEmail = resource.subscriber?.email_address;
                const customId = resource.custom_id || resource.custom;

                const profile = await findProfile(payerIdFromCustom(customId), subscriptionId, subscriberEmail, 'id, email, parent_name, subscription_tier');

                if (profile) {
                    const { data: child } = await supabase
                        .from('children')
                        .select('first_name')
                        .eq('parent_id', profile.id)
                        .limit(1)
                        .maybeSingle();

                    await sendEmail({
                        to: profile.email || subscriberEmail,
                        subject: 'Your free trial ends soon. Keep the adventure going!',
                        html: TRIAL_REMINDER_TEMPLATE(
                            profile.parent_name || 'Legend Parent',
                            child?.first_name || 'your little legend',
                            profile.subscription_tier || 'starter_mailer'
                        )
                    });
                    console.log(`Trial ending email sent to ${profile.id}`);
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED': {
                const subscriptionId = resource.id;

                await supabase
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('provider_subscription_id', subscriptionId);
                break;
            }

            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
                const subscriptionId = resource.id;

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('provider_subscription_id', subscriptionId)
                    .maybeSingle();

                if (sub?.user_id) {
                    const profile = { id: sub.user_id };
                    await supabase
                        .from('subscriptions')
                        .update({ status: 'past_due' })
                        .eq('provider_subscription_id', subscriptionId);

                    await supabase.from('notifications').insert({
                        user_id: profile.id,
                        title: 'Payment Issue',
                        body: 'We could not process your latest payment. Please update your payment method to keep your subscription active.',
                        notification_type: 'subscription',
                        action_url: '/account/billing',
                    });
                }
                break;
            }

            case 'PAYMENT.SALE.COMPLETED': {
                const relatedOrderId = resource?.supplementary_data?.related_ids?.order_id as string | undefined;
                if (relatedOrderId) {
                    const outcome = await grantVerifiedOrderById(relatedOrderId);
                    if (!outcome.granted && outcome.reason !== 'not_one_time_pack') {
                        console.error(`[SECURITY] Sale webhook refused order=${relatedOrderId} reason=${outcome.reason}`);
                    }
                    break;
                }

                const saleId = typeof resource?.id === 'string' ? resource.id : '';
                if (!saleId) break;
                const outcome = await grantVerifiedSaleById(saleId);
                if (!outcome.granted && outcome.reason !== 'subscription_sale' && outcome.reason !== 'not_one_time_pack') {
                    console.error(`[SECURITY] Sale webhook refused sale=${saleId} reason=${outcome.reason}`);
                }
                break;
            }

            case 'PAYMENT.CAPTURE.COMPLETED': {
                const orderId = resource?.supplementary_data?.related_ids?.order_id as string | undefined;
                if (!orderId) break;

                const outcome = await grantVerifiedOrderById(orderId);
                if (!outcome.granted) {
                    console.error(`[SECURITY] Webhook capture refused order=${orderId} reason=${outcome.reason}`);
                }
                break;
            }

            default:
                console.log('Unhandled event type:', eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
