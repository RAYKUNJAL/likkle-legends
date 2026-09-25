/**
 * One step of a queued Journey Story: write the pages, or draw the next picture.
 * A single callback never draws every page. The next step is queued for QStash.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IslandHelpersCharacterId } from '../types';
import { generateJourneyStory } from './generate';
import { executeClaimedJourneyJob } from './execute-job';
import { isUsableHostedImage } from './jobs';
import { journeyLibraryKey } from './library-key';
import { JOURNEY_PAGE_ROLES, type JourneyLanguageMode, type JourneyPageRole } from './types';

export type StoryJobRequest = {
  scenarioId: string;
  scenarioLabel?: string;
  customScenario?: string;
  childName?: string;
  pointOfView: 'first' | 'third';
  languageMode: JourneyLanguageMode;
  castCharacterIds: string[];
};

export type StoryPageSnapshot = {
  text?: string;
  imageUrl?: string | null;
  imageStatus?: string;
};

/** What the next callback should do. Failed pictures are left as they are. */
export function nextStoryStep(pages: StoryPageSnapshot[]): 'narrative' | number | 'ready' {
  if (pages.length < 5 || pages.some((page) => !(page.text || '').trim())) return 'narrative';
  const pending = pages.findIndex(
    (page) =>
      page.imageStatus !== 'ready' &&
      page.imageStatus !== 'reused' &&
      page.imageStatus !== 'failed' &&
      !isUsableHostedImage(page.imageUrl),
  );
  if (pending >= 0) return pending;
  return 'ready';
}

export function storyFinishedPhase(pages: StoryPageSnapshot[]): 'ready' | 'failed' {
  return pages.some((page) => page.imageStatus === 'failed') ? 'failed' : 'ready';
}

/** Primary path queues. No queue key keeps the synchronous page-by-page path. */
export function planStoryStart(input: { hasQStash: boolean; reusable: boolean }): 'reuse' | 'queue' | 'sync' {
  if (input.reusable) return 'reuse';
  if (input.hasQStash) return 'queue';
  return 'sync';
}

export function storyLibraryKey(request: StoryJobRequest): string {
  return journeyLibraryKey({
    scenarioId: request.scenarioId,
    scenarioLabel: request.scenarioLabel,
    languageMode: request.languageMode,
    castCharacterIds: request.castCharacterIds,
  });
}

type ClaimedStoryJob = {
  id: string;
  story_id: string;
  page_index: number | null;
  request?: StoryJobRequest | null;
};

export async function runClaimedStoryStep(
  supabase: SupabaseClient,
  job: ClaimedStoryJob,
): Promise<{ ok: boolean; retry: boolean; error: string | null; publishPage: number | null }> {
  const storyId = String(job.story_id);
  const request = job.request || null;

  const { data: pageRows } = await supabase
    .from('journey_story_pages')
    .select('page_index, role, title, body, image_url, image_status')
    .eq('story_id', storyId)
    .order('page_index');

  let pages: StoryPageSnapshot[] = (pageRows || []).map((row) => ({
    text: String(row.body || ''),
    imageUrl: row.image_url ? String(row.image_url) : null,
    imageStatus: String(row.image_status || 'pending'),
  }));

  const step = nextStoryStep(pages);
  let wroteNarrative = false;
  if (step === 'narrative') {
    if (!request) {
      await finishStoryJob(supabase, job.id, 'failed', 'Story request missing.');
      return { ok: false, retry: false, error: 'Story request missing.', publishPage: null };
    }
    const written = await generateJourneyStory({
      scenarioId: request.scenarioId,
      customScenario: request.customScenario,
      childName: request.childName,
      pointOfView: request.pointOfView,
      castCharacterIds: request.castCharacterIds as IslandHelpersCharacterId[],
      languageMode: request.languageMode,
    });
    if (!written.ok || !written.draft) {
      const error = written.ok ? 'Story writing failed.' : written.error;
      const retry = !/safety|missing AI key|unavailable/i.test(error);
      await finishStoryJob(supabase, job.id, 'failed', error);
      return { ok: false, retry, error, publishPage: null };
    }
    const now = new Date().toISOString();
    const rows = written.draft.pages.map((page, pageIndex) => ({
      story_id: storyId,
      page_index: pageIndex,
      role: JOURNEY_PAGE_ROLES[pageIndex] || page.role,
      title: page.title || null,
      body: page.text,
      image_url: null,
      image_status: 'pending',
      updated_at: now,
    }));
    const { error: pageError } = await supabase.from('journey_story_pages').upsert(rows, {
      onConflict: 'story_id,page_index',
    });
    if (pageError) {
      await finishStoryJob(supabase, job.id, 'failed', 'The words could not be saved.');
      return { ok: false, retry: true, error: 'The words could not be saved.', publishPage: null };
    }
    pages = written.draft.pages.map((page) => ({
      text: page.text,
      imageUrl: null,
      imageStatus: 'pending',
    }));
    await supabase
      .from('journey_stories')
      .update({ status: 'draft', updated_at: now })
      .eq('id', storyId);
    wroteNarrative = true;
  }

  if (wroteNarrative) {
    await supabase
      .from('journey_story_jobs')
      .update({
        status: 'queued',
        phase: 'illustrating',
        page_index: 0,
        finished_at: null,
        last_error: null,
      })
      .eq('id', job.id);
    return { ok: true, retry: false, error: null, publishPage: 0 };
  }

  const picture = nextStoryStep(pages);
  if (picture === 'narrative') {
    await finishStoryJob(supabase, job.id, 'failed', 'The words could not be saved.');
    return { ok: false, retry: true, error: 'The words could not be saved.', publishPage: null };
  }
  if (picture === 'ready') {
    const phase = storyFinishedPhase(pages);
    await finishStoryJob(supabase, job.id, phase, phase === 'failed' ? 'A picture could not be made.' : null);
    return { ok: phase === 'ready', retry: false, error: null, publishPage: null };
  }

  const drawn = await executeClaimedJourneyJob(
    supabase,
    { id: job.id, story_id: storyId, page_index: picture },
    { pageIndex: picture, finish: false },
  );
  if (!drawn.ok) {
    await finishStoryJob(supabase, job.id, 'failed', drawn.error);
    return { ok: false, retry: true, error: drawn.error, publishPage: null };
  }

  pages = pages.map((page, index) => (index === picture ? { ...page, imageStatus: 'ready' } : page));
  const following = nextStoryStep(pages);
  if (following === 'ready' || following === 'narrative') {
    const phase = storyFinishedPhase(pages);
    await finishStoryJob(supabase, job.id, phase, null);
    return { ok: true, retry: false, error: null, publishPage: null };
  }

  await supabase
    .from('journey_story_jobs')
    .update({
      status: 'queued',
      phase: 'illustrating',
      page_index: following,
      finished_at: null,
      last_error: null,
    })
    .eq('id', job.id);

  return { ok: true, retry: false, error: null, publishPage: following };
}

async function finishStoryJob(
  supabase: SupabaseClient,
  jobId: string,
  phase: 'ready' | 'failed',
  error: string | null,
) {
  await supabase
    .from('journey_story_jobs')
    .update({
      status: phase === 'ready' ? 'done' : 'failed',
      phase,
      last_error: error,
      finished_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

export function blankStoryPages(storyId: string): {
  story_id: string;
  page_index: number;
  role: JourneyPageRole;
  title: null;
  body: string;
  image_url: null;
  image_status: 'pending';
}[] {
  return JOURNEY_PAGE_ROLES.map((role, pageIndex) => ({
    story_id: storyId,
    page_index: pageIndex,
    role,
    title: null,
    body: '',
    image_url: null,
    image_status: 'pending' as const,
  }));
}
