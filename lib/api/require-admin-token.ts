import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseToken } from './require-supabase-token';
import { createAdminClient } from '@/lib/admin';
import type { User } from '@supabase/supabase-js';

export interface AdminValidationResult {
  user: User;
  isAdmin: boolean;
}

/**
 * Validates that a request has a valid Supabase token AND the user has admin role.
 * Throws NextResponse with 401 if token invalid, 403 if not admin.
 * Returns the validated user and admin status.
 */
export async function requireAdminToken(request: NextRequest): Promise<AdminValidationResult> {
  // First validate the token
  const user = await requireSupabaseToken(request);

  // Then check admin role
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.is_admin || profile?.role === 'admin';

  if (!isAdmin) {
    throw NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return {
    user,
    isAdmin: true
  };
}
