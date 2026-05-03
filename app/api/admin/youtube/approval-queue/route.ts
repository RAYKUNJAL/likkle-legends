import { NextRequest, NextResponse } from 'next/server';
import { enqueueVideoPlan, listApprovalQueue } from '@/lib/youtube/approval-store';
import { createVideoPlan } from '@/lib/youtube/video-planner';

export const runtime = 'nodejs';

export async function GET() {
  const queue = await listApprovalQueue();
  return NextResponse.json({ ok: true, queue });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(body.count || 1), 1), 10);
    const items = [];

    for (let i = 0; i < count; i += 1) {
      const plan = await createVideoPlan({
        island: body.island,
        ageBand: body.ageBand,
        topic: Array.isArray(body.topics) ? body.topics[i % body.topics.length] : body.topic,
        musicAssetId: body.musicAssetId,
      });
      const item = await enqueueVideoPlan(plan, {
        channels: body.channels || ['youtube'],
        contentType: body.contentType || 'short_lesson',
        durationTarget: body.durationTarget || 'short',
        reviewNotes: body.reviewNotes,
      });
      items.push(item);
    }

    return NextResponse.json({ ok: true, queued: items.length, items });
  } catch (_e) {
    return NextResponse.json({ ok: false, error: 'Failed to queue video plans' }, { status: 500 });
  }
}
