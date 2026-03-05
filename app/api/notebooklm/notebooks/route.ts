import { NextRequest, NextResponse } from 'next/server';
import {
    createNotebook,
    listNotebooks,
    getNotebookLMSetupStatus,
} from '@/lib/services/notebooklm-enterprise';

export async function GET(request: NextRequest) {
    try {
        const parent = request.nextUrl.searchParams.get('parent') || undefined;
        const data = await listNotebooks(parent);
        return NextResponse.json({
            success: true,
            setup: getNotebookLMSetupStatus(),
            ...data,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                setup: getNotebookLMSetupStatus(),
                error: error?.message || 'Failed to list notebooks',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parent = body?.parent as string | undefined;
        const displayName = String(body?.displayName || '').trim();
        const description = body?.description ? String(body.description) : undefined;
        const notebookId = body?.notebookId ? String(body.notebookId) : undefined;
        const metadata = body?.metadata && typeof body.metadata === 'object'
            ? body.metadata
            : undefined;

        if (!displayName) {
            return NextResponse.json(
                { success: false, error: 'displayName is required' },
                { status: 400 }
            );
        }

        const notebook = await createNotebook(
            { displayName, description, notebookId, metadata },
            parent
        );

        return NextResponse.json({ success: true, notebook });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                setup: getNotebookLMSetupStatus(),
                error: error?.message || 'Failed to create notebook',
            },
            { status: 500 }
        );
    }
}
