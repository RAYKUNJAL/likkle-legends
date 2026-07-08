import { NextRequest, NextResponse } from 'next/server';
import { getPendingApprovals, decideApproval } from '@/lib/agent-os/db';

export async function GET(_req: NextRequest) {
  try {
    const approvals = await getPendingApprovals();
    return NextResponse.json({ success: true, approvals, total: approvals.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
