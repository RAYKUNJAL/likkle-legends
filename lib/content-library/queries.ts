import type { AgeBand, AssetType, SectionKey } from './constants';
import { safeSearch } from './validate';
import type { AssignmentInput } from './validate';
import { assetVisibleForChild, type ChildAge } from './visibility';
import { removeContentObjects } from './storage';

export type AssignmentRow = {
    id: string;
    asset_id: string;
    section_key: SectionKey;
    sort_order: number;
    featured: boolean;
};

export type AssetRow = {
    id: string;
    title: string;
    description: string | null;
    asset_type: AssetType;
    file_path: string;
    mime_type: string;
    file_size: number;
    cover_url: string | null;
    cover_path: string | null;
    published: boolean;
    tags: string[];
    age_min: number | null;
    age_max: number | null;
    age_band: AgeBand | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    content_section_assignments?: AssignmentRow[];
};

export type AssetWrite = {
    title: string;
    description: string | null;
    asset_type: AssetType;
    published: boolean;
    tags: string[];
    age_min: number | null;
    age_max: number | null;
    age_band: AgeBand;
    cover_url: string | null;
    file_path?: string;
    mime_type?: string;
    file_size?: number;
    cover_path?: string | null;
    created_by?: string;
};

async function db() {
    const { createAdminClient } = await import('@/lib/admin');
    return createAdminClient();
}

function withAssignments(row: AssetRow): AssetRow {
    return {
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        content_section_assignments: row.content_section_assignments || [],
    };
}

export async function listAdminAssets(filters: {
    type?: string;
    section?: string;
    published?: string;
    ageBand?: string;
    tag?: string;
    search?: string;
}): Promise<AssetRow[]> {
    const admin = await db();
    let query = admin
        .from('content_assets')
        .select('*, content_section_assignments(*)')
        .order('updated_at', { ascending: false })
        .limit(300);

    if (filters.section) {
        query = admin
            .from('content_assets')
            .select('*, content_section_assignments!inner(*)')
            .eq('content_section_assignments.section_key', filters.section)
            .order('updated_at', { ascending: false })
            .limit(300);
    }
    if (filters.type) query = query.eq('asset_type', filters.type);
    if (filters.published === 'true') query = query.eq('published', true);
    if (filters.published === 'false') query = query.eq('published', false);
    if (filters.ageBand && filters.ageBand !== 'all') query = query.eq('age_band', filters.ageBand);
    if (filters.tag) query = query.contains('tags', [filters.tag]);
    const q = safeSearch(filters.search || '').replace(/ /g, '%');
    if (q) {
        const pattern = `%${q}%`;
        query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data || []) as AssetRow[]).map(withAssignments);
}

export async function getAsset(id: string): Promise<AssetRow | null> {
    const admin = await db();
    const { data, error } = await admin
        .from('content_assets')
        .select('*, content_section_assignments(*)')
        .eq('id', id)
        .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? withAssignments(data as AssetRow) : null;
}

export async function insertAsset(row: AssetWrite): Promise<AssetRow> {
    const admin = await db();
    const { data, error } = await admin
        .from('content_assets')
        .insert(row)
        .select('*, content_section_assignments(*)')
        .single();
    if (error || !data) throw new Error(error?.message || 'Could not save the file');
    return withAssignments(data as AssetRow);
}

export async function updateAsset(id: string, patch: Partial<AssetWrite>): Promise<AssetRow> {
    const admin = await db();
    const { data, error } = await admin
        .from('content_assets')
        .update(patch)
        .eq('id', id)
        .select('*, content_section_assignments(*)')
        .single();
    if (error || !data) throw new Error(error?.message || 'Could not update the file');
    return withAssignments(data as AssetRow);
}

export async function replaceAssignments(assetId: string, assignments: AssignmentInput[]): Promise<void> {
    const admin = await db();
    if (assignments.length === 0) {
        const { error } = await admin.from('content_section_assignments').delete().eq('asset_id', assetId);
        if (error) throw new Error(error.message);
        return;
    }
    const keys = assignments.map((a) => a.section_key);
    const { error: delError } = await admin
        .from('content_section_assignments')
        .delete()
        .eq('asset_id', assetId)
        .not('section_key', 'in', `(${keys.join(',')})`);
    if (delError) throw new Error(delError.message);

    const { error } = await admin.from('content_section_assignments').upsert(
        assignments.map((a) => ({
            asset_id: assetId,
            section_key: a.section_key,
            sort_order: a.sort_order,
            featured: a.featured,
        })),
        { onConflict: 'asset_id,section_key' },
    );
    if (error) throw new Error(error.message);
}

export async function deleteAsset(asset: AssetRow): Promise<void> {
    const admin = await db();
    const { error } = await admin.from('content_assets').delete().eq('id', asset.id);
    if (error) throw new Error(error.message);
    await removeContentObjects([asset.file_path, asset.cover_path]);
}

export async function addAssignments(
    ids: string[],
    assignments: AssignmentInput[],
): Promise<void> {
    if (ids.length === 0 || assignments.length === 0) return;
    const admin = await db();
    const rows = ids.flatMap((assetId) => assignments.map((a) => ({
        asset_id: assetId,
        section_key: a.section_key,
        sort_order: a.sort_order,
        featured: a.featured,
    })));
    const { error } = await admin
        .from('content_section_assignments')
        .upsert(rows, { onConflict: 'asset_id,section_key' });
    if (error) throw new Error(error.message);
}

export async function setPublishedMany(ids: string[], published: boolean): Promise<void> {
    if (ids.length === 0) return;
    const admin = await db();
    const { error } = await admin.from('content_assets').update({ published }).in('id', ids);
    if (error) throw new Error(error.message);
}

export async function listMemberShelf(section: SectionKey, child: ChildAge | null): Promise<AssetRow[]> {
    const admin = await db();
    const { data, error } = await admin
        .from('content_assets')
        .select('*, content_section_assignments!inner(*)')
        .eq('published', true)
        .eq('content_section_assignments.section_key', section)
        .limit(200);
    if (error) throw new Error(error.message);
    const rows = ((data || []) as AssetRow[])
        .map(withAssignments)
        .filter((row) => assetVisibleForChild(row, child))
        .sort((a, b) => {
            const aa = (a.content_section_assignments || []).find((s) => s.section_key === section);
            const bb = (b.content_section_assignments || []).find((s) => s.section_key === section);
            const feat = Number(Boolean(bb?.featured)) - Number(Boolean(aa?.featured));
            if (feat !== 0) return feat;
            const sort = (aa?.sort_order ?? 0) - (bb?.sort_order ?? 0);
            if (sort !== 0) return sort;
            return a.title.localeCompare(b.title);
        });
    return rows;
}

export async function getPublishedAssignedAsset(id: string): Promise<AssetRow | null> {
    const asset = await getAsset(id);
    if (!asset?.published) return null;
    if (!asset.content_section_assignments || asset.content_section_assignments.length === 0) return null;
    return asset;
}
