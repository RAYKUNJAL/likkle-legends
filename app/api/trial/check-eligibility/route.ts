import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user has already used trial
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('trial_used, trial_ended_at, subscription_status')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isEligible = !profile.trial_used && profile.subscription_status === 'free';
    const trialDaysRemaining = profile.trial_used ? 0 : 7; // 7-day trial

    return NextResponse.json(
      {
        eligible: isEligible,
        trialDaysRemaining,
        hasUsedTrial: profile.trial_used || false,
        currentStatus: profile.subscription_status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Trial eligibility check error:', error);
    return NextResponse.json(
      { error: 'Trial eligibility check failed' },
      { status: 500 }
    );
  }
}
