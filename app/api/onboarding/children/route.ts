import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';

type ChildPayload = {
  first_name?: string;
  age?: number;
  age_track?: 'mini' | 'big';
  primary_island?: string;
  secondary_island?: string;
  avatar_id?: string;
};

function normalizeChildName<T extends Record<string, any>>(child: T): T & { first_name: string } {
  return {
    ...child,
    first_name: child.first_name || child.full_name || child.name || child.child_name || '',
  };
}

async function insertChild(userId: string, payload: Required<Pick<ChildPayload, 'first_name' | 'age' | 'age_track' | 'primary_island' | 'avatar_id'>> & Pick<ChildPayload, 'secondary_island'>) {
  const basePayload = {
    parent_id: userId,
    age: payload.age,
    age_track: payload.age_track,
    primary_island: payload.primary_island,
    secondary_island: payload.secondary_island || null,
    avatar_id: payload.avatar_id,
  };

  let result = await supabaseAdmin
    .from('children')
    .insert({
      ...basePayload,
      first_name: payload.first_name,
    })
    .select()
    .single();

  if (result.error?.message?.includes("Could not find the 'first_name' column")) {
    result = await supabaseAdmin
      .from('children')
      .insert({
        ...basePayload,
        full_name: payload.first_name,
      })
      .select()
      .single();
  }

  if (result.error?.message?.includes("Could not find the 'full_name' column")) {
    result = await supabaseAdmin
      .from('children')
      .insert({
        parent_id: userId,
        name: payload.first_name,
        age: payload.age,
        age_track: payload.age_track,
        island: payload.primary_island,
        avatar_id: payload.avatar_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  if (result.error) throw result.error;
  return normalizeChildName(result.data as Record<string, any>);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Please log in again to finish onboarding.' }, { status: 401 });
  }

  let body: ChildPayload;
  try {
    body = await request.json();
  } catch (_e) {
    return NextResponse.json({ error: 'Invalid child profile data.' }, { status: 400 });
  }

  const firstName = body.first_name?.trim();
  if (!firstName || firstName.length < 2) {
    return NextResponse.json({ error: "Child's name is required." }, { status: 400 });
  }

  const age = Math.min(9, Math.max(3, Number(body.age) || 5));
  const ageTrack = body.age_track || (age < 6 ? 'mini' : 'big');
  const primaryIsland = body.primary_island?.trim() || 'mixed';
  const avatarId = body.avatar_id?.trim() || 'lion';

  try {
    const child = await insertChild(user.id, {
      first_name: firstName,
      age,
      age_track: ageTrack,
      primary_island: primaryIsland,
      secondary_island: body.secondary_island,
      avatar_id: avatarId,
    });

    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || `Parent of ${firstName}`,
        role: 'parent',
        subscription_tier: user.user_metadata?.chosen_plan || 'free',
        subscription_status: 'active',
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    return NextResponse.json({ success: true, child });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save child profile.';
    console.error('[Onboarding Child API]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
