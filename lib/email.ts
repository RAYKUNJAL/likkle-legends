import { Resend } from 'resend';

let _resend: Resend | null = null;

// Lazy initialization to avoid build-time errors
function getResend(): Resend | null {
    if (!_resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return null;
        _resend = new Resend(apiKey);
    }
    return _resend;
}

const FROM_EMAIL = 'legends@likklelegends.com'; // Or 'onboarding@resend.dev' for testing

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    const resend = getResend();

    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Email not sent.', { to, subject });
        return { success: false, error: 'Missing API Key' };
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

// Templates

export const WELCOME_EMAIL_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #FF9F1C, #FF4081); padding: 20px; border-radius: 10px 10px 0 0; text-align: center; color: white; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #FF4081; color: white; text-decoration: none; border-radius: 20px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Likkle Legends! 🌴</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>We're so excited to have you join our Caribbean adventure! 🌺</p>
            <p>Your journey into the magical world of Likkle Legends begins now. Get ready for:</p>
            <ul>
                <li>✨ Interactive Island Stories</li>
                <li>🎵 Caribbean Songs & Rhythms</li>
                <li>🎮 Fun-filled Learning Games</li>
                <li>🎯 Daily Missions to test your skills</li>
            </ul>
            <p>Ready to start?</p>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Go to Portal</a>
            </center>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends Mail Club. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
