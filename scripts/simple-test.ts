
import { config } from 'dotenv';
import { resolve } from 'path';
import { Resend } from 'resend';

config({ path: resolve(process.cwd(), '.env.local') });

async function test() {
    const apiKey = process.env.RESEND_API_KEY;
    console.log('API Key:', apiKey ? 'FOUND' : 'MISSING');
    if (!apiKey) return;

    const resend = new Resend(apiKey);
    try {
        const { data, error } = await resend.emails.send({
            from: 'legends@likklelegends.com',
            to: ['raykunjal@gmail.com'],
            subject: 'Direct Test',
            html: '<p>Hi</p>'
        });
        console.log('Data:', data);
        console.log('Error:', error);
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
