import { Resend } from 'resend';
import 'dotenv/config';

async function testResend() {
    const apiKey = process.env.RESEND_API_KEY;
    console.log('Testing Resend with key:', apiKey?.substring(0, 10) + '...');

    if (!apiKey) {
        console.error('No API key found!');
        return;
    }

    const resend = new Resend(apiKey);
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'raykunjal@gmail.com',
            subject: 'Test API Key',
            html: '<p>Testing API key validity.</p>'
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('Resend Success:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

testResend();
