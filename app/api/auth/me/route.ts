import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Cookie-session bridge for the browser app.
 * Middleware/server actions store the Supabase session in HTTP cookies.
 * The browser GoTrue client often cannot read those cookies (httpOnly /
 * path-style self-host), so UserContext calls this endpoint with
 * credentials: 'same-origin' and hydrates profile state from the server.
 */
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { authenticated: false, user: null, profile: null, children: [] },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Prefer profiles; fall back to service-role profile / metadata so portal never stays empty
    let profile: Record<string, any> | null = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }

    if (!profile) {
      try {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        profile = data;
      } catch {
        profile = null;
      }
    }

    const meta = user.user_metadata || {};
    const normalized = {
      id: user.id,
      email: user.email || profile?.email || '',
      full_name: profile?.full_name || meta.full_name || 'Legend Parent',
      parent_name: profile?.parent_name || meta.full_name || 'Parent',
      role: profile?.role || meta.role || 'parent',
      is_admin: profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'super_admin',
      subscription_tier: profile?.subscription_tier || meta.chosen_plan || 'free',
      subscription_status: profile?.subscription_status || 'inactive',
      country_code: profile?.country_code || 'US',
      currency: profile?.currency || 'USD',
      has_grandparent_dashboard: !!profile?.has_grandparent_dashboard,
      has_heritage_dna_story: !!profile?.has_heritage_dna_story,
      onboarding_completed: !!profile?.onboarding_completed,
      origin_island: profile?.origin_island || meta.island_heritage || 'mixed',
      whatsapp_number: profile?.whatsapp_number || '',
      created_at: profile?.created_at || user.created_at,
    };

    // Children ownership: live schema may use parent_id OR primary_user_id
    let children: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('children')
        .select('*')
        .or(`parent_id.eq.${user.id},primary_user_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      children = data || [];
    } catch {
      children = [];
    }

    // Self-heal: create a default child so the portal never dead-ends for paid parents
    if (children.length === 0) {
      const childName =
        meta.child_name ||
        (typeof meta.full_name === 'string' && meta.full_name.includes("'s")
          ? meta.full_name
          : 'My Legend');
      const age = Math.min(9, Math.max(3, Number(meta.child_age) || 5));
      const island = meta.island_heritage || profile?.origin_island || 'mixed';
      try {
        const base = {
          parent_id: user.id,
          primary_user_id: user.id,
          age,
          age_track: age < 6 ? 'mini' : 'big',
          avatar_id: 'lion',
          primary_island: island,
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
        };
        let inserted = await supabaseAdmin
          .from('children')
          .insert({ ...base, first_name: childName || 'My Legend', name: childName || 'My Legend' })
          .select('*')
          .single();
        if (inserted.error) {
          // retry minimal columns
          inserted = await supabaseAdmin
            .from('children')
            .insert({
              parent_id: user.id,
              name: childName || 'My Legend',
              age,
              primary_island: island,
              avatar_id: 'lion',
            })
            .select('*')
            .single();
        }
        if (inserted.data) children = [inserted.data];
      } catch (e) {
        console.warn('[auth/me] child self-heal failed', e);
      }
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
        profile: normalized,
        children,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    console.error('[auth/me]', err);
    return NextResponse.json(
      { authenticated: false, error: err?.message || 'auth_me_failed' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
