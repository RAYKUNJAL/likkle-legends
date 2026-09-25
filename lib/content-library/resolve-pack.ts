import type { AssetType } from './constants';

export type LibraryPdfPointer = {
    id: string;
    title: string;
    asset_type: AssetType;
    /** Member download. Anonymous and free accounts receive 403. */
    member_path: string;
};

/**
 * Lead magnets and printable packs store content_asset_id.
 * This resolves it only when the library file is published.
 * The storage path stays on the server.
 */
export async function resolvePublishedLibraryPdf(assetId: string | null | undefined): Promise<LibraryPdfPointer | null> {
    if (!assetId) return null;
    const { createAdminClient } = await import('@/lib/admin');
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('content_assets')
        .select('id, title, asset_type, published')
        .eq('id', assetId)
        .maybeSingle();
    if (error || !data?.published) return null;
    return {
        id: data.id,
        title: data.title,
        asset_type: data.asset_type,
        member_path: `/api/content-library/${data.id}/file`,
    };
}
