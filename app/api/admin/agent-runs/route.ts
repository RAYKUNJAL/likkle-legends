import { NextRequest, NextResponse } from 'next/server';
import { getRecentRuns, getRunStats } from '@/lib/agent-os/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const [runs, stats] = await Promise.all([getRecentRuns(limit), getRunStats()]);
    return NextResponse.json({ success: true, runs, stats, total: stats.total });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
