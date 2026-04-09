import { NextRequest, NextResponse } from 'next/server';
import { getAgentByKey, executeAgentAction } from '@/lib/agent-os/db';
import { getBaseUrl } from '@/lib/utils/base-url';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const agent = await getAgentByKey(key);
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    if (agent.status === 'needs_setup') {
      return NextResponse.json({ error: `${agent.name} needs setup before it can run` }, { status: 400 });
    }

    const body = await req.json().catch(() => ({})) as { params?: Record<string, unknown> };
    const base = getBaseUrl();

    const ROUTE_MAP: Record<string, string> = {
      'island-brain': '/api/cron/content-generation',
      'story-agent':  '/api/cron/content-generation',
      'blog-agent':   '/api/admin/blog/generate',
      'social-agent': '/api/admin/social/generate',
      'ad-copy-agent':'/api/admin/ads/generate',
      'email-nurture':'/api/cron/nurture',
    };

    const result = await executeAgentAction({
      agentKey:      agent.key,
      agentName:     agent.name,
      taskType:      `manual_trigger.${agent.key}`,
      subject:       'manual trigger by admin',
      triggerSource: 'admin_dashboard',
      input:         { triggered_by: 'admin', ...(body.params || {}) },
      execute: async (runId, taskId) => {
        const endpoint = ROUTE_MAP[agent.key];
        if (!endpoint) {
          return {
            summary: `${agent.name} acknowledged — no execution endpoint configured yet`,
            output: { acknowledged: true, run_id: runId, task_id: taskId },
          };
        }
        const res = await fetch(`${base}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
            'x-triggered-by': 'manual',
          },
          body: JSON.stringify(body.params || {}),
        });
        const data = await res.json().catch(() => ({ triggered: true }));
        return {
          summary: `${agent.name} completed successfully`,
          output: data,
        };
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
