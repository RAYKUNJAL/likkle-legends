import { NextRequest, NextResponse } from 'next/server';
import { updateApprovalItem } from '@/lib/youtube/approval-store';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const item = await updateApprovalItem(params.id, body);
    if (!item) {
      return NextResponse.json({ ok: false, error: 'Queue item not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (_e) {
    return NextResponse.json({ ok: false, error: 'Failed to update queue item' }, { status: 500 });
  }
}
