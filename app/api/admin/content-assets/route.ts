import { NextRequest, NextResponse } from 'next/server';
import { requireContentAdmin } from '@/lib/content-library/access';
import { fileFromForm, formToRecord, parseAssetMetadata } from '@/lib/content-library/form';
import { insertAsset, listAdminAssets, replaceAssignments } from '@/lib/content-library/queries';
import { removeContentObjects, uploadContentObject } from '@/lib/content-library/storage';
import { buildStoragePath, validateContentUpload, validateCoverUpload } from '@/lib/content-library/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;

    const params = request.nextUrl.searchParams;
    try {
        const assets = await listAdminAssets({
            type: params.get('type') || undefined,
            section: params.get('section') || undefined,
            published: params.get('published') || undefined,
            ageBand: params.get('age_band') || undefined,
            tag: (params.get('tag') || '').trim().toLowerCase() || undefined,
            search: params.get('q') || undefined,
        });
        return NextResponse.json({ assets });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load content';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;

    let uploadedPath: string | null = null;
    let uploadedCover: string | null = null;
    let saved = false;
    try {
        const form = await request.formData();
        const parsed = parseAssetMetadata(formToRecord(form));
        if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

        const file = await fileFromForm(form.get('file'));
        if (!file) return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
        const checked = validateContentUpload(file.name, file.mime, file.bytes);
        if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

        const cover = await fileFromForm(form.get('cover'));
        let coverPath: string | null = null;
        if (cover) {
            const coverCheck = validateCoverUpload(cover.name, cover.mime, cover.bytes);
            if (!coverCheck.ok) return NextResponse.json({ error: coverCheck.error }, { status: 400 });
            coverPath = buildStoragePath(cover.name, 'covers');
            uploadedCover = coverPath;
            await uploadContentObject(coverPath, cover.buffer, coverCheck.file.mime);
        }

        const filePath = buildStoragePath(file.name, 'files');
        uploadedPath = filePath;
        await uploadContentObject(filePath, file.buffer, checked.file.mime);

        const asset = await insertAsset({
            title: parsed.meta.title,
            description: parsed.meta.description,
            asset_type: parsed.meta.asset_type,
            published: parsed.meta.published,
            tags: parsed.meta.tags,
            age_min: parsed.meta.age_min,
            age_max: parsed.meta.age_max,
            age_band: parsed.meta.age_band,
            cover_url: parsed.meta.cover_url,
            cover_path: coverPath,
            file_path: filePath,
            mime_type: checked.file.mime,
            file_size: checked.file.size,
            created_by: auth.userId,
        });
        await replaceAssignments(asset.id, parsed.meta.assignments);
        saved = true;
        const { getAsset } = await import('@/lib/content-library/queries');
        const row = await getAsset(asset.id);
        return NextResponse.json({ asset: row }, { status: 201 });
    } catch (error) {
        if (!saved) await removeContentObjects([uploadedPath, uploadedCover]);
        const message = error instanceof Error ? error.message : 'Upload failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
