
import '../lib/load-env';
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

    const resend = new Resend(apiKey);
    const toEmail = 'raykunjal@gmail.com'; // User's email from the prompt

    // 2. Try Custom Domain first
    try {
        console.log(`Attempting send from legends@likklelegends.com to ${toEmail}...`);
        const { data, error } = await resend.emails.send({
            from: 'legends@likklelegends.com',
            to: [toEmail],
            subject: 'Likkle Legends Debug Test 🚀',
            html: '<p>Testing custom domain delivery.</p>'
        });

        if (error) {
            console.error('❌ Custom Domain Send Failed:', error);
            throw error;
        } else {
            console.log('✅ Custom Domain Succeeded! ID:', data?.id);
        }
    } catch (e) {
        // 3. Try Fallback
        try {
            console.log(`Attempting fallback send from onboarding@resend.dev to ${toEmail}...`);
            const { data, error } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: [toEmail],
                subject: 'Likkle Legends Fallback Test 🧪',
                html: '<p>Testing fallback delivery.</p>'
            });

            if (error) {
                console.error('❌ Fallback Failed:', error);
            } else {
                console.log('✅ Fallback Succeeded! ID:', data?.id);
            }
        } catch (fbError) {
            console.error('❌ Fallback Exception:', fbError);
        }
    }
}

testEmail();
