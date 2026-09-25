import { AGE_BANDS, ASSET_TYPES, LIMITS, SECTION_KEYS, type AgeBand, type AssetType, type SectionKey } from './constants';

export type UploadKind = 'pdf' | 'image' | 'zip';

export type ValidatedUpload = {
    mime: string;
    extension: string;
    kind: UploadKind;
    size: number;
};

type Rule = {
    mime: string;
    extensions: string[];
    kind: UploadKind;
    maxBytes: number;
    sniff: (bytes: Uint8Array) => boolean;
};

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
    if (bytes.length < sig.length) return false;
    return sig.every((b, i) => bytes[i] === b);
}

const RULES: Rule[] = [
    {
        mime: 'application/pdf',
        extensions: ['pdf'],
        kind: 'pdf',
        maxBytes: LIMITS.pdfBytes,
        sniff: (b) => b.length >= 4 && String.fromCharCode(b[0], b[1], b[2], b[3]) === '%PDF',
    },
    {
        mime: 'image/png',
        extensions: ['png'],
        kind: 'image',
        maxBytes: LIMITS.imageBytes,
        sniff: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]),
    },
    {
        mime: 'image/jpeg',
        extensions: ['jpg', 'jpeg'],
        kind: 'image',
        maxBytes: LIMITS.imageBytes,
        sniff: (b) => startsWith(b, [0xff, 0xd8, 0xff]),
    },
    {
        mime: 'image/webp',
        extensions: ['webp'],
        kind: 'image',
        maxBytes: LIMITS.imageBytes,
        sniff: (b) => b.length >= 12
            && String.fromCharCode(b[0], b[1], b[2], b[3]) === 'RIFF'
            && String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP',
    },
    {
        mime: 'image/gif',
        extensions: ['gif'],
        kind: 'image',
        maxBytes: LIMITS.imageBytes,
        sniff: (b) => b.length >= 6 && (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a'),
    },
    {
        mime: 'application/zip',
        extensions: ['zip'],
        kind: 'zip',
        maxBytes: LIMITS.zipBytes,
        sniff: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04])
            || startsWith(b, [0x50, 0x4b, 0x05, 0x06])
            || startsWith(b, [0x50, 0x4b, 0x07, 0x08]),
    },
];

function ascii(bytes: Uint8Array, start: number, len: number): string {
    return String.fromCharCode(...bytes.slice(start, start + len));
}

export function fileExtension(filename: string): string {
    const base = filename.trim().toLowerCase().split(/[/\\]/).pop() || '';
    const dot = base.lastIndexOf('.');
    if (dot <= 0) return '';
    return base.slice(dot + 1).replace(/[^a-z0-9]/g, '');
}

export function sanitizeFilename(filename: string): string {
    const ext = fileExtension(filename);
    const base = (filename.split(/[/\\]/).pop() || 'file')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .slice(0, 80) || 'file';
    return ext ? `${base}.${ext}` : base;
}

export function buildStoragePath(filename: string, prefix = 'files'): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const id = crypto.randomUUID();
    return `${prefix}/${year}/${month}/${id}-${sanitizeFilename(filename)}`;
}

export function validateContentUpload(
    filename: string,
    declaredMime: string,
    bytes: Uint8Array,
): { ok: true; file: ValidatedUpload } | { ok: false; error: string } {
    if (!bytes || bytes.length === 0) {
        return { ok: false, error: 'File is empty.' };
    }
    const ext = fileExtension(filename);
    const sniffed = RULES.find((rule) => rule.sniff(bytes) && rule.extensions.includes(ext));
    if (!sniffed) {
        return {
            ok: false,
            error: 'File type is not allowed. Use a PDF, PNG, JPG, WEBP, GIF, or ZIP that matches its contents.',
        };
    }
    if (bytes.length > sniffed.maxBytes) {
        const mb = Math.round(sniffed.maxBytes / (1024 * 1024));
        return { ok: false, error: `File is too large. Maximum for this type is ${mb}MB.` };
    }
    const declared = (declaredMime || '').toLowerCase().split(';')[0].trim();
    const declaredOk = !declared
        || declared === 'application/octet-stream'
        || declared === sniffed.mime
        || (sniffed.kind === 'zip' && declared === 'application/x-zip-compressed');
    if (!declaredOk) {
        return { ok: false, error: `File contents do not match the declared type (${declared}).` };
    }
    return {
        ok: true,
        file: {
            mime: sniffed.mime,
            extension: ext,
            kind: sniffed.kind,
            size: bytes.length,
        },
    };
}

export function validateCoverUpload(
    filename: string,
    declaredMime: string,
    bytes: Uint8Array,
): { ok: true; file: ValidatedUpload } | { ok: false; error: string } {
    const checked = validateContentUpload(filename, declaredMime, bytes);
    if (!checked.ok) return checked;
    if (checked.file.kind !== 'image') {
        return { ok: false, error: 'Cover image must be PNG, JPG, WEBP, or GIF.' };
    }
    if (checked.file.size > LIMITS.coverBytes) {
        return { ok: false, error: 'Cover image must be 8MB or smaller.' };
    }
    return checked;
}

export function isAssetType(value: string): value is AssetType {
    return (ASSET_TYPES as readonly string[]).includes(value);
}

export function isSectionKey(value: string): value is SectionKey {
    return (SECTION_KEYS as readonly string[]).includes(value);
}

export function parseTags(input: unknown): string[] {
    const raw = Array.isArray(input)
        ? input.map((t) => String(t))
        : String(input || '').split(',');
    const tags: string[] = [];
    for (const item of raw) {
        const tag = item.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, LIMITS.maxTagLength);
        if (!tag || tags.includes(tag)) continue;
        tags.push(tag);
        if (tags.length >= LIMITS.maxTags) break;
    }
    return tags;
}

export type AssignmentInput = {
    section_key: SectionKey;
    sort_order: number;
    featured: boolean;
};

export function parseAssignments(input: unknown): { ok: true; assignments: AssignmentInput[] } | { ok: false; error: string } {
    if (input == null || input === '') return { ok: true, assignments: [] };
    let value = input;
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch {
            return { ok: false, error: 'Assignments must be JSON.' };
        }
    }
    if (!Array.isArray(value)) return { ok: false, error: 'Assignments must be a list.' };
    const seen = new Set<string>();
    const assignments: AssignmentInput[] = [];
    for (const row of value) {
        if (!row || typeof row !== 'object') continue;
        const key = String((row as { section_key?: string }).section_key || '');
        if (!isSectionKey(key)) return { ok: false, error: `Unknown section: ${key}` };
        if (seen.has(key)) continue;
        seen.add(key);
        const sort = Number((row as { sort_order?: number }).sort_order ?? 0);
        if (!Number.isFinite(sort) || sort < -1000 || sort > 10000) {
            return { ok: false, error: 'Sort order must be between -1000 and 10000.' };
        }
        assignments.push({
            section_key: key,
            sort_order: Math.round(sort),
            featured: Boolean((row as { featured?: boolean }).featured),
        });
    }
    return { ok: true, assignments };
}

export function parseAge(input: unknown): { ok: true; value: number | null } | { ok: false; error: string } {
    if (input == null || input === '') return { ok: true, value: null };
    const n = Number(input);
    if (!Number.isInteger(n) || n < 0 || n > 18) {
        return { ok: false, error: 'Age must be a whole number from 0 to 18.' };
    }
    return { ok: true, value: n };
}

export function parseAgeBand(input: unknown): AgeBand {
    const value = String(input || 'all');
    return (AGE_BANDS as readonly string[]).includes(value) ? value as AgeBand : 'all';
}

export function parsePublished(input: unknown): boolean {
    if (typeof input === 'boolean') return input;
    const value = String(input || '').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'live';
}

export function previewKind(mime: string): 'pdf' | 'image' | 'download' {
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    return 'download';
}

export function safeSearch(input: string): string {
    return input.replace(/[%_,.()"'\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}
