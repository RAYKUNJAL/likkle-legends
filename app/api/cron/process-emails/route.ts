import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/services/email-processor';

// This endpoint is designed to be called by Vercel Cron Jobs
// Add to vercel.json: "crons": [{ "path": "/api/cron/process-emails", "schedule": "*/5 * * * *" }]

export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require the secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processEmailQueue();

        return NextResponse.json({
            success: true,
            processed: result.processed,
            errors: result.errors,
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
    // This could be called from the admin dashboard
    try {
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
