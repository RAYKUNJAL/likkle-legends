
import { NextRequest, NextResponse } from 'next/server';
import { anansiOrchestrator } from '@/lib/ai-content-generator/orchestrator';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
    try {
        // SECURITY: Extract user ID from authenticated session only
        const authenticatedUser = await getAuthenticatedUser(req);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: 'Unauthorized - Authentication required' },
                { status: 401 }
            );
        }

        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Missing message" }, { status: 400 });
        }

        console.log(`🧠 Brain Request from User: ${authenticatedUser.id}`);

        const response = await anansiOrchestrator.processRequest(authenticatedUser.id, message);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Brain API Error:", error);
        return NextResponse.json({
            error: "Anansi is having a quick nap. Try again in a moment!",
            details: error.message
        }, { status: 500 });
    }
}
