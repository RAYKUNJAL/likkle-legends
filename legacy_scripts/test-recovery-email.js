
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

// --- THE REVENUE RECOVERY TEMPLATE ---
// Replicating de logic from lib/email.ts to ensure it works in de standalone script
const VALUE_PIN_PATOIS = `
    <div style="background: #f0fdf4; border: 2px dashed #22c55e; padding: 25px; border-radius: 24px; margin: 30px 0;">
        <span style="font-size: 10px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 5px;">Word of de Day 🌴</span>
        <h3 style="margin: 0; color: #14532d; font-size: 24px; font-weight: 900;">"Likkle"</h3>
        <p style="margin: 5px 0 0 0; color: #166534; font-size: 15px;">Meaning: Small or little. In our village, we say <i>"Likkle but tallawah"</i>—small but mighty!</p>
    </div>
`;

const SOCIAL_TRUST_FOOTER = `
    <div style="text-align: center; margin-top: 40px; padding-top: 40px; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #64748b; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Trusted by 5,000+ Island Families 🌺</p>
        <p style="font-size: 11px; color: #94a3b8;">"Finally, a cultural app that my kids actually love." — Proud Parent</p>
    </div>
`;

const ABANDONED_CHECKOUT_TEMPLATE = (userName, planName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; background: white; line-height: 1.6; }
        .btn { display: inline-block; padding: 22px 44px; background: #FF6B35; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(255,107,53,0.3); }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 40px auto; border: 4px solid #fecaca; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
        <div style="background: #fee2e2; padding: 40px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 900; color: #ef4444; margin: 0;">Don't leave de village yet! 🏝️</h1>
        </div>
        <div style="padding: 40px;">
            <p style="font-size: 18px; font-weight: 800; color: #0f172a;">Hi ${userName},</p>
            <p style="color: #475569;">One more step and your little legend can start creating magic stories in the <b>${planName || 'Legends Plus'}</b> village.</p>
            
            <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin: 30px 0; border: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">"The look on my son's face when he saw himself in the story was worth every penny. He finally feels represented."</p>
                <p style="margin: 5px 0 0 0; font-weight: 800; font-size: 12px; color: #1e293b;">— Michelle, Parent from Brooklyn</p>
            </div>

            <p style="font-weight: 700; color: #1e293b;">Finish your sign-up now and we'll unlock a special <b>Bonus Island Printable</b> kit as a welcome gift!</p>

            <center style="margin: 40px 0;">
                <a href="https://likklelegends.com/checkout" class="btn">Finish My Adventure</a>
            </center>
            
            ${VALUE_PIN_PATOIS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
</body>
</html>
`;

async function testRecoveryEmail() {
    console.log('Sending Abandoned Checkout Recovery test to raykunjal@gmail.com...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Likkle Legends <onboarding@resend.dev>',
            to: ['raykunjal@gmail.com'],
            subject: '🏝️ Don\'t leave de village! Your special gift is waiting...',
            html: ABANDONED_CHECKOUT_TEMPLATE('Ray', 'Legends Plus Yearly')
        });

        if (error) {
            console.error('Failed to send recovery email:', error);
            return;
        }

        console.log('Success! Recovery Email sent. ID:', data.id);
        console.log('Check your raykunjal@gmail.com inbox to see de recovery magic!');
    } catch (e) {
        console.error('An unexpected error occurred:', e);
    }
}

testRecoveryEmail();
