import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE } from '../lib/email';
import * as emailModule from '../lib/email';

console.log('--- DIAGNOSTIC_IMPORTS ---');
console.log('emailModule keys:', Object.keys(emailModule));
console.log('sendEmail from destructuring:', typeof sendEmail);
console.log('sendEmail from module:', typeof emailModule.sendEmail);
console.log('--- END DIAGNOSTIC_IMPORTS ---\n');

async function diagnoseAuth(email: string) {
    console.log(`🔍 Starting Auth Diagnosis for: ${email}`);

    // 1. Check Env Vars
    console.log('\n--- 1. Environment Variables ---');
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'RESEND_API_KEY',
        'NEXT_PUBLIC_APP_URL'
    ];

    requiredVars.forEach(v => {
        const val = process.env[v];
        console.log(`${v}: ${val ? '✅ Found (' + val.substring(0, 8) + '...)' : '❌ MISSING'}`);
    });

    // 2. Supabase Connection & Service Role Permissions
    console.log('\n--- 2. Supabase Connectivity ---');
    try {
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        if (userError) {
            console.log(`⚠️ User not found or error: ${userError.message}`);
        } else {
            console.log(`✅ User found: ${user.user.id}`);
        }

        console.log('Generating confirmation link...');
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: email,
            password: 'DebugPassword123!',
            options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` }
        });

        if (linkError) {
            console.error('❌ Link Generation Failed:', linkError.message);
            if (linkError.message.includes('Email confirmations are disabled')) {
                console.log('👉 FIX: Go to Supabase Dashboard > Auth > Providers > Email and ENABLE "Confirm Email"');
            }
        } else {
            console.log('✅ Link Generated Successfully!');
            const actionLink = linkData.properties?.action_link;
            console.log(`🔗 Link: ${actionLink?.substring(0, 50)}...`);

            // 3. Resend Sending
            console.log('\n--- 3. Resend Delivery ---');
            const emailResult = await sendEmail({
                to: email,
                subject: "DIAGNOSTIC: Confirm your Likkle Legends account",
                html: CONFIRMATION_EMAIL_TEMPLATE("Legend Tester", actionLink)
            });

            if (emailResult.success) {
                console.log('✅ Resend reported SUCCESS!');
                if ((emailResult as any).mode === 'fallback') {
                    console.log('⚠️  WARNING: Sent via FALLBACK (onboarding@resend.dev).');
                    console.log('👉 This only works if the recipient is the Resend account owner.');
                }
                console.log('👉 Verification: Check your inbox NOW. If not there, check Spam and Resend Dashboard Logs.');
            } else {
                console.error('❌ Resend reported FAILURE:', emailResult.error);
                if ((emailResult as any).isUnverified) {
                    console.log('👉 FIX: Your domain likklelegends.com is NOT verified in Resend. Check DNS settings.');
                }
            }
        }
    } catch (err: any) {
        console.error('💥 Unexpected Diagnostic Error:', err.message);
    }
}

const targetEmail = process.argv[2] || 'raykunjal@gmail.com';
diagnoseAuth(targetEmail);
