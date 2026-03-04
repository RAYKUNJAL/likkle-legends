import { NextRequest, NextResponse } from 'next/server';
import { getNowPlaying, isAzuraCastConfigured } from '@/lib/services/azuracast';

export async function GET(request: NextRequest) {
    try {
        if (!isAzuraCastConfigured()) {
            return NextResponse.json(
                { success: false, error: 'AzuraCast not configured' },
                { status: 503 }
            );
        }

        const station = request.nextUrl.searchParams.get('station') || undefined;
        const data = await getNowPlaying(station);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to fetch now playing' },
            { status: 500 }
        );
    }
}

