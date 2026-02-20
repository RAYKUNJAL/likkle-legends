
import { NextRequest, NextResponse } from 'next/server';
import { anansiOrchestrator } from '@/lib/ai-content-generator/orchestrator';

export async function POST(req: NextRequest) {
    try {
        const { userId, message } = await req.json();

        if (!userId || !message) {
            return NextResponse.json({ error: "Missing userId or message" }, { status: 400 });
        }

        console.log(`🧠 Brain Request from User: ${userId}`);

        const response = await anansiOrchestrator.processRequest(userId, message);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Brain API Error:", error);
        return NextResponse.json({
            error: "Anansi is having a quick nap. Try again in a moment!",
            details: error.message
        }, { status: 500 });
    }
}
