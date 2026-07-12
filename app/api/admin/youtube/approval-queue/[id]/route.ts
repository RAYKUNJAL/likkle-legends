import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api/require-admin';
import { updateApprovalItem } from '@/lib/youtube/approval-store';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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
