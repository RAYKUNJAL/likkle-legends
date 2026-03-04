import { NextRequest, NextResponse } from 'next/server';
import { AZURACAST_SEGMENT_STATIONS, getNowPlaying, isAzuraCastConfigured } from '@/lib/services/azuracast';
import { mapLegacyRadioCategory } from '@/lib/radio-stations';

export async function GET(request: NextRequest) {
    try {
        if (!isAzuraCastConfigured()) {
            return NextResponse.json(
                { success: false, error: 'AzuraCast not configured' },
                { status: 503 }
            );
        }

        const stationFromQuery = request.nextUrl.searchParams.get('station') || undefined;
        const segment = request.nextUrl.searchParams.get('segment');
        const segmentId = segment ? mapLegacyRadioCategory(segment) : undefined;
        const segmentStation = segmentId ? AZURACAST_SEGMENT_STATIONS[segmentId] : '';
        const resolvedStation = stationFromQuery || segmentStation || undefined;
        const data = await getNowPlaying(resolvedStation);
        return NextResponse.json({ success: true, data, station: resolvedStation || null, segment: segmentId || null });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to fetch now playing' },
            { status: 500 }
        );
    }
}
