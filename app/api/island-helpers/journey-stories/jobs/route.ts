import { NextResponse } from 'next/server';
import { enqueueJourneyArt, normalizeStoryId } from '@/lib/island-helpers/journey-stories/job-store';
import { publishJourneyJob } from '@/lib/island-helpers/journey-stories/qstash';
import { applyJourneySafety } from '@/lib/island-helpers/journey-stories/safety';
import { JOURNEY_PAGE_ROLES, type JourneyPage, type JourneyPageRole } from '@/lib/island-helpers/journey-stories/types';
import { ISLAND_HELPERS_CHARACTER_IDS, type IslandHelpersCharacterId } from '@/lib/island-helpers/types';

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

  const rawPages = Array.isArray(body.pages) ? body.pages : [];
  if (rawPages.length !== 5) {
    return NextResponse.json({ ok: false, error: 'Need 5 pages before pictures' }, { status: 400 });
  }

  const pages: JourneyPage[] = rawPages.map((page: any, index: number) => ({
    role: JOURNEY_PAGE_ROLES[index] as JourneyPageRole,
    title: page?.title ? String(page.title) : undefined,
    text: String(page?.text || ''),
    imageUrl: page?.imageUrl ? String(page.imageUrl) : null,
    coachingLineCount: 0,
  }));
  const safety = applyJourneySafety(pages);
  if (!safety.ok) {
    return NextResponse.json({ ok: false, error: 'Safety filter blocked pictures', reasons: safety.reasons }, { status: 400 });
  }

  const cast = Array.isArray(body.castCharacterIds)
    ? body.castCharacterIds.filter((id: string) =>
        ISLAND_HELPERS_CHARACTER_IDS.includes(id as IslandHelpersCharacterId),
      )
    : [];

  const pageIndex = typeof body.pageIndex === 'number' ? body.pageIndex : null;
  const result = await enqueueJourneyArt({
    storyId: normalizeStoryId(body.storyId) || undefined,
    scenarioId: String(body.scenarioId || 'custom'),
    scenarioLabel: String(body.scenarioLabel || 'Journey Story'),
    languageMode: body.languageMode === 'literal' ? 'literal' : 'standard',
    pointOfView: body.pointOfView === 'first' ? 'first' : 'third',
    castCharacterIds: cast,
    pages: safety.pages.map((page, index) => ({
      ...page,
      imageUrl: pages[index]?.imageUrl || null,
    })),
    pageIndex,
  });

  if (!result.ok) {
    return NextResponse.json({ ...result, qstash: 'skipped' }, { status: 200 });
  }

  if (!result.queued || !result.jobId) {
    return NextResponse.json({ ...result, qstash: 'skipped' });
  }

  const published = await publishJourneyJob({
    storyId: result.storyId,
    jobId: result.jobId,
    pageIndex,
  });
  return NextResponse.json({
    ...result,
    qstash: published.reason,
  });
}
