/**
 * Adult request for a Journey Story.
 * Inserts a pending row for the on-VPS worker and returns the id immediately.
 * Art on hold, or no database, keeps the synchronous text path. No external queue.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { journeyArtOnHold } from '@/lib/island-helpers/journey-stories/art-hold';
import {
  blankStoryPages,
  planStoryStart,
  storyLibraryKey,
  type StoryJobRequest,
} from '@/lib/island-helpers/journey-stories/advance-story';
import { newStoryId } from '@/lib/island-helpers/journey-stories/job-store';
import { parseJourneyLanguageMode } from '@/lib/island-helpers/journey-stories/generate';
import { JOURNEY_PAGE_ROLES } from '@/lib/island-helpers/journey-stories/types';
import { ISLAND_HELPERS_CHARACTER_IDS, type IslandHelpersCharacterId } from '@/lib/island-helpers/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adultGateOk(req: Request): boolean {
  const header = req.headers.get('x-island-helpers-adult');
  return header === '1' || header === 'verified';
}

function admin() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
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

  const languageMode = parseJourneyLanguageMode(body.languageMode);
  if (!languageMode) {
    return NextResponse.json({ ok: false, error: 'languageMode must be standard or literal' }, { status: 400 });
  }

  const scenarioId = String(body.scenarioId || 'custom');
  const customScenario = body.customScenario ? String(body.customScenario) : undefined;
  if (scenarioId === 'custom' && !(customScenario || '').trim()) {
    return NextResponse.json({ ok: false, error: 'Describe your custom adventure' }, { status: 400 });
  }

  const cast = (Array.isArray(body.castCharacterIds) ? body.castCharacterIds : []).filter((id: string) =>
    ISLAND_HELPERS_CHARACTER_IDS.includes(id as IslandHelpersCharacterId),
  );
  const request: StoryJobRequest = {
    scenarioId,
    scenarioLabel: body.scenarioLabel ? String(body.scenarioLabel) : undefined,
    customScenario,
    childName: body.childName ? String(body.childName) : undefined,
    pointOfView: body.pointOfView === 'first' ? 'first' : 'third',
    languageMode,
    castCharacterIds: cast,
  };

  const client = admin();
  if (!client) {
    return NextResponse.json({ ok: true, queued: false, fallback: 'sync', status: 'pending', worker: 'vps' });
  }

  const libraryKey = storyLibraryKey(request);
  const { data: published } = await client
    .from('journey_stories')
    .select('id, scenario_label')
    .eq('library_key', libraryKey)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle();

  let reusablePages: {
    pageIndex: number;
    role: string;
    title: string | null;
    text: string;
    imageUrl: string | null;
    imageStatus: string;
  }[] = [];
  if (published?.id) {
    const { data: pageRows } = await client
      .from('journey_story_pages')
      .select('page_index, role, title, body, image_url, image_status')
      .eq('story_id', published.id)
      .order('page_index');
    reusablePages = (pageRows || []).map((row) => ({
      pageIndex: Number(row.page_index),
      role: String(row.role || JOURNEY_PAGE_ROLES[Number(row.page_index)] || 'intro'),
      title: row.title ? String(row.title) : null,
      text: String(row.body || ''),
      imageUrl: row.image_url ? String(row.image_url) : null,
      imageStatus: String(row.image_status || 'pending'),
    }));
  }
  const reusable = reusablePages.length === 5 && reusablePages.every((page) => page.text.trim());
  const artHold = journeyArtOnHold();
  const plan = planStoryStart({ canQueue: !artHold, reusable });

  if (plan === 'reuse' && published?.id) {
    return NextResponse.json({
      ok: true,
      queued: false,
      status: 'reused',
      storyId: published.id,
      scenarioLabel: published.scenario_label || request.scenarioLabel || 'Journey Story',
      pages: reusablePages,
    });
  }

  if (plan === 'sync') {
    return NextResponse.json({
      ok: true,
      queued: false,
      fallback: 'sync',
      status: 'pending',
      art: artHold ? 'hold' : 'live',
    });
  }

  const storyId = newStoryId();
  const now = new Date().toISOString();
  const { error: storyError } = await client.from('journey_stories').insert({
    id: storyId,
    status: 'draft',
    scenario_id: request.scenarioId,
    scenario_label: (request.scenarioLabel || request.customScenario || 'Journey Story').slice(0, 160),
    language_mode: request.languageMode,
    point_of_view: request.pointOfView,
    cast_character_ids: request.castCharacterIds,
    library_key: libraryKey,
    updated_at: now,
  });
  if (storyError) {
    return NextResponse.json({ ok: true, queued: false, fallback: 'sync', status: 'pending' });
  }

  const { error: pageError } = await client.from('journey_story_pages').insert(blankStoryPages(storyId));
  if (pageError) {
    return NextResponse.json({ ok: true, queued: false, fallback: 'sync', status: 'pending', storyId });
  }

  const { data: jobRow, error: jobError } = await client
    .from('journey_story_jobs')
    .insert({
      story_id: storyId,
      page_index: null,
      status: 'queued',
      phase: 'generating_text',
      request,
    })
    .select('id')
    .single();
  if (jobError || !jobRow?.id) {
    return NextResponse.json({ ok: true, queued: false, fallback: 'sync', status: 'pending', storyId });
  }

  return NextResponse.json({
    ok: true,
    queued: true,
    status: 'pending',
    storyId,
    jobId: String(jobRow.id),
    worker: 'vps',
    art: 'live',
  });
}
