import { NextResponse } from 'next/server';
import { AZURACAST_SEGMENT_STATIONS, isAzuraCastConfigured } from '@/lib/services/azuracast';
import { RADIO_SEGMENTS } from '@/lib/radio-stations';

export async function GET() {
    const stations = RADIO_SEGMENTS.map((segment) => ({
        ...segment,
        station: AZURACAST_SEGMENT_STATIONS[segment.id] || null,
        configured: Boolean(AZURACAST_SEGMENT_STATIONS[segment.id]),
    }));

    return NextResponse.json({
        success: true,
        azuracastConfigured: isAzuraCastConfigured(),
        stations,
    });
}

