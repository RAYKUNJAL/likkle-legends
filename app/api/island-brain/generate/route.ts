
import { NextRequest, NextResponse } from 'next/server';
import { IslandBrainOrchestrator } from '@/lib/agent-orchestrator';
import { ContentRequest } from '@/lib/types';

// Initialize orchestrator (singleton-ish)
const orchestrator = new IslandBrainOrchestrator(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // TODO: stronger schema validation (Zod)
        const request: ContentRequest = body;

        // Basic validation
        if (!request.island_id || !request.content_type || !request.family_id) {
            return NextResponse.json({ error: "Missing required fields: island_id, content_type, family_id" }, { status: 400 });
        }

        const result = await orchestrator.generateContent(request);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("IslandBrain Generation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
