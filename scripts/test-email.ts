
import '../lib/load-env';
import { sendEmail } from '../lib/email';

async function testEmail() {
    console.log('Testing Resend Email...');
    const result = await sendEmail({
        to: 'raykunjal@gmail.com', // Sending to the user's email for testing
        subject: 'Branding Test - Likkle Legends',
        html: '<h1>Adventure Awaits!</h1><p>This is a branding test for Likkle Legends.</p>'
    });
    console.log('Result:', JSON.stringify(result, null, 2));
}

testEmail();
