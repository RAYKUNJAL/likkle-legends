import { NextRequest, NextResponse } from 'next/server';
import { getTasksByStatus, createTask } from '@/lib/agent-os/db';

export async function GET(_req: NextRequest) {
  try {
    const all = await getTasksByStatus(['queued','running','blocked','awaiting_approval','done','failed']);
    const board = {
      queued:            all.filter(t => t.status === 'queued'),
      running:           all.filter(t => t.status === 'running'),
      awaiting_approval: all.filter(t => t.status === 'awaiting_approval'),
      blocked:           all.filter(t => t.status === 'blocked'),
      done:              all.filter(t => t.status === 'done').slice(0, 20),
      failed:            all.filter(t => t.status === 'failed'),
    };
    return NextResponse.json({ success: true, board, total: all.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
