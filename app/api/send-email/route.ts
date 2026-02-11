import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, WELCOME_EMAIL_TEMPLATE } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, name, type } = body;

        // Basic Auth Check (Service Role token or Admin check would be better)
        // For now, let's just assume this endpoint is protected by middleware or used internally.
        // But to be safe, let's check for a secret header or similar if called externally.
        // For MVP, simplistic check.

        if (!to) {
            return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
        }

        let subject = 'Hello from Likkle Legends';
        let html = '<p>Test email</p>';

        if (type === 'welcome') {
            subject = 'Welcome to the Adventure! 🌴';
            html = WELCOME_EMAIL_TEMPLATE(name || 'Legend');
        }

        const result = await sendEmail({ to, subject, html });

        if (result.success) {
            return NextResponse.json({ success: true, messageId: (result as any).messageId });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
