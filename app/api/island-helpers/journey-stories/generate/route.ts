import { NextResponse } from 'next/server';
import { generateJourneyStory } from '@/lib/island-helpers/journey-stories/generate';
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

  const cast = Array.isArray(body.castCharacterIds)
    ? (body.castCharacterIds.filter((id: string) =>
        ISLAND_HELPERS_CHARACTER_IDS.includes(id as IslandHelpersCharacterId),
      ) as IslandHelpersCharacterId[])
    : [];

  const result = await generateJourneyStory({
    scenarioId: body.scenarioId || 'custom',
    customScenario: body.customScenario,
    childName: body.childName,
    pointOfView: body.pointOfView === 'first' ? 'first' : 'third',
    castCharacterIds: cast,
  });

  if (!result.ok) {
    const status = /unavailable|missing AI key/i.test(result.error) ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  // Never published here
  if (result.draft.status === 'published') {
    return NextResponse.json({ ok: false, error: 'Invalid generator state' }, { status: 500 });
  }

  return NextResponse.json(result);
}
