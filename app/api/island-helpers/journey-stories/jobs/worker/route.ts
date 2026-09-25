/**
 * QStash callback for one Journey Stories page picture.
 * Rejects unsigned calls. Draws a single page, then returns.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runClaimedStoryStep, type StoryJobRequest } from '@/lib/island-helpers/journey-stories/advance-story';
import { executeClaimedJourneyJob } from '@/lib/island-helpers/journey-stories/execute-job';
import { singleCallbackPageIndex } from '@/lib/island-helpers/journey-stories/jobs';
import {
  hasQStashConfig,
  journeyWorkerCallbackUrl,
  publishJourneyJob,
  verifyQStashRequest,
} from '@/lib/island-helpers/journey-stories/qstash';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function admin() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const verified = verifyQStashRequest({
    signature: req.headers.get('upstash-signature'),
    body: raw,
    url: journeyWorkerCallbackUrl(),
  });
  if (!verified.ok) {
    const status = verified.reason === 'qstash_env_missing' ? 503 : 401;
    return NextResponse.json({ ok: false, error: 'Journey Stories callback rejected' }, { status });
  }

  let body: { storyId?: string; jobId?: string; pageIndex?: number | null; step?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.jobId || !body.storyId) {
    return NextResponse.json({ ok: false, error: 'Missing job' }, { status: 400 });
  }

  const supabase = admin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Pictures are resting for now.' }, { status: 503 });
  }

  const { data: existing } = await supabase
    .from('journey_story_jobs')
    .select('id, story_id, page_index, status, phase, request')
    .eq('id', body.jobId)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Unknown job' }, { status: 404 });
  }
  if (existing.status === 'done') {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const { data: pageRows } = await supabase
    .from('journey_story_pages')
    .select('page_index, image_url, image_status')
    .eq('story_id', existing.story_id)
    .order('page_index');
  const pages = (pageRows || []).map((row) => ({
    pageIndex: Number(row.page_index),
    imageUrl: row.image_url ? String(row.image_url) : null,
    imageStatus: String(row.image_status || 'pending'),
  }));
  const requested =
    typeof body.pageIndex === 'number'
      ? body.pageIndex
      : existing.page_index == null
        ? null
        : Number(existing.page_index);
  const pageIndex = singleCallbackPageIndex(requested, pages);
  if (pageIndex == null) {
    await supabase
      .from('journey_story_jobs')
      .update({ status: 'done', finished_at: new Date().toISOString(), last_error: null })
      .eq('id', existing.id);
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const { data: claimedRows, error: claimError } = await supabase.rpc('claim_journey_story_job_by_id', {
    target: existing.id,
  });
  if (claimError) {
    return NextResponse.json({ ok: false, error: 'Pictures are resting for now.' }, { status: 503 });
  }
  const claimed = Array.isArray(claimedRows) ? claimedRows[0] : claimedRows;
  if (!claimed?.id) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const storyPipeline =
    body.step === 'generate' ||
    existing.phase === 'generating_text' ||
    Boolean(existing.request || claimed.request);
  if (storyPipeline) {
    let advanced: Awaited<ReturnType<typeof runClaimedStoryStep>>;
    try {
      advanced = await runClaimedStoryStep(supabase, {
        id: String(claimed.id),
        story_id: String(claimed.story_id),
        page_index: claimed.page_index == null ? null : Number(claimed.page_index),
        request: (claimed.request || existing.request || null) as StoryJobRequest | null,
      });
    } catch {
      await supabase
        .from('journey_story_jobs')
        .update({ status: 'failed', phase: 'failed', finished_at: new Date().toISOString() })
        .eq('id', claimed.id);
      return NextResponse.json({ ok: false, error: 'Story writing is resting for now.' }, { status: 500 });
    }
    if (typeof advanced.publishPage === 'number') {
      await publishJourneyJob({
        storyId: String(claimed.story_id),
        jobId: String(claimed.id),
        pageIndex: advanced.publishPage,
        step: 'page',
      });
    }
    if (!advanced.ok && advanced.retry) {
      return NextResponse.json({ ok: false, error: advanced.error }, { status: 500 });
    }
    return NextResponse.json({ ok: advanced.ok, idempotent: !advanced.retry });
  }

  const result = await executeClaimedJourneyJob(
    supabase,
    { id: String(claimed.id), story_id: String(claimed.story_id), page_index: pageIndex },
    { pageIndex },
  );

  if (result.ok && requested == null && hasQStashConfig()) {
    const nextIndex = singleCallbackPageIndex(
      null,
      pages.map((page) => (page.pageIndex === pageIndex ? { ...page, imageStatus: 'ready' } : page)),
    );
    if (typeof nextIndex === 'number') {
      const { data: nextJob } = await supabase
        .from('journey_story_jobs')
        .insert({ story_id: existing.story_id, page_index: nextIndex, status: 'queued' })
        .select('id')
        .single();
      if (nextJob?.id) {
        await publishJourneyJob({
          storyId: String(existing.story_id),
          jobId: String(nextJob.id),
          pageIndex: nextIndex,
        });
      }
    }
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pageIndex });
}
