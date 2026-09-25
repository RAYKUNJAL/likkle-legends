import { NextRequest, NextResponse } from 'next/server';
import { requireContentAdmin } from '@/lib/content-library/access';
import { isUuid } from '@/lib/content-library/form';
import { addAssignments, deleteAsset, getAsset, setPublishedMany } from '@/lib/content-library/queries';
import { parseAssignments } from '@/lib/content-library/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const auth = await requireContentAdmin(request);
    if (!auth.ok) return auth.response;

    try {
        const body = await request.json();
        const action = String(body.action || '');
        const ids = Array.isArray(body.ids) ? body.ids.map((id: unknown) => String(id)).filter(isUuid) : [];
        if (ids.length === 0) return NextResponse.json({ error: 'Choose at least one file.' }, { status: 400 });
        if (ids.length > 100) return NextResponse.json({ error: 'Select 100 files or fewer at a time.' }, { status: 400 });

        if (action === 'publish' || action === 'unpublish') {
            await setPublishedMany(ids, action === 'publish');
            return NextResponse.json({ ok: true, updated: ids.length });
        }

        if (action === 'assign') {
            const parsed = parseAssignments(body.assignments);
            if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
            if (parsed.assignments.length === 0) {
                return NextResponse.json({ error: 'Choose at least one shelf.' }, { status: 400 });
            }
            await addAssignments(ids, parsed.assignments);
            return NextResponse.json({ ok: true, updated: ids.length });
        }

        if (action === 'delete') {
            for (const id of ids) {
                const asset = await getAsset(id);
                if (asset) await deleteAsset(asset);
            }
            return NextResponse.json({ ok: true, deleted: ids.length });
        }

        return NextResponse.json({ error: 'Unknown bulk action.' }, { status: 400 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Bulk update failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
