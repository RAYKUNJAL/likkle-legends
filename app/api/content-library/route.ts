import { NextRequest, NextResponse } from 'next/server';
import { requirePaidMember } from '@/lib/content-library/access';
import { isSectionKey, previewKind } from '@/lib/content-library/validate';
import { listMemberShelf } from '@/lib/content-library/queries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requirePaidMember(request);
    if (!auth.ok) return auth.response;

    const section = request.nextUrl.searchParams.get('section') || '';
    if (!isSectionKey(section)) {
        return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });
    }

    const ageRaw = request.nextUrl.searchParams.get('age');
    const age = ageRaw != null && ageRaw !== '' ? Number(ageRaw) : null;
    const ageTrack = request.nextUrl.searchParams.get('age_track');

    try {
        const rows = await listMemberShelf(section, {
            age: age != null && Number.isFinite(age) ? age : null,
            age_track: ageTrack,
        });
        const assets = rows.map((row) => {
            const assignment = (row.content_section_assignments || []).find((a) => a.section_key === section);
            return {
                id: row.id,
                title: row.title,
                description: row.description,
                asset_type: row.asset_type,
                mime_type: row.mime_type,
                file_size: row.file_size,
                tags: row.tags,
                age_min: row.age_min,
                age_max: row.age_max,
                age_band: row.age_band,
                featured: Boolean(assignment?.featured),
                sort_order: assignment?.sort_order ?? 0,
                preview_kind: previewKind(row.mime_type),
                has_cover: Boolean(row.cover_path || row.cover_url),
                cover_url: row.cover_path ? null : row.cover_url,
            };
        });
        return NextResponse.json({ assets });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load this shelf';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
