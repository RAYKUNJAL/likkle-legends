import { NextResponse } from 'next/server';
import { readJourneyArt } from '@/lib/island-helpers/journey-stories/job-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adultGateOk(req: Request): boolean {
  const header = req.headers.get('x-island-helpers-adult');
  return header === '1' || header === 'verified';
}

export async function GET(req: Request, context: { params: { storyId: string } }) {
  if (!adultGateOk(req)) {
    return NextResponse.json({ ok: false, error: 'Adult gate required' }, { status: 403 });
  }
  const result = await readJourneyArt(context.params.storyId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
