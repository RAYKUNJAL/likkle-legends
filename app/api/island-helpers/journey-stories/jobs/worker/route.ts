/**
 * Closed. Journey Stories pictures run in the compose journey-worker.
 * This URL does not generate text or images.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'Journey Stories pictures run on the VPS worker.' },
    { status: 410 },
  );
}
