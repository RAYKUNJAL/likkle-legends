import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const userId = req.nextUrl.searchParams.get('user_id');

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=missing_token', req.url));
  }

  try {
    const res = await fetch(
      'https://yvoyywnxaammsfwgjvkp.supabase.co/functions/v1/capture-paypal-order',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: token, user_id: userId || 'unknown' }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      return NextResponse.redirect(
        new URL(`/checkout/success?transaction_id=${data.transaction_id || token}`, req.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/checkout?error=${encodeURIComponent(data.error || 'capture_failed')}`, req.url)
    );
  } catch (_e) {
    return NextResponse.redirect(new URL('/checkout?error=server_error', req.url));
  }
}
