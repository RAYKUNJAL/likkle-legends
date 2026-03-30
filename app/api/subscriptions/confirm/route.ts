import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, token } = await request.json();

    if (!subscriptionId || !token) {
      return NextResponse.json(
        { error: 'Subscription ID and token are required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Update subscription in database
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        provider_subscription_id: subscriptionId,
        status: 'active',
        provider: 'paypal',
      });

    if (error) {
      console.error('Subscription confirmation error:', error);
      return NextResponse.json(
        { error: 'Failed to confirm subscription' },
        { status: 500 }
      );
    }

    // Update user profile
    await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription confirmed',
        subscriptionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
