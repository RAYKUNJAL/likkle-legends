/**
 * GET /api/cron/content-queue
 * Runs daily at 8am — processes the content_queue table,
 * auto-generating blog posts and social calendars from the queue.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';
import { getBaseUrl } from '@/lib/utils/base-url';
import { logActivity } from '@/lib/agent-os/db';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const base = getBaseUrl();
  const results: { type: string; topic: string; status: string; id?: string }[] = [];

  try {
    // Grab all pending items due now
    const { data: items } = await admin
      .from('content_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(5); // Process max 5 per run to stay within timeout

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'Queue empty' });
    }

    for (const item of items) {
      // Mark as running
      await admin.from('content_queue').update({ status: 'running' }).eq('id', item.id);

      try {
        if (item.content_type === 'blog') {
          const res = await fetch(`${base}/api/admin/blog/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-triggered-by': 'cron-queue' },
            body: JSON.stringify({ topic: item.topic, category: item.category, autoPublish: true }),
          });
          const data = await res.json() as { success: boolean; post?: { id?: string; title?: string } };
          const resultId = data.post?.id;
          await admin.from('content_queue').update({
            status: data.success ? 'done' : 'failed',
            completed_at: new Date().toISOString(),
            result_id: resultId || null,
            error_msg: data.success ? null : 'Generation failed',
          }).eq('id', item.id);
          results.push({ type: 'blog', topic: item.topic, status: data.success ? 'done' : 'failed', id: resultId });

        } else if (item.content_type === 'social') {
          const res = await fetch(`${base}/api/admin/social/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer cron', 'x-triggered-by': 'cron-queue' },
            body: JSON.stringify({}),
          });
          const data = await res.json() as { posts?: unknown[] };
          const count = data.posts?.length || 0;
          await admin.from('content_queue').update({
            status: count > 0 ? 'done' : 'failed',
            completed_at: new Date().toISOString(),
            error_msg: count > 0 ? null : 'No posts generated',
          }).eq('id', item.id);
          results.push({ type: 'social', topic: 'weekly calendar', status: count > 0 ? 'done' : 'failed' });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        await admin.from('content_queue').update({
          status: 'failed', completed_at: new Date().toISOString(), error_msg: msg,
        }).eq('id', item.id);
        results.push({ type: item.content_type, topic: item.topic, status: 'failed' });
      }
    }

    await logActivity({
      agent_key: 'island-brain',
      task_type: 'content_queue_processing',
      subject: `Processed ${results.length} queue items`,
      action_summary: `Content queue: ${results.filter(r => r.status === 'done').length} succeeded, ${results.filter(r => r.status === 'failed').length} failed`,
      outcome: 'success',
      severity: 'info',
      requires_attention: false,
      linked_task_id: null, linked_run_id: null, linked_artifact_id: null,
      linked_user_id: null, linked_campaign_id: null,
      meta: { results },
    });

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
