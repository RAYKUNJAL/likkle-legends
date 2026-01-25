
import '../lib/load-env';
import { sendEmail } from '../lib/email';
import { Resend } from 'resend';

async function testEmail() {
    console.log('📧 Testing Email Configuration...');

    // 1. Check API Key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing from environment variables.');
        return;
    }
    console.log(`✅ key found: ${apiKey.substring(0, 5)}...`);

    // 2. Direct Resend Test (Bypassing our wrapper first to isolate)
    try {
        console.log('Attempting direct Resend send...');
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: 'legends@likklelegends.com',
            to: ['raykunjal@gmail.com'], // Hardcoded to user for test
            subject: 'Likkle Legends Tech Test 🤖',
            html: '<p>If you see this, the API key works!</p>'
        });

        if (error) {
            console.error('❌ Direct Send Failed:', error);

            // Fallback attempt: Try sending from 'onboarding@resend.dev'
            if (error.message?.includes('domain')) {
                console.log('⚠️ Domain issue detected. Trying fallback domain onboarding@resend.dev...');
                const { data: fallbackData, error: fallbackError } = await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: ['raykunjal@gmail.com'],
                    subject: 'Likkle Legends Fallback Test 🧪',
                    html: '<p>This is from the fallback domain because the custom domain failed.</p>'
                });

                if (fallbackError) console.error('❌ Fallback Failed:', fallbackError);
                else console.log('✅ Fallback Succeeded! ID:', fallbackData?.id);
            }

        } else {
            console.log('✅ Direct Send Succeeded! ID:', data?.id);
        }

    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

testEmail();
