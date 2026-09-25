import { CONTENT_BUCKET } from './constants';

async function adminClient() {
    const { createAdminClient } = await import('@/lib/admin');
    return createAdminClient();
}

export async function uploadContentObject(path: string, bytes: Buffer, mime: string): Promise<void> {
    const admin = await adminClient();
    const { error } = await admin.storage.from(CONTENT_BUCKET).upload(path, bytes, {
        contentType: mime,
        upsert: false,
        cacheControl: '3600',
    });
    if (error) {
        throw new Error(error.message || 'Upload failed');
    }
}

export async function removeContentObjects(paths: Array<string | null | undefined>): Promise<void> {
    const names = paths.filter((p): p is string => Boolean(p));
    if (names.length === 0) return;
    const admin = await adminClient();
    const { error } = await admin.storage.from(CONTENT_BUCKET).remove(names);
    if (error) {
        console.error('[content-library] storage remove failed', error.message);
    }
}

export async function signContentObject(
    path: string,
    options: { downloadName?: string; expiresSeconds?: number } = {},
): Promise<string> {
    const admin = await adminClient();
    const { data, error } = await admin.storage
        .from(CONTENT_BUCKET)
        .createSignedUrl(path, options.expiresSeconds ?? 600, options.downloadName
            ? { download: options.downloadName }
            : undefined);
    if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Could not create a preview link');
    }
    return data.signedUrl;
}
