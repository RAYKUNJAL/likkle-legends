import { NextRequest, NextResponse } from 'next/server';
import { getAgents, getRunStats, getPendingApprovals } from '@/lib/agent-os/db';

export async function GET(_req: NextRequest) {
  try {
    const [agents, stats, pendingApprovals] = await Promise.all([
      getAgents(),
      getRunStats(),
      getPendingApprovals(),
    ]);

    const pendingByAgent: Record<string, number> = {};
    for (const a of pendingApprovals) {
      const task_id = a.task_id;
      // Count per requesting agent
      pendingByAgent[a.requested_by] = (pendingByAgent[a.requested_by] || 0) + 1;
    }

    const enriched = agents.map(agent => ({
      ...agent,
      run_count:        stats.by_agent[agent.key] || 0,
      pending_approvals: pendingByAgent[agent.key] || 0,
    }));

    return NextResponse.json({
      success: true,
      agents: enriched,
      stats: {
        total_runs:    stats.total,
        success_runs:  stats.success,
        failed_runs:   stats.failed,
        pending_approvals: pendingApprovals.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
