
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

const WELCOME_EMAIL_TEMPLATE = (name) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background: #fffdf7; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .header { background: linear-gradient(135deg, #FF6B35, #FFB627, #10b981); padding: 60px 40px; text-align: center; color: white; position: relative; }
        .header h1 { margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .island-chip { background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: inline-block; border: 1px solid rgba(255,255,255,0.3); }
        .content { padding: 50px 40px; text-align: left; }
        .greeting { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 10px; }
        .feature-item { background: #f8fafc; padding: 20px; border-radius: 24px; border: 1px solid #f1f5f9; margin-bottom: 15px; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; display: block; }
        .feature-title { font-weight: 800; color: #0f172a; font-size: 16px; display: block; }
        .feature-desc { font-size: 14px; color: #64748b; }
        .button { display: inline-block; padding: 22px 44px; background: #ff6b35; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(255,107,53,0.3); margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 40px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="island-chip">Branding Verification</span>
            <h1>Likkle Legends 🌴</h1>
        </div>
        <div class="content">
            <p class="greeting">Wah gwan, Ray!</p>
            <p style="font-size: 17px; color: #475569;">This is a live test of our new Caribbean-themed transactional emails. The village looks better than ever!</p>
            
            <div style="margin-top: 40px;">
                <div class="feature-item">
                    <span class="feature-icon">✨</span>
                    <span class="feature-title">Interactive Island Stories</span>
                    <span class="feature-desc">New premium layouts optimized for mobile legends.</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎵</span>
                    <span class="feature-title">Caribbean Rhythms</span>
                    <span class="feature-desc">Email receipts now include itemized beats and upsells.</span>
                </div>
            </div>

            <center>
                <a href="https://likklelegends.com" class="button">Visit the Island</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Likkle Legends. Premium Caribbean Education. 🛡️</p>
        </div>
    </div>
</body>
</html>
`;

async function testEmail() {
    console.log('Sending test email to raykunjal@gmail.com...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Likkle Legends <onboarding@resend.dev>', // Using Resend's test domain for verification
            to: ['raykunjal@gmail.com'],
            subject: '🌴 Welcome to the Village (Branding Test)',
            html: WELCOME_EMAIL_TEMPLATE('Ray')
        });

        if (error) {
            console.error('Failed to send email:', error);
            return;
        }

        console.log('Success! Email sent. ID:', data.id);
        console.log('Check your raykunjal@gmail.com inbox (and spam just in case)!');
    } catch (e) {
        console.error('An unexpected error occurred:', e);
    }
}

testEmail();
