
import { NextRequest, NextResponse } from 'next/server';
import { IslandBrainOrchestrator } from '@/lib/agent-orchestrator';
import { ContentRequest, MonthlyDropRequest } from '@/lib/types';

const orchestrator = new IslandBrainOrchestrator(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const dropRequest: MonthlyDropRequest = body;

        if (!dropRequest.island_id || !dropRequest.month || !dropRequest.host_character_id) {
            return NextResponse.json({ error: "Missing required fields for monthly drop" }, { status: 400 });
        }

        // Map to internal ContentRequest
        const contentRequest: ContentRequest = {
            family_id: dropRequest.family_id,
            island_id: dropRequest.island_id,
            mode: 'parent_mode', // Monthly drops are always parent-initiated
            content_type: 'monthly_drop_bundle',
            topic: `Monthly Bundle for ${dropRequest.month}. Theme hint: ${dropRequest.theme_hint || "General Cultural Celebration"}`,
            host_character_id: dropRequest.host_character_id,
            constraints: {
                cultural_density: "medium", // Defaults
                dialect_level: "light"
            }
        };

        const result = await orchestrator.generateContent(contentRequest);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Monthly Drop Generation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
