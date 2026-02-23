import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/services/email-processor';
import { sendWeeklyDigests, sendStreakNudges } from '@/app/actions/digests';

// This endpoint is designed to be called by Vercel Cron Jobs
// Add to vercel.json:
// "crons": [
//   { "path": "/api/cron/process-emails", "schedule": "0 9 * * 0" },  // Weekly digest: Sundays 9 AM
//   { "path": "/api/cron/process-emails?type=nudge", "schedule": "0 18 * * *" }  // Daily nudge: 6 PM
// ]

export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require the secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const type = url.searchParams.get('type');

        if (type === 'nudge') {
            // Send streak nudges (daily)
            const result = await sendStreakNudges();
            return NextResponse.json({
                success: true,
                job: 'streak_nudges',
                count: result.count,
                timestamp: new Date().toISOString()
            });
        }

        // Default: process email queue + send weekly digests (Sundays)
        const [queueResult, digestResult] = await Promise.all([
            processEmailQueue(),
            sendWeeklyDigests()
        ]);

        return NextResponse.json({
            success: true,
            jobs: {
                email_queue: { processed: queueResult.processed, errors: queueResult.errors },
                weekly_digest: { count: digestResult.count }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Also support POST for manual triggering from admin panel
export async function POST(request: NextRequest) {
    // For POST, we require proper admin authentication
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');

        // Use verifyAdmin as a service-level verification or just check profile
        const { supabaseAdmin } = await import('@/lib/supabase-client');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const result = await processEmailQueue();

        return NextResponse.json({
            success: true,
            processed: result.processed,
            errors: result.errors,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Manual queue processing failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
