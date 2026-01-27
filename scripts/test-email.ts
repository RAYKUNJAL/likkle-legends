
import * as dotenv from 'dotenv';
import path from 'path';
// Determine the path to .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

import { sendEmail, WELCOME_EMAIL_TEMPLATE } from '../lib/email';

async function testEmail() {
    console.log('--- EMAIL TEST ---');
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Missing RESEND_API_KEY');
        return;
    }

    const testEmail = 'raykunjal@gmail.com'; // Use a safe test email or the one from previous context if known/safe
    // Ideally use a throwaway or the user's email if safe. I'll use a placeholder that clearly indicates test.
    // Actually, I should use a generic one or ask user?
    // User said "it not working not sending emails".
    // I will try to send to a generic test email or just check for errors.
    // But Resend in test mode only sends to the verified email.
    // The previous logs mentioned "Domain likklelegends.com is not verified... emails can only be sent to registered owner".
    // So I should probably try to send to the owner's email if I knew it, or just see the error.

    const targetEmail = 'onboarding@resend.dev'; // Try the test email provided by Resend if possible, or a real one.
    // Let's try a dummy first.

    console.log(`Sending to ${targetEmail}...`);

    const result = await sendEmail({
        to: targetEmail,
        subject: 'Test Email from Debug Script',
        html: '<p>This is a test email.</p>'
    });

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
        console.log('✅ Email sent successfully');
    } else {
        console.error('❌ Email failed');
    }
}

testEmail();
