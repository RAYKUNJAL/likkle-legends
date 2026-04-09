import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

const WEEKLY_THEMES = [
    { topic: 'Caribbean sea creatures and ocean conservation', island: 'TT' },
    { topic: 'Traditional Caribbean folk dances like Limbo and Quadrille', island: 'JM' },
    { topic: 'Island fruits: mangoes, ackee, breadfruit and their stories', island: 'TT' },
    { topic: 'Caribbean folktales: Anansi spider stories', island: 'JM' },
    { topic: 'Beach safety and respecting the ocean', island: 'BB' },
    { topic: 'Sharing and taking turns with friends', island: 'TT' },
    { topic: 'Being kind to animals and nature', island: 'JM' },
    { topic: 'Healthy eating: trying new Caribbean foods', island: 'TT' },
    { topic: 'Family helpers: how we work together at home', island: 'BB' },
    { topic: 'Making new friends at school', island: 'TT' },
    { topic: 'How hurricanes form and staying safe', island: 'BB' },
    { topic: 'The colors of the rainbow after Caribbean rain', island: 'JM' },
    { topic: 'Counting coconuts: learning numbers with island items', island: 'TT' },
];

async function logAgentActivity(
  admin: ReturnType<typeof createAdminClient>,
  opts: {
    agent_id: string;
    agent_name: string;
    action: string;
    status: 'started' | 'success' | 'error';
    summary?: string;
    details?: Record<string, unknown>;
    duration_ms?: number;
    triggered_by?: string;
  }
) {
  try {
    await admin.from('agent_logs').insert({
      agent_id: opts.agent_id,
      agent_name: opts.agent_name,
      action: opts.action,
      status: opts.status,
      summary: opts.summary ?? null,
      details: opts.details ?? {},
      duration_ms: opts.duration_ms ?? null,
      triggered_by: opts.triggered_by ?? 'cron',
    });
  } catch (err) {
    console.error('[agent_logs] Failed to write log:', err);
  }
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const triggered_by = request.headers.get('x-triggered-by') || 'cron';
    const startTime = Date.now();
    const admin = createAdminClient();

    await logAgentActivity(admin, {
      agent_id: 'island-brain',
      agent_name: 'IslandBrain',
      action: 'content_scheduling',
      status: 'started',
      summary: 'Starting weekly content scheduling run',
      triggered_by,
    });

    try {
        const today = new Date();
        const weekStart = new Date(today);
        const weekOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        const themeOffset = (weekOfYear * 5) % WEEKLY_THEMES.length;
        const scheduledItems: unknown[] = [];
        const skipped: string[] = [];

        for (let i = 0; i < 5; i++) {
            const scheduledDate = new Date(weekStart);
            scheduledDate.setDate(weekStart.getDate() + i);
            while (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
                scheduledDate.setDate(scheduledDate.getDate() + 1);
            }
            const themeIndex = (themeOffset + i) % WEEKLY_THEMES.length;
            const theme = WEEKLY_THEMES[themeIndex];
            const ageGroup = i % 2 === 0 ? 'mini' : 'big';
            const dateStr = scheduledDate.toISOString().split('T')[0];
            const { data: existing } = await admin
                .from('content_schedule')
                .select('id')
                .gte('scheduled_date', `${dateStr}T00:00:00Z`)
                .lte('scheduled_date', `${dateStr}T23:59:59Z`)
                .limit(1);

            if (existing && existing.length > 0) {
                skipped.push(dateStr);
                continue;
            }

            const { data, error } = await admin
                .from('content_schedule')
                .insert({
                    title: theme.topic,
                    content_type: 'monthly_drop_bundle',
                    island_id: theme.island,
                    age_group: ageGroup,
                    scheduled_date: scheduledDate.toISOString(),
                    status: 'scheduled'
                })
                .select()
                .single();

            if (!error && data) scheduledItems.push(data);
        }

        const duration_ms = Date.now() - startTime;

        await logAgentActivity(admin, {
          agent_id: 'island-brain',
          agent_name: 'IslandBrain',
          action: 'content_scheduling',
          status: 'success',
          summary: `Scheduled ${scheduledItems.length} content items for the week (${skipped.length} already existed)`,
          details: {
            scheduled: scheduledItems.length,
            skipped: skipped.length,
            week_of_year: weekOfYear,
            themes: (scheduledItems as {title?: string}[]).map(s => s.title),
          },
          duration_ms,
          triggered_by,
        });

        return NextResponse.json({
            success: true,
            scheduled: scheduledItems.length,
            skipped: skipped.length,
            themes_used: (scheduledItems as {title?: string}[]).map(s => s.title),
            timestamp: today.toISOString(),
            duration_ms,
        });
    } catch (error) {
        const duration_ms = Date.now() - startTime;
        const message = error instanceof Error ? error.message : 'Unknown error';
        await logAgentActivity(admin, {
          agent_id: 'island-brain',
          agent_name: 'IslandBrain',
          action: 'content_scheduling',
          status: 'error',
          summary: `Content scheduling failed: ${message}`,
          details: { error: message },
          duration_ms,
          triggered_by,
        });
        console.error('Content generation cron failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const triggered_by = (body as {triggered_by?: string}).triggered_by || 'manual';
    const modifiedReq = new Request(request.url, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'x-triggered-by': triggered_by,
      },
    });
    return GET(modifiedReq as NextRequest);
}
