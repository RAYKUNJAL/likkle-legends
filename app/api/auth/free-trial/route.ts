import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createCookieClient } from '@/lib/supabase/server';
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE } from '@/lib/email';
import { checkRateLimit } from '@/lib/api/rate-limit';

async function createInitialChild(
  supabase: SupabaseClient,
  userId: string,
  childName: string,
  island: string
) {
  const basePayload = {
    parent_id: userId,
    age: 5,
    age_track: 'mini',
    avatar_id: 'lion',
    primary_island: island || 'mixed',
  };

  let result = await supabase.from('children').insert({
    ...basePayload,
    first_name: childName,
  });

  if (result.error?.message?.includes("Could not find the 'first_name' column")) {
    result = await supabase.from('children').insert({
      ...basePayload,
      full_name: childName,
    });
  }

  if (result.error?.message?.includes("Could not find the 'full_name' column")) {
    result = await supabase.from('children').insert({
      parent_id: userId,
      name: childName,
      island: island || '',
      created_at: new Date().toISOString(),
    });
  }

  if (result.error) {
    console.error('[Free Trial API] Child creation warning:', result.error.message);
  }
}

/**
 * POST /api/auth/free-trial
 * Creates a free explorer account. Never returns a magic-link action_link.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'global';
  const limited = checkRateLimit(`free-trial:${ip}`, 5, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { email, parentName, childName, island, source, adCharacter } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: parentName || '',
        source: source || 'free_trial_page',
        ad_character: adCharacter || '',
      },
    });

    if (authError) {
      if (authError.message?.includes('already') || authError.status === 422) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.', loginRequired: true },
          { status: 409 }
        );
      }
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error('User creation failed — no ID returned');

    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: parentName || '',
      subscription_status: 'active',
      subscription_tier: 'free',
      island_heritage: island || '',
      signup_source: source || 'free_trial_page',
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    try {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_id: 'plan_free_forever',
        status: 'active',
        provider: 'none',
        provider_subscription_id: `free:${userId}`,
      }, { onConflict: 'provider_subscription_id' });
    } catch (_e) {
      console.warn('[Free Trial API] subscriptions upsert skipped');
    }

    if (childName) {
      await createInitialChild(supabase, userId, childName, island);
    }

    await supabase.from('leads').insert({
      email,
      name: parentName || '',
      source: source || 'free_trial_page',
      status: 'free_signup',
      island: island || '',
      created_at: new Date().toISOString(),
    }).select().single();

    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_ADS_ACCESS_TOKEN;
    if (pixelId && accessToken) {
      const crypto = await import('crypto');
      const hashedEmail = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

      fetch(`https://graph.facebook.com/v20.0/${pixelId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: 'https://www.likklelegends.com/free-trial',
            action_source: 'website',
            user_data: { em: [hashedEmail] },
            custom_data: {
              content_name: 'free_trial_signup',
              content_category: 'education',
              island: island || 'unknown',
              ad_character: adCharacter || 'none',
            },
          }],
          access_token: accessToken,
        }),
      }).catch(() => {});
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com';
    fetch(`${siteUrl}/api/cron/nurture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
      },
      body: JSON.stringify({
        userId,
        email,
        firstName: parentName || '',
        childName: childName || '',
        island: island || '',
        trigger: 'free_trial_signup',
        source: source || 'free_trial_page',
      }),
    }).catch(() => {});

    let sessionEstablished = false;
    let emailSent = false;
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/api/auth/callback?next=/portal` },
    });
    const hashedToken = linkData?.properties?.hashed_token;
    const actionLink = linkData?.properties?.action_link;

    if (hashedToken) {
      try {
        const cookieClient = createCookieClient();
        const { error: otpError } = await cookieClient.auth.verifyOtp({
          token_hash: hashedToken,
          type: 'email',
        });
        sessionEstablished = !otpError;
      } catch (err) {
        console.warn('[Free Trial API] Server session establish failed:', err);
      }
    }

    if (!sessionEstablished && actionLink) {
      const mailed = await sendEmail({
        to: email,
        subject: 'Enter Likkle Legends',
        html: CONFIRMATION_EMAIL_TEMPLATE(parentName || 'Legend Parent', actionLink),
      });
      emailSent = Boolean(mailed?.success);
    }

    return NextResponse.json({
      success: true,
      sessionEstablished,
      emailSent,
      checkEmail: !sessionEstablished,
      message: sessionEstablished
        ? 'Account created! Welcome to Likkle Legends.'
        : emailSent
          ? 'Account created. Check your email to enter the islands.'
          : 'Account created. Please log in to continue.',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Free Trial API]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
