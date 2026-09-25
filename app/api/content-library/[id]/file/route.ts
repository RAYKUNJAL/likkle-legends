import { NextRequest, NextResponse } from 'next/server';
import { requirePaidMember } from '@/lib/content-library/access';
import { isUuid } from '@/lib/content-library/form';
import { getPublishedAssignedAsset } from '@/lib/content-library/queries';
import { signContentObject } from '@/lib/content-library/storage';
import { previewKind, sanitizeFilename } from '@/lib/content-library/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requirePaidMember(request);
    if (!auth.ok) return auth.response;
    if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    try {
        const asset = await getPublishedAssignedAsset(params.id);
        if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const kind = request.nextUrl.searchParams.get('kind') === 'cover' ? 'cover' : 'file';
        if (kind === 'cover') {
            if (asset.cover_url && !asset.cover_path && /^https?:\/\//i.test(asset.cover_url)) {
                return NextResponse.redirect(asset.cover_url);
            }
            if (!asset.cover_path) return NextResponse.json({ error: 'No cover' }, { status: 404 });
            const url = await signContentObject(asset.cover_path, { expiresSeconds: 300 });
            return NextResponse.redirect(url);
        }

        const forceDownload = request.nextUrl.searchParams.get('download') === '1'
            || previewKind(asset.mime_type) === 'download';
        const ext = asset.file_path.split('.').pop() || 'bin';
        const downloadName = `${sanitizeFilename(asset.title).replace(/\.[a-z0-9]+$/i, '')}.${ext}`;
        const url = await signContentObject(asset.file_path, {
            expiresSeconds: 300,
            downloadName: forceDownload ? downloadName : undefined,
        });
        return NextResponse.redirect(url);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not open the file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
