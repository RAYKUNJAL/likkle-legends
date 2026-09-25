/**
 * Draw the pages on one claimed Journey Stories job, one image after another.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateJourneyImageBytes, hasGeminiImageKey } from './imagen';
import { isUsableHostedImage } from './jobs';
import { journeyBroadcastTopic } from './realtime';
import { processJourneyJob, type WorkerPage } from './worker-run';

const STORAGE_BUCKET = 'story-illustrations';
const PAGE_FAILED = 'This picture could not be made. The words are still here.';

function publicImageUrl(url: string): string | null {
  if (!isUsableHostedImage(url)) return null;
  return url.includes('supabase-kong')
    ? url.replace('http://supabase-kong:8000', 'https://www.likklelegends.com/supabase')
    : url;
}

async function uploadPng(
  supabase: SupabaseClient,
  storyId: string,
  pageIndex: number,
  bytes: Buffer,
): Promise<string | null> {
  const path = `journey-stories/${storyId}/page-${String(pageIndex + 1).padStart(2, '0')}.png`;
  const upload = async () =>
    supabase.storage.from(STORAGE_BUCKET).upload(path, bytes, { contentType: 'image/png', upsert: true });

  let { error } = await upload();
  if (error && /not found|Bucket/i.test(error.message)) {
    await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    ({ error } = await upload());
  }
  if (error) return null;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return publicImageUrl(data?.publicUrl || '');
}

async function notify(supabase: SupabaseClient, storyId: string, payload: Record<string, unknown>) {
  const channel = supabase.channel(journeyBroadcastTopic(storyId));
  try {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 1500);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    await channel.send({ type: 'broadcast', event: 'page_image', payload });
  } catch {
    /* page row is the source of truth */
  } finally {
    await supabase.removeChannel(channel);
  }
}

export async function executeClaimedJourneyJob(
  supabase: SupabaseClient,
  job: { id: string; story_id: string; page_index: number | null },
  options?: { pageIndex?: number | null },
): Promise<{ ok: boolean; error: string | null }> {
  const storyId = String(job.story_id);
  const pageIndex =
    typeof options?.pageIndex === 'number'
      ? options.pageIndex
      : job.page_index == null
        ? null
        : Number(job.page_index);

  const { data: story } = await supabase
    .from('journey_stories')
    .select('cast_character_ids')
    .eq('id', storyId)
    .maybeSingle();
  const { data: pageRows } = await supabase
    .from('journey_story_pages')
    .select('page_index, role, body, image_url, image_status')
    .eq('story_id', storyId)
    .order('page_index');

  const pages: WorkerPage[] = (pageRows || []).map((row) => ({
    pageIndex: Number(row.page_index),
    role: String(row.role),
    text: String(row.body || ''),
    imageUrl: row.image_url ? String(row.image_url) : null,
    imageStatus: String(row.image_status || 'pending'),
  }));

  try {
    const result = await processJourneyJob({
      job: { id: String(job.id), storyId, pageIndex },
      pages,
      castCharacterIds: Array.isArray(story?.cast_character_ids) ? story.cast_character_ids.map(String) : [],
      hasImagenKey: hasGeminiImageKey(),
      illustrate: (prompt) => generateJourneyImageBytes(prompt),
      saveImage: (index, bytes) => uploadPng(supabase, storyId, index, bytes),
      markPage: async (index, patch) => {
        await supabase
          .from('journey_story_pages')
          .update({
            image_url: patch.imageUrl,
            image_status: patch.imageStatus,
            image_error: patch.imageError,
            updated_at: new Date().toISOString(),
          })
          .eq('story_id', storyId)
          .eq('page_index', index);
        await notify(supabase, storyId, {
          storyId,
          page_index: index,
          image_url: patch.imageUrl,
          image_status: patch.imageStatus,
        });
      },
    });
    await supabase
      .from('journey_story_jobs')
      .update({
        status: result.ok ? 'done' : 'failed',
        phase: result.ok ? 'ready' : 'failed',
        last_error: result.error,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    return result;
  } catch {
    await supabase
      .from('journey_story_jobs')
      .update({
        status: 'failed',
        phase: 'failed',
        last_error: PAGE_FAILED,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    return { ok: false, error: PAGE_FAILED };
  }
}
