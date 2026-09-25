/**
 * On-host Journey Stories picture worker.
 * Claims one Postgres job at a time and draws pages sequentially.
 * Backup for the signed QStash callback. This process does not call QStash.
 * No Redis. No public port.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { runClaimedStoryStep, type StoryJobRequest } from '../lib/island-helpers/journey-stories/advance-story';
import { executeClaimedJourneyJob } from '../lib/island-helpers/journey-stories/execute-job';
import { hasGeminiImageKey } from '../lib/island-helpers/journey-stories/imagen';
import { hasQStashConfig, publishJourneyJob } from '../lib/island-helpers/journey-stories/qstash';
import fs from 'fs';

const HEARTBEAT = '/tmp/journey-worker-heartbeat';

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

async function workOne(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('claim_journey_story_job');
  if (error) {
    console.error('[journey-worker] claim failed');
    return false;
  }
  const job = Array.isArray(data) ? data[0] : data;
  if (!job?.id) return false;

  console.log(`[journey-worker] claimed ${job.id} story ${job.story_id} page ${job.page_index ?? 'all'}`);
  if (job.request || job.phase === 'generating_text') {
    const advanced = await runClaimedStoryStep(supabase, {
      id: String(job.id),
      story_id: String(job.story_id),
      page_index: job.page_index == null ? null : Number(job.page_index),
      request: (job.request || null) as StoryJobRequest | null,
    });
    if (typeof advanced.publishPage === 'number' && hasQStashConfig()) {
      await publishJourneyJob({
        storyId: String(job.story_id),
        jobId: String(job.id),
        pageIndex: advanced.publishPage,
        step: 'page',
      });
    }
    return true;
  }
  await executeClaimedJourneyJob(supabase, {
    id: String(job.id),
    story_id: String(job.story_id),
    page_index: job.page_index == null ? null : Number(job.page_index),
  });
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
