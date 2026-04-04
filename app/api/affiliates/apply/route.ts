import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, paypal_email, instagram_handle } = await req.json();

    if (!email || !paypal_email) {
      return NextResponse.json(
        { error: 'Email and PayPal email required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate unique referral code
    const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert affiliate application
    const { data, error } = await supabase
      .from('promoters')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        paypal_email: paypal_email,
        instagram_handle: instagram_handle || null,
        status: 'pending_approval',
      })
      .select()
      .single();

    if (error) {
      console.error('Affiliate apply error:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      referral_code: referralCode,
      message: 'Application submitted. Review in 48 hours.'
    });
  } catch (err) {
    console.error('Affiliate API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
