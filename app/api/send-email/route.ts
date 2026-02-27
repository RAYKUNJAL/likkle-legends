import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, WELCOME_EMAIL_TEMPLATE } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        // Require CRON_SECRET header to prevent public abuse
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('Authorization');
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { to, name, type } = body;

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
