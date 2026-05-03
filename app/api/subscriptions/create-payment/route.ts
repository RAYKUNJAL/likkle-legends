import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '@/lib/paypal';

const PAYPAL_BASE = process.env.PAYPAL_ENV === 'sandbox' || process.env.NODE_ENV !== 'production'
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
      Authorization: `Basic ${credentials}`,
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

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, returnUrl, cancelUrl } = await req.json();
    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];

    if (!plan || plan.id === 'plan_free_forever' || !plan.paypalPlanId) {
      return NextResponse.json({ error: 'Invalid or unconfigured subscription plan' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: plan.paypalPlanId,
        application_context: {
          brand_name: 'Likkle Legends',
          locale: 'en-US',
          user_action: 'SUBSCRIBE_NOW',
          return_url: returnUrl || `${req.nextUrl.origin}/checkout/success`,
          cancel_url: cancelUrl || `${req.nextUrl.origin}/checkout?cancelled=true`,
        },
        custom_id: userId || '',
      }),
    });

    const data = await res.json() as { id?: string; links?: Array<{ rel: string; href: string }>; message?: string };
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Failed to create payment' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: data.id,
      approvalUrl: data.links?.find((link) => link.rel === 'approve')?.href,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
