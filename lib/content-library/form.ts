import {
    LIMITS,
    type AgeBand,
    type AssetType,
} from './constants';
import {
    parseAge,
    parseAgeBand,
    parseAssignments,
    parsePublished,
    parseTags,
    isAssetType,
    type AssignmentInput,
} from './validate';

export type AssetMetadata = {
    title: string;
    description: string | null;
    asset_type: AssetType;
    published: boolean;
    tags: string[];
    age_min: number | null;
    age_max: number | null;
    age_band: AgeBand;
    cover_url: string | null;
    assignments: AssignmentInput[];
    clear_cover: boolean;
};

function text(source: Record<string, unknown>, key: string): string {
    const value = source[key];
    return value == null ? '' : String(value);
}

export function parseAssetMetadata(source: Record<string, unknown>, options: { titleRequired?: boolean } = {}):
    { ok: true; meta: AssetMetadata } | { ok: false; error: string } {
    const title = text(source, 'title').trim();
    if ((options.titleRequired ?? true) && !title) return { ok: false, error: 'Title is required.' };
    if (title.length > LIMITS.maxTitle) return { ok: false, error: 'Title is too long.' };
    const descriptionRaw = text(source, 'description').trim();
    if (descriptionRaw.length > LIMITS.maxDescription) return { ok: false, error: 'Description is too long.' };
    const typeRaw = text(source, 'asset_type') || 'other';
    if (!isAssetType(typeRaw)) return { ok: false, error: 'Unknown content type.' };
    const ageMin = parseAge(source.age_min);
    if (!ageMin.ok) return ageMin;
    const ageMax = parseAge(source.age_max);
    if (!ageMax.ok) return ageMax;
    if (ageMin.value != null && ageMax.value != null && ageMin.value > ageMax.value) {
        return { ok: false, error: 'Minimum age cannot be higher than maximum age.' };
    }
    const assignments = parseAssignments(source.assignments);
    if (!assignments.ok) return assignments;
    const cover = text(source, 'cover_url').trim();
    if (cover && !/^https?:\/\//i.test(cover)) {
        return { ok: false, error: 'Cover link must start with http:// or https://.' };
    }
    return {
        ok: true,
        meta: {
            title,
            description: descriptionRaw || null,
            asset_type: typeRaw,
            published: parsePublished(source.published),
            tags: parseTags(source.tags),
            age_min: ageMin.value,
            age_max: ageMax.value,
            age_band: parseAgeBand(source.age_band),
            cover_url: cover || null,
            assignments: assignments.assignments,
            clear_cover: parsePublished(source.clear_cover),
        },
    };
}

export async function fileFromForm(entry: FormDataEntryValue | null): Promise<{
    name: string;
    mime: string;
    bytes: Uint8Array;
    buffer: Buffer;
} | null> {
    if (!entry || typeof entry === 'string') return null;
    const blob = entry as File;
    if (!blob.size && !blob.name) return null;
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return {
        name: blob.name || 'upload',
        mime: blob.type || '',
        bytes,
        buffer: Buffer.from(bytes),
    };
}

export function formToRecord(form: FormData): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
        if (typeof value === 'string') record[key] = value;
    }
    return record;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
    return UUID_RE.test(value);
}
