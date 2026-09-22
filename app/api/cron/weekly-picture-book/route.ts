import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
    originalMarketManuscript,
    publishIllustratedBook,
    safeDraftPath,
    validateManuscript,
    weekDraftName,
} from '@/lib/weekly-picture-book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === 'publish' ? 'publish' : 'draft';

    if (mode === 'draft') {
        const relative = weekDraftName();
        const full = path.join(process.cwd(), relative);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        if (!fs.existsSync(full)) {
            const manuscript = originalMarketManuscript();
            const errors = validateManuscript(manuscript);
            if (errors.length) {
                return NextResponse.json({ ok: false, published: false, errors }, { status: 422 });
            }
            fs.writeFileSync(full, JSON.stringify(manuscript, null, 2) + '\n');
        }
        return NextResponse.json({
            ok: true,
            published: false,
            manuscript: relative,
            message: 'Draft only. Publish after the cover and every page are illustrated.',
        });
    }

    const relative = typeof body?.manuscript === 'string' ? safeDraftPath(body.manuscript) : null;
    if (!relative) {
        return NextResponse.json({ error: 'manuscript must be a JSON file inside content/weekly-drafts' }, { status: 400 });
    }
    const full = path.join(process.cwd(), relative);
    if (!fs.existsSync(full)) {
        return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }
    const result = publishIllustratedBook(JSON.parse(fs.readFileSync(full, 'utf8')));
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
