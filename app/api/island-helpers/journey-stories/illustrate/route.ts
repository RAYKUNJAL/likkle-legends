import { NextResponse } from 'next/server';
import { illustrateJourneyPages } from '@/lib/island-helpers/journey-stories/illustrate';
import type { JourneyStoryDraft } from '@/lib/island-helpers/journey-stories/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adultGateOk(req: Request): boolean {
  const header = req.headers.get('x-island-helpers-adult');
  return header === '1' || header === 'verified';
}

export async function POST(req: Request) {
  if (!adultGateOk(req)) {
    return NextResponse.json({ ok: false, error: 'Adult gate required' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const draft = body.draft as JourneyStoryDraft;
  if (!draft?.pages) {
    return NextResponse.json({ ok: false, error: 'draft required' }, { status: 400 });
  }

  // One page per request. A full-story image burst will blow a short serverless timeout.
  if (typeof body.pageIndex !== 'number' || body.pageIndex < 0 || body.pageIndex > 4) {
    return NextResponse.json(
      { ok: false, error: 'Send one pageIndex. One request illustrates one page.' },
      { status: 400 },
    );
  }

  const result = await illustrateJourneyPages(draft, {
    pageIndex: body.pageIndex,
    allowPlaceholders: body.allowPlaceholders !== false,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
