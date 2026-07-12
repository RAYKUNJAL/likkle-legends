/**
 * Shared admin authentication guard for API routes.
 *
 * Usage:
 *   import { requireAdmin } from '@/lib/api/require-admin';
 *
 *   export async function POST(req: NextRequest) {
 *     const auth = await requireAdmin(req);
 *     if (!auth.ok) return auth.response;
 *     // auth.userId is guaranteed to be an admin user
 *     ...
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

export interface AdminAuthSuccess {
  ok: true;
  userId: string;
}

export interface AdminAuthFailure {
  ok: false;
  response: NextResponse;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let userId: string | null = null;

  // Try Bearer token first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        userId = data.user.id;
      }
    } catch (_e) {
      // fall through to cookie auth
    }
  }

  // Fall back to cookie-based session
  if (!userId) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
      }
    } catch (_e) {
      // ignore
    }
  }

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Check admin role
  try {
    const { createAdminClient } = await import('@/lib/admin');
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', userId)
      .single();

    if (!(profile?.is_admin || profile?.role === 'admin')) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
      };
    }
  } catch (_e) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authorization check failed' }, { status: 500 }),
    };
  }

  return { ok: true, userId };
}
