import { NextResponse } from 'next/server';
import { getNotebookLMSetupStatus } from '@/lib/services/notebooklm-enterprise';

export async function GET() {
    const setup = getNotebookLMSetupStatus();
    const ready = setup.hasParent && (setup.hasBearerToken || setup.hasServiceAccount);
    return NextResponse.json({
        success: true,
        ready,
        setup,
        notes: [
            'NotebookLM Enterprise uses OAuth bearer tokens (not raw Gemini API keys).',
            'Set NOTEBOOKLM_PARENT plus either NOTEBOOKLM_BEARER_TOKEN or service account env vars.',
        ],
    });
}
