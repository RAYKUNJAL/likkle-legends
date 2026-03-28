import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { sendEmail, SUBSCRIPTION_CONFIRMATION_TEMPLATE, TRIAL_REMINDER_TEMPLATE } from '@/lib/email';

const supabase = supabaseAdmin;

// ── Env validation ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase env vars');
}

// Internal mapping of PayPal Plan IDs to our logic tiers
const PLAN_TO_TIER: Record<string, string> = {
    'P-0LU582199P7741420NGQA4JI': 'digital_legends',
    'P-9Y7503296X038324YNGN72CI': 'starter_mailer',
    'P-1R150232CG183332XNFLNNBQ': 'starter_mailer',
    'P-0YY72736T56573355NFLOZZQ': 'starter_mailer',
    'P-45M32159VV6033601NFLOOYI': 'legends_plus',
    'P-2503312149524980NNFLO34Y': 'legends_plus',
    'P-9MP32022V70125639NFLT4IA': 'family_legacy',
    'P-4G842008M1421443UNFLO3MY': 'family_legacy',
    'P-5U054702T9664311ANFLO53A': 'family_legacy',
    'P-5U054702T9664311ANFLO53': 'family_legacy',
};

if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL] = 'digital_legends';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER] = 'starter_mailer';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS] = 'legends_plus';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY] = 'family_legacy';

// ── PayPal base URL ───────────────────────────────────────────────────────────
const PAYPAL_BASE =
    process.env.PAYPAL_ENV === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

// ── Get PayPal access token ───────────────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('Missing PayPal credentials');
    }
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
    const data = await res.json() as { access_token: string };
    return data.access_token;
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
    } catch {
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
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const eventType = event.event_type;
    const resource = event.resource;

    console.log('PayPal webhook event:', eventType);

    try {
        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                const subscriptionId = resource.id;
                const subscriberEmail = resource.subscriber?.email_address;
                const customId = resource.custom_id || resource.custom;

                let query = supabase.from('profiles').select('id, parent_name, email, subscription_status');

                if (customId) {
                    query = query.eq('id', customId);
                } else if (subscriptionId) {
                    query = query.or(`paypal_subscription_id.eq.${subscriptionId},email.eq.${subscriberEmail}`);
                } else {
                    query = query.eq('email', subscriberEmail);
                }

                const { data: profile } = await query.maybeSingle();

                if (profile) {
                    const planId = resource.plan_id;
                    const tier = PLAN_TO_TIER[planId] || 'starter_mailer';
                    const nextBillingTime = resource.billing_info?.next_billing_time;
                    const isTrialing = nextBillingTime &&
                        new Date(nextBillingTime).getTime() > Date.now() + 24 * 60 * 60 * 1000;
                    const alreadyTrialing = profile.subscription_status === 'trialing';
                    const newStatus = (isTrialing || alreadyTrialing) ? 'trialing' : 'active';

                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: newStatus,
                            subscription_tier: tier,
                            paypal_subscription_id: subscriptionId,
                            next_billing_date: nextBillingTime?.split('T')[0] ?? null,
                            ...(isTrialing && { trial_ends_at: nextBillingTime }),
                        })
                        .eq('id', profile.id);

                    // Also update the 'subscriptions' table
                    await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: profile.id,
                            plan_id: planId,
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

                let query = supabase.from('profiles').select('id, parent_name, email, subscription_status, subscription_tier');

                if (customId) {
                    query = query.eq('id', customId);
                } else if (subscriptionId) {
                    query = query.or(`paypal_subscription_id.eq.${subscriptionId},email.eq.${subscriberEmail}`);
                } else {
                    query = query.eq('email', subscriberEmail);
                }

                const { data: profile } = await query.maybeSingle();

                if (profile) {
                    const wasTrialing = profile.subscription_status === 'trialing';
                    const planId = resource.plan_id;
                    const tier = planId ? (PLAN_TO_TIER[planId] || profile.subscription_tier) : profile.subscription_tier;

                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            subscription_tier: tier,
                            trial_ends_at: null,
                            next_billing_date: resource.billing_info?.next_billing_time?.split('T')[0] ?? null,
                        })
                        .eq('id', profile.id);

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

                let query = supabase.from('profiles').select('id, email, parent_name, subscription_tier');

                if (customId) {
                    query = query.eq('id', customId);
                } else if (subscriptionId) {
                    query = query.or(`paypal_subscription_id.eq.${subscriptionId},email.eq.${subscriberEmail}`);
                } else {
                    query = query.eq('email', subscriberEmail);
                }

                const { data: profile } = await query.maybeSingle();

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
                    .from('profiles')
                    .update({
                        subscription_status: 'canceled',
                    })
                    .eq('paypal_subscription_id', subscriptionId);
                break;
            }

            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
                const subscriptionId = resource.id;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('paypal_subscription_id', subscriptionId)
                    .single();

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({ subscription_status: 'past_due' })
                        .eq('id', profile.id);

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
                const payerId = resource.payer_id;
                const amount = resource.amount?.total;
                const currency = resource.amount?.currency;

                console.log(`Payment completed: ${amount} ${currency} from ${payerId}`);
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
