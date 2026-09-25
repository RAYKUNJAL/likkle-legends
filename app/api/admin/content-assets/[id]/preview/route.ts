import { NextRequest, NextResponse } from 'next/server';
import { requireContentAdmin } from '@/lib/content-library/access';
import { isUuid } from '@/lib/content-library/form';
import { getAsset } from '@/lib/content-library/queries';
import { signContentObject } from '@/lib/content-library/storage';
import { sanitizeFilename } from '@/lib/content-library/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    try {
        const asset = await getAsset(params.id);
        if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const kind = request.nextUrl.searchParams.get('kind') === 'cover' ? 'cover' : 'file';
        const path = kind === 'cover' ? asset.cover_path : asset.file_path;
        if (!path) {
            if (kind === 'cover' && asset.cover_url) {
                return NextResponse.json({ url: asset.cover_url, mime_type: 'image/*' });
            }
            return NextResponse.json({ error: 'Nothing to preview' }, { status: 404 });
        }
        const download = request.nextUrl.searchParams.get('download') === '1';
        const url = await signContentObject(path, {
            expiresSeconds: 600,
            downloadName: download ? sanitizeFilename(asset.title) : undefined,
        });
        return NextResponse.json({ url, mime_type: kind === 'cover' ? 'image/*' : asset.mime_type });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Preview failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
