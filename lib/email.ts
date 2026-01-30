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

const FROM_EMAIL = 'noreply@likklelegends.com'; // Commercial Grade
// const FROM_EMAIL = 'onboarding@resend.dev';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    const resend = getResend();

    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Email not sent.', { to, subject });
        return { success: false, error: 'Missing Resend API Key' };
    }

    try {
        console.log(`[Email] Attempting to send via custom domain (${FROM_EMAIL}) to ${to}...`);
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        if (data.error) {
            console.error('[Email] Resend API error (custom domain):', data.error);
            throw data.error;
        }

        console.log(`[Email] Success! Sent via custom domain. ID: ${data.data?.id}`);
        return { success: true, data: data.data, mode: 'custom' };
    } catch (error: any) {
        const errorMsg = error.message || JSON.stringify(error);
        console.error('[Email] Primary send failed:', errorMsg);

        // Check if error is clearly a domain verification issue
        const isUnverified = errorMsg.toLowerCase().includes('not verified') ||
            errorMsg.toLowerCase().includes('unverified') ||
            errorMsg.toLowerCase().includes('onboarding@resend.dev');

        if (isUnverified) {
            console.warn('[Email] Domain legends@likklelegends.com is NOT verified in Resend dashboard.');
        }

        // Fallback to onboarding@resend.dev (only works if 'to' is the registered test email)
        try {
            console.log(`[Email] Attempting fallback to onboarding@resend.dev for ${to}...`);
            const fallbackData = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to,
                subject: `[Fallback] ${subject}`,
                html: html,
            });

            if (fallbackData.error) {
                console.error('[Email] Fallback also failed:', fallbackData.error);
                return {
                    success: false,
                    error: fallbackData.error,
                    primaryError: error,
                    isUnverified
                };
            }

            console.log(`[Email] Fallback successful! ID: ${fallbackData.data?.id}`);
            return {
                success: true,
                data: fallbackData.data,
                mode: 'fallback',
                isUnverified
            };
        } catch (fallbackError) {
            console.error('[Email] Fallback exception:', fallbackError);
            return {
                success: false,
                error: fallbackError,
                primaryError: error,
                isUnverified
            };
        }
    }
}

// Templates

export const WELCOME_EMAIL_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF9F1C, #FF4081); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #FF4081, #FF9F1C); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Likkle Legends! 🌴</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>We're so excited to have you join our Caribbean adventure! 🌺</p>
            <p>Your journey into the magical world of Likkle Legends begins now. Get ready for:</p>
            <ul>
                <li>✨ Interactive Island Stories</li>
                <li>🎵 Caribbean Songs & Rhythms</li>
                <li>🎮 Fun-filled Learning Games</li>
                <li>🎯 Daily Missions to test your skills</li>
            </ul>
            <p>Ready to start?</p>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Go to Portal</a>
            </center>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends Mail Club. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const CONFIRMATION_EMAIL_TEMPLATE = (name: string, confirmationLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background: #fffdf7; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .header { background: #0f172a; padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; text-align: center; }
        .welcome-text { font-size: 14px; font-weight: 800; color: #ff6b35; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: block; }
        .title { font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 20px 0; line-height: 1.1; }
        .description { font-size: 16px; color: #64748b; margin-bottom: 30px; }
        .button { display: inline-block; padding: 20px 40px; background: #ff6b35; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(255,107,53,0.3); transition: all 0.3s ease; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 40px; background: #f8fafc; }
        .link-text { font-size: 12px; color: #94a3b8; margin-top: 30px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-family: 'Arial Black', sans-serif;">Likkle Legends</h1>
        </div>
        <div class="content">
            <span class="welcome-text">Adventure is calling</span>
            <h2 class="title">Confirm Your Village Account</h2>
            <p class="description">Hi ${name}, welcome to the club! We're so excited to have you join our Caribbean journey. Click the button below to verify your email and start your adventure.</p>
            
            <a href="${confirmationLink}" class="button">Confirm Account</a>
            
            <p class="link-text">
                If the button doesn't work, copy and paste this link into your browser:<br>
                ${confirmationLink}
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Safe for kids. Trusted by parents. 🛡️</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;

export const ONBOARDING_DAY_2_TEMPLATE = (name: string, childName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4CAF50, #2196F3); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .tip-box { background: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; padding: 14px 28px; background: #4CAF50; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Day 2: Getting Started Tips 🚀</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>How's ${childName || 'your little legend'} enjoying the adventure so far?</p>
            <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Try starting with the Story Studio! It creates personalized stories featuring ${childName || 'your child'}'s name and their favorite Caribbean island.
            </div>
            <p>Here are 3 things to try today:</p>
            <ol>
                <li>🎵 Listen to a Caribbean nursery rhyme together</li>
                <li>📖 Create your first personalized story</li>
                <li>🏆 Complete a fun mission to earn XP</li>
            </ol>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Continue the Adventure</a>
            </center>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Safe for kids. Trusted by parents. 🛡️</p>
            <p style="font-size: 10px; color: #94a3b8; margin-top: 10px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal/settings" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const ONBOARDING_DAY_7_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #9C27B0, #673AB7); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .progress { background: #f0f0f0; border-radius: 20px; height: 20px; margin: 20px 0; overflow: hidden; }
        .progress-bar { background: linear-gradient(90deg, #9C27B0, #E91E63); height: 100%; width: 15%; border-radius: 20px; }
        .button { display: inline-block; padding: 14px 28px; background: #9C27B0; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>One Week In! 🎉</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>It's been a week since you joined Likkle Legends! Here's how to make the most of your membership:</p>
            <p><strong>Your Progress:</strong></p>
            <div class="progress"><div class="progress-bar"></div></div>
            <p style="text-align: center; color: #666;">Keep going to unlock badges!</p>
            <p>Have you tried these features yet?</p>
            <ul>
                <li>🌴 VR Island Explorer</li>
                <li>🎮 Cultural Games</li>
                <li>📄 Printable Coloring Pages</li>
            </ul>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Explore Now</a>
            </center>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends.</p>
        </div>
    </div>
</body>
</html>
`;

export const ABANDONED_CHECKOUT_TEMPLATE = (name: string, childName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #FF9F1C, #FF5722); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .highlight { background: #FFF3E0; border: 2px dashed #FF9F1C; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 28px; background: #FF5722; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You Left Something Behind! 🛒</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>We noticed ${childName || 'your little one'}'s adventure was paused at checkout. Don't worry – your cart is still waiting!</p>
            <div class="highlight">
                <p style="font-size: 24px; margin: 0;">🌴 Likkle Legends Subscription</p>
                <p style="color: #666; margin: 10px 0;">Personalized stories, games, and monthly mail!</p>
            </div>
            <p>Complete your order now and ${childName || 'your child'} can start exploring the Caribbean islands today!</p>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/checkout" class="button">Complete My Order</a>
            </center>
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Need help? Reply to this email and we'll assist you.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends.</p>
        </div>
    </div>
</body>
</html>
`;

export const SUBSCRIPTION_CONFIRMATION_TEMPLATE = (name: string, tier: string, childName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .order-box { background: #E8F5E9; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 28px; background: #4CAF50; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You're All Set! ✅</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! Your Likkle Legends subscription is now active. ${childName || 'Your child'} is ready to explore!</p>
            <div class="order-box">
                <p><strong>Plan:</strong> ${tier || 'Legends Plus'}</p>
                <p><strong>Status:</strong> ✅ Active</p>
                <p><strong>Next Billing:</strong> In 30 days</p>
            </div>
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>📦 Your first mail kit is being prepared!</li>
                <li>🎮 Unlimited access to the Kid Portal</li>
                <li>📖 Create personalized stories anytime</li>
            </ul>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Start Exploring</a>
            </center>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Questions? Reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

export const SUPPORT_REPLY_TEMPLATE = (parentName: string, originalSubject: string, replyText: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #2196F3, #03A9F4); padding: 20px; text-align: center; color: white; }
        .content { padding: 30px; }
        .reply-box { background: #E3F2FD; border-left: 4px solid #2196F3; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Re: ${originalSubject || 'Your Support Request'}</h2>
        </div>
        <div class="content">
            <p>Hi ${parentName},</p>
            <p>Thank you for reaching out to Likkle Legends! Here's our response:</p>
            <div class="reply-box">
                ${replyText.replace(/\n/g, '<br>')}
            </div>
            <p>If you have any more questions, simply reply to this email.</p>
            <p>Warm regards,<br><strong>The Likkle Legends Team</strong> 🌴</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends Mail Club.</p>
        </div>
    </div>
</body>
</html>
`;

export const WIN_BACK_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #E91E63, #9C27B0); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .highlight { background: #FCE4EC; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 28px; background: #E91E63; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>We Miss You! 💔</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>It's been a while since we've seen you at Likkle Legends. The islands miss your little adventurer!</p>
            <div class="highlight">
                <p style="font-size: 20px; margin: 0;">🌴 <strong>New Adventures Await!</strong></p>
                <p style="color: #666;">We've added new stories, games, and missions since your last visit.</p>
            </div>
            <p>Come back and see what's new – your progress is still saved!</p>
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal" class="button">Return to the Islands</a>
            </center>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Unsubscribe in account settings.</p>
        </div>
    </div>
</body>
</html>
`;

export const RESET_PASSWORD_EMAIL_TEMPLATE = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background: #fffdf7; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
        .header { background: #ff6b35; padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; text-align: center; }
        .title { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 20px; }
        .button { display: inline-block; padding: 18px 36px; background: #0f172a; color: white !important; text-decoration: none; border-radius: 20px; font-weight: 900; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">Likkle Legends</h1>
        </div>
        <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p>Hi ${name}, did you forget your magic key? No problem! Click the button below to set a new password for your Village account.</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>


        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Protecting our village, one legend at a time. 🛡️</p>
            <p style="font-size: 10px; color: #cbd5e1; margin-top: 20px;">
                You received this because you are a member of the Likkle Legends village.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal/settings" style="color: #94a3b8; text-decoration: underline;">Manage Email Preferences</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const ADMIN_NEW_ORDER_TEMPLATE = (parentName: string, tier: string, email: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff6b35;">🎉 New Subscription!</h2>
        <p>A new Legend has joined the village.</p>
        <div style="background: #fdf2f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Parent:</strong> ${parentName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Tier:</strong> ${tier}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Check the admin dashboard for shipping details if applicable.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Likkle Legends Internal Alert</p>
    </div>
</body>
</html>
`;

export const MUSIC_PURCHASE_RECEIPT = (name: string, items: { title: string, price: string }[], total: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #fdfbf7; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #f3e8ff; }
        .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; }
        .item-list { background: #faf5ff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e9d5ff; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #d8b4fe; }
        .item:last-child { border-bottom: none; }
        .total { display: flex; justify-content: space-between; font-weight: 900; font-size: 18px; margin-top: 10px; padding-top: 20px; border-top: 2px solid #ddd; }
        .button { display: inline-block; padding: 16px 32px; background: #7C3AED; color: white !important; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
        .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #f9f9f9; }
        .upsell { background: #fff1f2; border: 2px solid #fbcfe8; border-radius: 12px; padding: 20px; margin-top: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; font-size:24px;">Thanks for jamming with us! 🎵</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Get ready to turn up the bass! Your music is ready. 🇹🇹🇯🇲🇧🇧</p>
            
            <div class="item-list">
                ${items.map(item => `
                    <div class="item">
                        <span>${item.title}</span>
                        <span>$${item.price}</span>
                    </div>
                `).join('')}
                <div class="total">
                    <span>TOTAL</span>
                    <span>$${total}</span>
                </div>
            </div>

            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/portal/store" class="button">Download My Music</a>
            </center>

            <div class="upsell">
                <h3 style="color: #db2777; margin-top:0;">Want Unlimited Music?</h3>
                <p>Join the <strong>Legends Club</strong> and get every song, story, and game for free!</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://likklelegends.com'}/parent" style="color: #db2777; font-weight: bold;">Upgrade Membership &rarr;</a>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Likkle Legends. Keep the culture alive!</p>
        </div>
    </div>
</body>
</html>
`;
