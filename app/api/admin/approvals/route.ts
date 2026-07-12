import { NextRequest, NextResponse } from 'next/server';
import { getPendingApprovals, decideApproval } from '@/lib/agent-os/db';

export async function GET(_req: NextRequest) {
  // ── Admin auth required ──
  const authHeader = _req.headers.get('authorization') || _req.headers.get('Authorization');
  let userId: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { supabaseAdmin } = await import('@/lib/supabase-client');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    userId = user?.id || null;
  }

  if (!userId) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { createAdminClient } = await import('@/lib/admin');
  const adminCheck = createAdminClient();
  const { data: profile } = await adminCheck
    .from('profiles')
    .select('role, is_admin')
    .eq('id', userId)
    .single();

  if (!(profile?.is_admin || profile?.role === 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const approvals = await getPendingApprovals();
    return NextResponse.json({ success: true, approvals, total: approvals.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
