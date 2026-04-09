import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit  = parseInt(searchParams.get('limit')  || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const agent_id = searchParams.get('agent_id');

    const admin = createAdminClient();
    let query = admin
      .from('agent_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (agent_id) query = query.eq('agent_id', agent_id);

    const { data, error, count } = await query;
    if (error) throw error;

    // Also pull summary stats
    const { data: stats } = await admin.rpc('agent_log_stats').maybeSingle().catch(() => ({ data: null }));

    return NextResponse.json({
      success: true,
      logs: data || [],
      total: count || 0,
      offset,
      limit,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
