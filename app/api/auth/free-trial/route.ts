import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/free-trial
 *
 * Creates a free account from the /free-trial landing page.
 * Fires the Meta Conversions API Lead event server-side.
 * Triggers the nurture email sequence.
 */
export async function POST(req: NextRequest) {
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

    // ── 1. Create auth user ────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,   // Auto-confirm — skip email verification friction
      user_metadata: {
        full_name: parentName || '',
        source: source || 'free_trial_page',
        ad_character: adCharacter || '',
      },
    });

    if (authError) {
      // User already exists — let them know to log in
      if (authError.message?.includes('already') || authError.status === 422) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        );
      }
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error('User creation failed — no ID returned');

    // ── 2. Create profile row ──────────────────────────────────────────────
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: parentName || '',
      subscription_status: 'free',
      subscription_tier: 'free_explorer',
      island_heritage: island || '',
      signup_source: source || 'free_trial_page',
      created_at: new Date().toISOString(),
    });

    // ── 3. Create first child profile ─────────────────────────────────────
    if (childName) {
      await supabase.from('children').insert({
        parent_id: userId,
        name: childName,
        island: island || '',
        created_at: new Date().toISOString(),
      });
    }

    // ── 4. Record lead in leads table ──────────────────────────────────────
    await supabase.from('leads').insert({
      email,
      name: parentName || '',
      source: source || 'free_trial_page',
      status: 'free_signup',
      island: island || '',
      created_at: new Date().toISOString(),
    }).select().single();   // Best effort — ignore if table doesn't exist

    // ── 5. Fire Meta Conversions API (server-side Lead event) ─────────────
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
      }).catch(() => {}); // Fire and forget — don't block response
    }

    // ── 6. Trigger nurture welcome sequence ────────────────────────────────
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
    }).catch(() => {}); // Fire and forget

    // ── 7. Sign in the user ────────────────────────────────────────────────
    // Generate a magic link so they land on the portal without needing a password
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/portal` },
    });

    return NextResponse.json({
      success: true,
      userId,
      magicLink: linkData?.properties?.action_link || null,
      message: 'Account created! Welcome to Likkle Legends.',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Free Trial API]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
