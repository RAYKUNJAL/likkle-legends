import { NextRequest, NextResponse } from 'next/server';
import { getActivityLog } from '@/lib/agent-os/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit    = Math.min(parseInt(searchParams.get('limit')  || '100'), 200);
    const agentKey = searchParams.get('agent_key') || undefined;
    const logs = await getActivityLog(limit, agentKey);
    return NextResponse.json({ success: true, logs, total: logs.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
