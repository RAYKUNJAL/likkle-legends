import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env/server';
import type { User } from '@supabase/supabase-js';

export async function requireSupabaseToken(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    throw NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
  }

  const supabase = createServerClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      // Use service role key because we only need to validate the JWT.
    }
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw NextResponse.json({ error: 'Unauthorized', details: error?.message }, { status: 401 });
  }

  return data.user;
}
