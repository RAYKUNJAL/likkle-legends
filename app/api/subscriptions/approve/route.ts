import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const userIdParam = req.nextUrl.searchParams.get('user_id');

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=missing_token', req.url));
  }

  // ── Auth: verify the user session (cookie or Bearer) ──
  // Previously this endpoint accepted any user_id from the query string and
  // forwarded it to a Supabase Edge Function with no auth — allowing anyone
  // to capture orders for other users.
  const supabaseAuth = createClient();
  const { data: { user: sessionUser } } = await supabaseAuth.auth.getUser();
  let userId = sessionUser?.id || null;

  if (!userId) {
    // Try Bearer token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      const { data: bearerData } = await supabaseAdmin.auth.getUser(bearerToken);
      userId = bearerData?.user?.id || null;
    }
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login?redirect=/checkout', req.url));
  }

  // If user_id param was provided, verify it matches the authenticated user
  if (userIdParam && userIdParam !== userId) {
    console.warn(`[SECURITY] User ${userId} attempted to approve order for user_id=${userIdParam}`);
    return NextResponse.redirect(new URL('/checkout?error=unauthorized', req.url));
  }

  try {
    const res = await fetch(
      'https://yvoyywnxaammsfwgjvkp.supabase.co/functions/v1/capture-paypal-order',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: token, user_id: userId }),
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
