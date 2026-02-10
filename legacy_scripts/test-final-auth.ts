import '../lib/load-env';
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE } from '../lib/email';
import { supabaseAdmin } from '../lib/supabase-client';

async function test() {
    console.log('--- TEST START ---');
    console.log('sendEmail:', typeof sendEmail);

    if (typeof sendEmail !== 'function') {
        console.error('sendEmail is not a function');
        return;
    }

    const email = 'raykunjal@gmail.com';
    const result = await sendEmail({
        to: email,
        subject: 'Final Auth Test',
        html: CONFIRMATION_EMAIL_TEMPLATE('Ray', 'https://likklelegends.com')
    });
    console.log('Result:', result);
    console.log('--- TEST END ---');
}

test();
