import { NextRequest, NextResponse } from 'next/server';
import { listMusicAccount } from '@/lib/music-fulfillment';
import { requireParentPayer } from '@/lib/paypal-checkout';
import {
    CUSTOM_SONG_PRICE,
    MUSIC_DOWNLOAD_BUNDLE_CREDITS,
    MUSIC_DOWNLOAD_BUNDLE_PRICE,
    MUSIC_DOWNLOAD_PRICE,
} from '@/lib/music-store';
import { musicCatalogScoreboard } from '@/lib/song-catalog';

export async function GET(request: NextRequest) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;

    const library = await listMusicAccount(payer.user.id);
    return NextResponse.json({
        ...library,
        prices: {
            download: MUSIC_DOWNLOAD_PRICE,
            bundle: MUSIC_DOWNLOAD_BUNDLE_PRICE,
            bundleCredits: MUSIC_DOWNLOAD_BUNDLE_CREDITS,
            customSong: CUSTOM_SONG_PRICE,
        },
        catalog: musicCatalogScoreboard(),
    });
}
