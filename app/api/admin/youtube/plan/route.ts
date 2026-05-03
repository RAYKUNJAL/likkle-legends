import { NextRequest, NextResponse } from 'next/server';
import { createVideoPlan } from '@/lib/youtube/video-planner';
import { YOUTUBE_ASSETS } from '@/lib/youtube/video-types';

export async function GET() {
  return NextResponse.json({
    ok: true,
    assets: YOUTUBE_ASSETS,
    schedule: {
      cadence: 'twice_daily',
      recommendedTimes: ['09:00 America/New_York', '16:00 America/New_York'],
      approvalRequired: true,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = await createVideoPlan(body);
    return NextResponse.json({ ok: true, plan });
  } catch (_e) {
    return NextResponse.json({ ok: false, error: 'Failed to create video plan' }, { status: 500 });
  }
}
