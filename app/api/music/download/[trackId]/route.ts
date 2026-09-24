import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { parentOwnsDownload } from '@/lib/music-fulfillment';
import { requireParentPayer } from '@/lib/paypal-checkout';
import { getPlayableSong } from '@/lib/song-catalog';

export async function GET(
    request: NextRequest,
    { params }: { params: { trackId: string } }
) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;

    const track = getPlayableSong(params.trackId);
    if (!track) {
        return NextResponse.json({ error: 'That song is not in the library.' }, { status: 404 });
    }

    const owned = await parentOwnsDownload(payer.user.id, track.id);
    if (!owned) {
        return NextResponse.json({ error: 'A download license is required.' }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'public', track.url.replace(/^\//, ''));
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${track.id}.mp3"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
