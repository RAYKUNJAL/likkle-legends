import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_BASE = process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
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

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, returnUrl, cancelUrl } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Create subscription
    const response = await fetch(
      `${PAYPAL_BASE}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            name: {
              given_name: 'Subscriber',
            },
            email_address: 'subscriber@example.com',
          },
          application_context: {
            brand_name: 'Likkle Legends',
            locale: 'en-US',
            user_action: 'SUBSCRIBE_NOW',
            return_url: returnUrl || 'https://likklelegends.com/portal',
            cancel_url: cancelUrl || 'https://likklelegends.com/pricing',
          },
          custom_id: userId || '',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    const data = await response.json() as { id: string; links: Array<{ rel: string; href: string }> };

    // Find approval link
    const approvalLink = data.links.find((link) => link.rel === 'approve')?.href;

    return NextResponse.json(
      {
        success: true,
        subscriptionId: data.id,
        approvalUrl: approvalLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
