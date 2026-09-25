import { NextRequest, NextResponse } from 'next/server';
import { requireContentAdmin } from '@/lib/content-library/access';
import { fileFromForm, formToRecord, isUuid, parseAssetMetadata } from '@/lib/content-library/form';
import { deleteAsset, getAsset, replaceAssignments, updateAsset } from '@/lib/content-library/queries';
import { removeContentObjects, uploadContentObject } from '@/lib/content-library/storage';
import { buildStoragePath, validateContentUpload, validateCoverUpload } from '@/lib/content-library/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    try {
        const asset = await getAsset(params.id);
        if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ asset });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load the file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let existing;
    try {
        existing = await getAsset(params.id);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load the file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const contentType = request.headers.get('content-type') || '';
    let source: Record<string, unknown>;
    let nextFile: { path: string } | null = null;
    let nextCover: { path: string } | null = null;
    let mime: string | undefined;
    let size: number | undefined;
    let committed = false;

    try {
        if (contentType.includes('multipart/form-data')) {
            const form = await request.formData();
            source = formToRecord(form);
            const file = await fileFromForm(form.get('file'));
            if (file) {
                const checked = validateContentUpload(file.name, file.mime, file.bytes);
                if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
                const path = buildStoragePath(file.name, 'files');
                await uploadContentObject(path, file.buffer, checked.file.mime);
                nextFile = { path };
                mime = checked.file.mime;
                size = checked.file.size;
            }
            const cover = await fileFromForm(form.get('cover'));
            if (cover) {
                const coverCheck = validateCoverUpload(cover.name, cover.mime, cover.bytes);
                if (!coverCheck.ok) {
                    await removeContentObjects([nextFile?.path]);
                    return NextResponse.json({ error: coverCheck.error }, { status: 400 });
                }
                const path = buildStoragePath(cover.name, 'covers');
                await uploadContentObject(path, cover.buffer, coverCheck.file.mime);
                nextCover = { path };
            }
        } else {
            source = await request.json();
        }

        const parsed = parseAssetMetadata(source);
        if (!parsed.ok) {
            await removeContentObjects([nextFile?.path, nextCover?.path]);
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const patch: Record<string, unknown> = {
            title: parsed.meta.title,
            description: parsed.meta.description,
            asset_type: parsed.meta.asset_type,
            published: parsed.meta.published,
            tags: parsed.meta.tags,
            age_min: parsed.meta.age_min,
            age_max: parsed.meta.age_max,
            age_band: parsed.meta.age_band,
            cover_url: parsed.meta.cover_url,
        };
        if (nextFile) {
            patch.file_path = nextFile.path;
            patch.mime_type = mime;
            patch.file_size = size;
        }
        if (nextCover) patch.cover_path = nextCover.path;
        if (parsed.meta.clear_cover && !nextCover) {
            patch.cover_path = null;
            patch.cover_url = null;
        }

        await updateAsset(params.id, patch as Parameters<typeof updateAsset>[1]);
        await replaceAssignments(params.id, parsed.meta.assignments);
        committed = true;
        const saved = await getAsset(params.id);

        const stale: string[] = [];
        if (nextFile && existing.file_path !== nextFile.path) stale.push(existing.file_path);
        if ((nextCover || parsed.meta.clear_cover) && existing.cover_path && existing.cover_path !== nextCover?.path) {
            stale.push(existing.cover_path);
        }
        await removeContentObjects(stale);
        return NextResponse.json({ asset: saved });
    } catch (error) {
        if (!committed) await removeContentObjects([nextFile?.path, nextCover?.path]);
        const message = error instanceof Error ? error.message : 'Could not update the file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;
    if (!isUuid(params.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    try {
        const asset = await getAsset(params.id);
        if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await deleteAsset(asset);
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not delete the file';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
