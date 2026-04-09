import { NextRequest, NextResponse } from 'next/server';
import { decideApproval, logActivity } from '@/lib/agent-os/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; decision: string }> }
) {
  try {
    const { id, decision } = await params;
    if (!['approved', 'denied'].includes(decision)) {
      return NextResponse.json({ error: 'Decision must be approved or denied' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({})) as { rationale?: string };
    await decideApproval(id, decision as 'approved' | 'denied', 'admin', body.rationale);
    await logActivity({
      agent_key: 'admin', task_type: 'approval_decision', subject: id,
      action_summary: `Approval ${id} ${decision} by admin`,
      outcome: decision, severity: 'info', requires_attention: false,
      linked_task_id: null, linked_run_id: null, linked_artifact_id: null,
      linked_user_id: null, linked_campaign_id: null,
      meta: { decision, rationale: body.rationale || null },
    });
    return NextResponse.json({ success: true, decision });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
