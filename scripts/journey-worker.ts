/**
 * On-host Journey Stories picture worker.
 * Claims one Postgres job at a time and draws pages sequentially.
 * No QStash. No Redis. No public port.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { generateJourneyImageBytes, hasGeminiImageKey } from '../lib/island-helpers/journey-stories/imagen';
import { isUsableHostedImage } from '../lib/island-helpers/journey-stories/jobs';
import { journeyBroadcastTopic } from '../lib/island-helpers/journey-stories/realtime';
import { processJourneyJob, type WorkerPage } from '../lib/island-helpers/journey-stories/worker-run';
import fs from 'fs';

const HEARTBEAT = '/tmp/journey-worker-heartbeat';
const STORAGE_BUCKET = 'story-illustrations';

function beat() {
  fs.writeFileSync(HEARTBEAT, new Date().toISOString());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function admin(): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicImageUrl(url: string): string | null {
  if (!isUsableHostedImage(url)) return null;
  return url.includes('supabase-kong')
    ? url.replace('http://supabase-kong:8000', 'https://www.likklelegends.com/supabase')
    : url;
}

async function uploadPng(supabase: SupabaseClient, storyId: string, pageIndex: number, bytes: Buffer): Promise<string | null> {
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

async function finishJob(supabase: SupabaseClient, jobId: string, ok: boolean, error: string | null) {
  await supabase
    .from('journey_story_jobs')
    .update({
      status: ok ? 'done' : 'failed',
      last_error: error,
      finished_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

async function workOne(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('claim_journey_story_job');
  if (error) {
    console.error('[journey-worker] claim failed');
    return false;
  }
  const job = Array.isArray(data) ? data[0] : data;
  if (!job?.id) return false;

  const storyId = String(job.story_id);
  console.log(`[journey-worker] claimed ${job.id} story ${storyId} page ${job.page_index ?? 'all'}`);

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
      job: {
        id: String(job.id),
        storyId,
        pageIndex: job.page_index == null ? null : Number(job.page_index),
      },
      pages,
      castCharacterIds: Array.isArray(story?.cast_character_ids) ? story.cast_character_ids.map(String) : [],
      hasImagenKey: hasGeminiImageKey(),
      illustrate: (prompt) => generateJourneyImageBytes(prompt),
      saveImage: (pageIndex, bytes) => uploadPng(supabase, storyId, pageIndex, bytes),
      markPage: async (pageIndex, patch) => {
        await supabase
          .from('journey_story_pages')
          .update({
            image_url: patch.imageUrl,
            image_status: patch.imageStatus,
            image_error: patch.imageError,
            updated_at: new Date().toISOString(),
          })
          .eq('story_id', storyId)
          .eq('page_index', pageIndex);
        await notify(supabase, storyId, {
          storyId,
          page_index: pageIndex,
          image_url: patch.imageUrl,
          image_status: patch.imageStatus,
        });
      },
    });
    await finishJob(supabase, String(job.id), result.ok, result.error);
  } catch {
    await finishJob(supabase, String(job.id), false, 'This picture could not be made. The words are still here.');
  }
  return true;
}

async function main() {
  let stopping = false;
  process.on('SIGTERM', () => {
    stopping = true;
  });
  process.on('SIGINT', () => {
    stopping = true;
  });

  beat();
  const supabase = admin();
  if (!supabase) {
    console.error('[journey-worker] missing Supabase service role. Idling.');
  }
  if (!hasGeminiImageKey()) {
    console.error('[journey-worker] no GEMINI_API_KEY. New picture jobs fail closed.');
  }

  while (!stopping) {
    beat();
    if (!supabase) {
      await sleep(5000);
      continue;
    }
    const did = await workOne(supabase);
    if (!did) await sleep(2000);
  }
}

main().catch((error) => {
  console.error('[journey-worker] stopped', error instanceof Error ? error.message : 'error');
  process.exit(1);
});
