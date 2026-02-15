
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

const FROM_EMAIL = 'Likkle Legends <noreply@likklelegends.com>';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

// --- CRO REVENUE BLOCKS (The Million Dollar Framework) ---

const VALUE_PIN_PATOIS = `
    <div style="background: #f0fdf4; border: 2px dashed #22c55e; padding: 25px; border-radius: 24px; margin: 30px 0;">
        <span style="font-size: 10px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 5px;">Word of de Day 🌴</span>
        <h3 style="margin: 0; color: #14532d; font-size: 24px; font-weight: 900;">"Likkle"</h3>
        <p style="margin: 5px 0 0 0; color: #166534; font-size: 15px;">Meaning: Small or little. In our village, we say <i>"Likkle but tallawah"</i>—small but mighty!</p>
    </div>
`;

const UPSELL_LEGENDS_PLUS = `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 35px; border-radius: 32px; color: white; margin: 40px 0; text-align: center;">
        <h3 style="margin: 0; font-size: 22px; font-weight: 900;">Unlock de Full Magic 🔓</h3>
        <p style="color: #94a3b8; font-size: 14px; margin: 10px 0 25px 0;">Get unlimited stories, printable missions, and personalized AI adventures for your little legend.</p>
        <a href="https://likklelegends.com/pricing" style="background: #fcd34d; color: #000 !important; padding: 15px 30px; border-radius: 16px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 14px; display: inline-block;">Start Free Trial</a>
    </div>
`;

const SOCIAL_TRUST_FOOTER = `
    <div style="text-align: center; margin-top: 40px; padding-top: 40px; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #64748b; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Trusted by 5,000+ Island Families 🌺</p>
        <p style="font-size: 11px; color: #94a3b8;">"Finally, a cultural app that my kids actually love." — Proud Parent</p>
    </div>
`;

// --- EMAIL SENDER ---

export async function sendEmail({ to, subject, html }: EmailPayload) {
    const resend = getResend();

    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Email not sent.', { to, subject });
        return { success: false, error: 'Missing Resend API Key' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('SendEmail error:', error);
        return { success: false, error: String(error) };
    }
}

// --- TEMPLATES ---

// 1. WELCOME EMAIL
export const WELCOME_EMAIL_TEMPLATE = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fffdf7; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 40px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #FF6B35, #FFB627, #10b981); padding: 50px 40px; text-align: center; color: white; }
        .btn { display: inline-block; padding: 20px 40px; background: #FF6B35; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; text-transform: uppercase; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="border-radius: 0 0 40px 40px;">
            <h1 style="margin:0; font-size: 32px; font-weight: 900;">Welcome to de Village, ${userName}! 🌴</h1>
        </div>
        <div style="padding: 50px 40px;">
            <p style="font-size: 18px; font-weight: 800; color: #0f172a;">Your journey into Caribbean excellence starts today.</p>
            <p>At Likkle Legends, we don't just teach—we celebrate culture. Your child is now part of a global village where stories come alive and heritage is a superpower.</p>

            ${VALUE_PIN_PATOIS}

            <h3 style="margin-top: 40px; color: #1e293b;">How to start de fun:</h3>
            <div style="background: #f8fafc; padding: 20px; border-radius: 20px; margin-bottom: 20px;">
                <b style="color: #FF6B35;">1. Story Studio</b> - Create a custom legend with your child.
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">It's de #1 favorite feature for our members!</p>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 20px; margin-bottom: 20px;">
                <b style="color: #10b981;">2. Island Radio</b> - Play authentic rhythms while you learn.
            </div>

            <center><a href="https://likklelegends.com/portal" class="btn">Explore de Portal</a></center>

            ${UPSELL_LEGENDS_PLUS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
</body>
</html>
`;

// 2. ONBOARDING DAY 2 (The Pro-Tips)
export const ONBOARDING_DAY_2_TEMPLATE = (userName: string, childName?: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 40px; overflow: hidden; }
        .btn { display: inline-block; padding: 18px 36px; background: #A855F7; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div style="padding: 50px 40px;">
            <span style="color: #A855F7; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Village Pro-Tip 💡</span>
            <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin-top: 10px;">Make ${childName || 'Your Kid'} de Hero!</h1>
            <p style="font-size: 17px; line-height: 1.8; color: #475569;">
                Did you know you can create a story where your child visits Tanty Spice or goes on a quest to find a hidden waterfall?
            </p>
            
            <div style="background: #faf5ff; border-radius: 30px; padding: 30px; margin: 30px 0;">
                <h4 style="margin:0; color: #7e22ce;">Today's Activity:</h4>
                <p style="font-size: 15px; margin: 10px 0;">Sit with your little legend and ask: "If we could visit any Caribbean island today, where should we go?" Then type it into de **Story Studio**!</p>
            </div>

            <center><a href="https://likklelegends.com/portal/story-studio" class="btn">Start Magic Story</a></center>

            ${VALUE_PIN_PATOIS}
            ${UPSELL_LEGENDS_PLUS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
</body>
</html>
`;

// 3. ABANDONED CHECKOUT (Revenue Recovery)
export const ABANDONED_CHECKOUT_TEMPLATE = (userName: string, planName?: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: white; }
        .btn { display: inline-block; padding: 22px 44px; background: #FF6B35; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; text-transform: uppercase; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 40px auto; border: 4px solid #fecaca; border-radius: 40px; overflow: hidden;">
        <div style="background: #fee2e2; padding: 40px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 900; color: #ef4444; margin: 0;">Don't leave de village yet! 🏝️</h1>
        </div>
        <div style="padding: 40px;">
            <p style="font-size: 18px; font-weight: 800;">Hi ${userName},</p>
            <p>One more step and your little legend can start creating magic stories in the <b>${planName || 'Legends Plus'}</b> village.</p>
            
            <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">"The look on my son's face when he saw himself in the story was worth every penny. He finally feels represented."</p>
                <p style="margin: 5px 0 0 0; font-weight: 800; font-size: 12px; color: #1e293b;">— Michelle, Parent from Brooklyn</p>
            </div>

            <p style="font-weight: 700;">Finish your sign-up now and we'll unlock a special <b>Bonus Island Printable</b> kit as a welcome gift!</p>

            <center><a href="https://likklelegends.com/checkout" class="btn">Finish My Adventure</a></center>
            
            ${VALUE_PIN_PATOIS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
    </div>
</body>
</html>
`;

// 3.5 EMAIL VERIFICATION (Magic Link)
export const CONFIRMATION_EMAIL_TEMPLATE = (name: string, link: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; }
        .btn { display: inline-block; padding: 18px 36px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 12px; font-weight: 700; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px;">
        <h2 style="margin-top: 0; color: #1e293b;">Confirm your Likkle Legends Login 🌴</h2>
        <p>Hi ${name},</p>
        <p>Click the magic link below to sign in instantly:</p>
        <div style="margin: 30px 0;">
            <a href="${link}" class="btn">Sign In Now</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    </div>
</body>
</html>
`;

// 4. SUBSCRIPTION CONFIRMATION
export const SUBSCRIPTION_CONFIRMATION_TEMPLATE = (name: string, tier?: string, childName?: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fdfbf7; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 40px; }
        .header { background: #059669; color: white; padding: 40px; text-align: center; }
        .card { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 24px; padding: 30px; margin: 30px 0; }
        .btn { display: inline-block; padding: 20px 40px; background: #059669; color: white !important; text-decoration: none; border-radius: 16px; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="border-radius: 0 0 40px 40px;">
            <h1 style="margin:0; font-size: 28px; font-weight: 900;">You're a Legend Now! ✅</h1>
        </div>
        <div style="padding: 40px;">
            <p style="font-size: 18px; font-weight: 800; color: #064e3b;">Welcome to the Inner Circle, ${name}!</p>
            <p>Your subscription is active and ${childName || 'your child'} is officially a Likkle Legend. You've unlocked the full magic of the Caribbean.</p>
            
            <div class="card">
                <span style="font-size: 10px; font-weight: 900; color: #065f46; text-transform: uppercase;">Membership Status</span>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <span style="font-size: 22px; font-weight: 900; color: #047857;">${tier || 'Legends Plus'}</span>
                    <span style="background: #059669; color: white; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 800;">ACTIVE</span>
                </div>
            </div>

            <center><a href="https://likklelegends.com/portal" class="btn">Enter de Village</a></center>

            ${VALUE_PIN_PATOIS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
</body>
</html>
`;

// 5. MUSIC PURCHASE RECEIPT
export const MUSIC_PURCHASE_RECEIPT = (name: string, items: { title: string, price: string }[], total: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fdfbf7; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 40px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 50px 40px; text-align: center; color: white; }
        .item-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .btn { display: inline-block; padding: 20px 40px; background: #7C3AED; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900;">The Riddim is Ready! 🎵</h1>
        </div>
        <div style="padding: 40px;">
            <p style="font-size: 18px; font-weight: 800; color: #0f172a;">Hi ${name},</p>
            <p>Thanks for supporting Caribbean culture! Your music is ready to be played.</p>
            
            <div style="background: #f8fafc; border-radius: 24px; padding: 25px; margin: 24px 0;">
                ${items.map(item => `
                    <div class="item-row">
                        <span>${item.title}</span>
                        <span style="font-weight: 800;">$${item.price}</span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                    <span style="font-weight: 900; font-size: 18px;">Total</span>
                    <span style="font-weight: 900; color: #7C3AED; font-size: 18px;">$${total}</span>
                </div>
            </div>

            <center><a href="https://likklelegends.com/portal/store" class="btn">Access My Music</a></center>

            ${UPSELL_LEGENDS_PLUS}
            ${SOCIAL_TRUST_FOOTER}
        </div>
    </div>
</body>
</html>
`;

// 6. RESET PASSWORD
export const RESET_PASSWORD_EMAIL_TEMPLATE = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fffdf7; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 40px; overflow: hidden; border: 1px solid #f1f5f9; }
        .btn { display: inline-block; padding: 18px 36px; background: #0f172a; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; }
    </style>
</head>
<body>
    <div class="container">
        <div style="padding: 40px; text-align: center;">
            <h1 style="margin:0; font-size: 24px; font-weight: 900; color: #ff6b35;">Likkle Legends</h1>
            <h2 style="font-size: 28px; font-weight: 900; color: #0f172a; margin-top: 20px;">Reset Your Magic Key</h2>
            <p>Hi ${name}, forgot your entrance to de village? Click below to set a new password.</p>
            <a href="${resetLink}" class="btn">Reset Password</a>
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">This link will expire in 1 hour.</p>
        </div>
    </div>
</body>
</html>
`;

// 7. SUPPORT REPLY
export const SUPPORT_REPLY_TEMPLATE = (parentName: string, originalSubject: string, replyText: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: white; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #f1f5f9; border-radius: 24px; padding: 40px;">
        <h2 style="color: #2563eb;">Re: ${originalSubject || 'Your Village Request'}</h2>
        <p>Hi ${parentName},</p>
        <p>Thank you for reaching out! Here's de update from de village:</p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 25px; border-radius: 12px; margin: 20px 0;">
            ${replyText.replace(/\n/g, '<br>')}
        </div>
        <p>Warm regards,<br><b>The Likkle Legends Team</b> 🌴</p>
        ${UPSELL_LEGENDS_PLUS}
    </div>
</body>
</html>
`;

// 8. WIN BACK (Retention)
export const WIN_BACK_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; }
        .btn { display: inline-block; padding: 20px 40px; background: #ec4899; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; border: 4px solid #fce7f3; border-radius: 40px; overflow: hidden; padding: 40px; text-align: center;">
        <h1 style="color: #be185d; font-size: 32px; font-weight: 900;">We Miss You! 💔</h1>
        <p style="font-size: 18px; color: #475569;">De island is a bit quiet without your little adventurer!</p>
        <div style="background: #fdf2f8; padding: 30px; border-radius: 24px; margin: 30px 0;">
            <p style="font-weight: 800; font-size: 20px; margin:0;">🌴 New Adventures Added!</p>
            <p>We just added 3 new Folklore Quests and a new Riddim to de Radio.</p>
        </div>
        <a href="https://likklelegends.com/portal" class="btn">Return to de Village</a>
        ${VALUE_PIN_PATOIS}
    </div>
</body>
</html>
`;

// 9. ONBOARDING DAY 7
export const ONBOARDING_DAY_7_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: white; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 40px; border: 2px solid #f1f5f9;">
        <h1 style="font-size: 32px; font-weight: 900;">7 Days of Magic! 🎉</h1>
        <p>Hi ${name}, you've been a legend for a full week now. How is de family enjoying de journey?</p>
        
        <p style="font-weight: 800;">Did you try these yet?</p>
        <ul style="padding-left: 20px;">
            <li><b>Printable Coloring Sheets</b> - Perfect for offline fun.</li>
            <li><b>Island Missions</b> - Complete quests to earn badges.</li>
        </ul>

        <center><a href="https://likklelegends.com/portal" style="background:#10b981; color:white; padding:18px 36px; border-radius:18px; text-decoration:none; font-weight:900;">Keep de Fun Going</a></center>

        ${VALUE_PIN_PATOIS}
        ${SOCIAL_TRUST_FOOTER}
    </div>
</body>
</html>
`;

// 10. ADMIN NOTIFICATION
export const ADMIN_NEW_ORDER_TEMPLATE = (parentName: string, tier: string, email: string) => `
<div style="font-family: sans-serif; padding: 20px;">
    <h2>🎉 New Legend Joined!</h2>
    <p><b>Parent:</b> ${parentName}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Tier:</b> ${tier}</p>
</div>
`;
