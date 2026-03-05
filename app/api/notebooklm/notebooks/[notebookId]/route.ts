import { NextRequest, NextResponse } from 'next/server';
import { deleteNotebook, listNotebookSources } from '@/lib/services/notebooklm-enterprise';

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
            { success: false, error: error?.message || 'Failed to load notebook sources' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { notebookId: string } }
) {
    try {
        const parent = request.nextUrl.searchParams.get('parent') || undefined;
        await deleteNotebook(params.notebookId, parent);
        return NextResponse.json({ success: true, deleted: params.notebookId });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to delete notebook' },
            { status: 500 }
        );
    }
}
