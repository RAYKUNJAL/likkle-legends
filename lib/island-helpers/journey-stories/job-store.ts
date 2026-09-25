/**
 * Persist Journey Stories text + picture jobs in Supabase.
 * Returns as soon as the row is queued. Does not call Imagen.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { hasGeminiImageKey } from './imagen';
import { journeyLibraryKey, mergePublishedImages } from './library-key';
import { JOURNEY_ART_CALM_COPY, isUsableHostedImage, planIllustrationWork, type EnqueuePlan } from './jobs';
import type { JourneyImageStatus, JourneyLanguageMode, JourneyPage } from './types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type EnqueueJourneyArtInput = {
  storyId?: string;
  scenarioId: string;
  scenarioLabel: string;
  languageMode: JourneyLanguageMode;
  pointOfView: 'first' | 'third';
  castCharacterIds: string[];
  pages: JourneyPage[];
  pageIndex?: number | null;
};

export type EnqueueJourneyArtResult = {
  ok: true;
  storyId: string;
  queued: boolean;
  jobId: string | null;
  status: 'queued' | 'pending' | 'reused';
  message: string | null;
  pages: { pageIndex: number; imageUrl: string | null; imageStatus: JourneyImageStatus }[];
};

function adminClient(): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function newStoryId(): string {
  return crypto.randomUUID();
}

export function normalizeStoryId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return UUID_RE.test(value) ? value : null;
}

async function publishedImagesForKey(
  client: SupabaseClient,
  libraryKey: string,
  exceptStoryId: string,
): Promise<{ pageIndex: number; imageUrl: string | null }[]> {
  const found: { pageIndex: number; imageUrl: string | null }[] = [];
  const { data: stories, error } = await client
    .from('journey_stories')
    .select('id')
    .eq('library_key', libraryKey)
    .eq('status', 'published')
    .neq('id', exceptStoryId)
    .limit(5);
  if (error || !stories?.length) return found;

  for (const story of stories) {
    const { data: pageRows } = await client
      .from('journey_story_pages')
      .select('page_index, image_url')
      .eq('story_id', story.id);
    for (const row of pageRows || []) {
      const imageUrl = row.image_url ? String(row.image_url) : null;
      if (!isUsableHostedImage(imageUrl)) continue;
      found.push({ pageIndex: Number(row.page_index), imageUrl });
    }
  }
  return found;
}

export async function enqueueJourneyArt(
  input: EnqueueJourneyArtInput,
  client: SupabaseClient | null = adminClient(),
): Promise<EnqueueJourneyArtResult | { ok: false; error: string; queued: false; message: string }> {
  const storyId = normalizeStoryId(input.storyId) || newStoryId();
  const libraryKey = journeyLibraryKey({
    scenarioId: input.scenarioId,
    scenarioLabel: input.scenarioLabel,
    languageMode: input.languageMode,
    castCharacterIds: input.castCharacterIds,
  });
  let pagesForPlan = input.pages;
  if (client) {
    try {
      const published = await publishedImagesForKey(client, libraryKey, storyId);
      pagesForPlan = mergePublishedImages(input.pages, published);
    } catch {
      pagesForPlan = input.pages;
    }
  }

  const plan: EnqueuePlan = planIllustrationWork({
    hasImagenKey: hasGeminiImageKey(),
    pageIndex: input.pageIndex,
    pages: pagesForPlan,
  });
  const pages = plan.pages.map((page) => ({
    pageIndex: page.pageIndex,
    imageUrl: page.imageUrl,
    imageStatus: page.imageStatus,
  }));

  if (!client) {
    return {
      ok: false,
      queued: false,
      error: JOURNEY_ART_CALM_COPY,
      message: JOURNEY_ART_CALM_COPY,
    };
  }

  const now = new Date().toISOString();
  const { error: storyError } = await client.from('journey_stories').upsert(
    {
      id: storyId,
      status: 'draft',
      scenario_id: input.scenarioId,
      scenario_label: input.scenarioLabel.slice(0, 160),
      language_mode: input.languageMode,
      point_of_view: input.pointOfView,
      cast_character_ids: input.castCharacterIds,
      library_key: libraryKey,
      updated_at: now,
    },
    { onConflict: 'id' },
  );
  if (storyError) {
    return { ok: false, queued: false, error: JOURNEY_ART_CALM_COPY, message: JOURNEY_ART_CALM_COPY };
  }

  const pageRows = input.pages.map((page, pageIndex) => {
    const row: Record<string, unknown> = {
      story_id: storyId,
      page_index: pageIndex,
      role: page.role,
      title: page.title || null,
      body: page.text,
      updated_at: now,
    };
    const touchesImage = typeof input.pageIndex !== 'number' || input.pageIndex === pageIndex;
    if (touchesImage) {
      const planned = plan.pages[pageIndex];
      row.image_url = planned?.imageUrl || null;
      row.image_status = planned?.imageStatus || 'pending';
      row.image_error = plan.queued ? null : plan.calmCopy;
    }
    return row;
  });
  const { error: pageError } = await client.from('journey_story_pages').upsert(pageRows, {
    onConflict: 'story_id,page_index',
  });
  if (pageError) {
    return { ok: false, queued: false, error: JOURNEY_ART_CALM_COPY, message: JOURNEY_ART_CALM_COPY };
  }

  if (!plan.queued || !plan.job) {
    const reused = pages.every((page) => page.imageStatus === 'reused' || page.imageStatus === 'ready');
    return {
      ok: true,
      storyId,
      queued: false,
      jobId: null,
      status: reused ? 'reused' : 'pending',
      message: plan.calmCopy,
      pages,
    };
  }

  const { data: jobRow, error: jobError } = await client
    .from('journey_story_jobs')
    .insert({
      story_id: storyId,
      page_index: plan.job.pageIndex,
      status: 'queued',
    })
    .select('id')
    .single();
  if (jobError || !jobRow?.id) {
    return { ok: false, queued: false, error: JOURNEY_ART_CALM_COPY, message: JOURNEY_ART_CALM_COPY };
  }

  return {
    ok: true,
    storyId,
    queued: true,
    jobId: String(jobRow.id),
    status: 'queued',
    message: null,
    pages,
  };
}

export async function readJourneyArt(
  storyId: string,
  client: SupabaseClient | null = adminClient(),
): Promise<
  | {
      ok: true;
      storyId: string;
      jobs: { id: string; status: string; pageIndex: number | null; lastError: string | null }[];
      pages: { pageIndex: number; imageUrl: string | null; imageStatus: JourneyImageStatus }[];
    }
  | { ok: false; error: string }
> {
  if (!normalizeStoryId(storyId)) return { ok: false, error: 'Unknown story' };
  if (!client) return { ok: false, error: JOURNEY_ART_CALM_COPY };

  const [{ data: pageRows, error: pageError }, { data: jobRows, error: jobError }] = await Promise.all([
    client
      .from('journey_story_pages')
      .select('page_index, image_url, image_status')
      .eq('story_id', storyId)
      .order('page_index'),
    client
      .from('journey_story_jobs')
      .select('id, status, page_index, last_error')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);
  if (pageError || jobError) return { ok: false, error: JOURNEY_ART_CALM_COPY };

  return {
    ok: true,
    storyId,
    jobs: (jobRows || []).map((row) => ({
      id: String(row.id),
      status: String(row.status),
      pageIndex: row.page_index == null ? null : Number(row.page_index),
      lastError: row.last_error ? String(row.last_error) : null,
    })),
    pages: (pageRows || []).map((row) => ({
      pageIndex: Number(row.page_index),
      imageUrl: row.image_url ? String(row.image_url) : null,
      imageStatus: (row.image_status || 'pending') as JourneyImageStatus,
    })),
  };
}
