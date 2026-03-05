import { NextRequest, NextResponse } from 'next/server';
import { addNotebookSource, listNotebookSources } from '@/lib/services/notebooklm-enterprise';

export async function GET(
    request: NextRequest,
    { params }: { params: { notebookId: string } }
) {
    try {
        const parent = request.nextUrl.searchParams.get('parent') || undefined;
        const data = await listNotebookSources(params.notebookId, parent);
        return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to list sources' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { notebookId: string } }
) {
    try {
        const body = await request.json();
        const parent = body?.parent as string | undefined;
        const uri = String(body?.uri || '').trim();
        if (!uri) {
            return NextResponse.json({ success: false, error: 'uri is required' }, { status: 400 });
        }

        const source = await addNotebookSource(
            params.notebookId,
            {
                uri,
                title: body?.title ? String(body.title) : undefined,
                mimeType: body?.mimeType ? String(body.mimeType) : undefined,
                sourceType: body?.sourceType ? String(body.sourceType) : undefined,
            },
            parent
        );

        return NextResponse.json({ success: true, source });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to add source' },
            { status: 500 }
        );
    }
}
