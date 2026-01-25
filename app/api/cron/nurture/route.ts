
import { NextRequest, NextResponse } from 'next/server';
import { processEmailNurture } from '@/lib/services/nurture';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    // In Vercel, CRON_SECRET is automatically injected as 'Bearer <token>'
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await processEmailNurture();
        return NextResponse.json({ success: true, processed_at: new Date().toISOString() });
    } catch (err: any) {
        console.error('[CRON] Nurture failed:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
