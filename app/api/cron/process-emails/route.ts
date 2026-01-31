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
