
"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-client";
import { dispatchExternalMessage } from "@/lib/services/messenger";

/**
 * Sends a 6-digit OTP via WhatsApp
 */
export async function sendWhatsAppOtpAction(phone: string) {
    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 1. Store code in DB
        const { error: dbError } = await supabaseAdmin
            .from('otp_codes')
            .insert({
                phone,
                code,
                expires_at: expiresAt.toISOString()
            });

        if (dbError) throw dbError;

        // 2. Dispatch via WhatsApp
        // Note: For production, use a registered template 'otp_verification'
        const sent = await dispatchExternalMessage({
            to: phone,
            body: `Your Likkle Legends verification code is: ${code}. It expires in 10 minutes.`,
            channel: 'whatsapp'
        });

        if (!sent) throw new Error("Could not send WhatsApp message.");

        return { success: true };
    } catch (err: any) {
        console.error("[OTP] sendWhatsAppOtpAction failed:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Verifies OTP and signs the user in. Supports optional signup data.
 */
export async function verifyWhatsAppOtpAction(
    phone: string,
    code: string,
    signupData?: { childName: string; email: string; plan?: string; referral?: string }
) {
    try {
        // 1. Check code in DB
        const { data, error } = await supabaseAdmin
            .from('otp_codes')
            .select('*')
            .eq('phone', phone)
            .eq('code', code)
            .is('verified_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return { success: false, error: "Invalid or expired code." };
        }

        // 2. Mark as verified
        await supabaseAdmin
            .from('otp_codes')
            .update({ verified_at: new Date().toISOString() })
            .eq('id', data.id);

        // 3. Find User
        const { data: userRecord } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('whatsapp_number', phone)
            .single();

        // 4. Handle Existing User
        if (userRecord?.email) {
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: userRecord.email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/portal`
                }
            });

            if (linkError || !linkData?.properties?.action_link) {
                return { success: false, error: "Failed to generate login link." };
            }

            // Mark as age verified (since they have the parent's phone)
            await supabaseAdmin
                .from('users')
                .update({ age_verified_at: new Date().toISOString() })
                .eq('id', userRecord.id);

            return {
                success: true,
                isNewUser: false,
                userId: userRecord.id,
                magicLink: linkData.properties.action_link
            };
        }

        // 5. Handle New User Signup
        if (signupData) {
            // Create user in auth.users first
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: signupData.email,
                password: Math.random().toString(36).slice(-12), // Random password for WhatsApp users
                email_confirm: true,
                user_metadata: {
                    full_name: `Parent of ${signupData.childName}`,
                    whatsapp_number: phone,
                    child_name: signupData.childName,
                    chosen_plan: signupData.plan,
                    referral_source: signupData.referral
                }
            });

            if (authError) throw authError;

            // Link WhatsApp number in the public.users table (triggered by auth.users creation usually, but we ensure it)
            await supabaseAdmin
                .from('users')
                .update({
                    whatsapp_number: phone,
                    preferred_channel: 'whatsapp'
                })
                .eq('id', authData.user?.id);

            const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: signupData.email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/portal`
                }
            });

            // Mark as age verified (since they just verified via WhatsApp)
            await supabaseAdmin
                .from('users')
                .update({
                    age_verified_at: new Date().toISOString(),
                    is_coppa_designated_parent: true
                })
                .eq('id', authData.user?.id);

            return {
                success: true,
                isNewUser: true,
                userId: authData.user?.id,
                magicLink: linkData?.properties?.action_link
            };
        }

        // 6. Needs Signup Info
        return { success: true, needsSignup: true, phone };

    } catch (err: any) {
        console.error("[OTP] verifyWhatsAppOtpAction failed:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Adds a user to the waitlist.
 */
export async function joinWaitlistAction(email: string, metadata?: any) {
    try {
        const { error } = await supabaseAdmin
            .from('waitlist')
            .insert({
                email,
                metadata: metadata || {},
                created_at: new Date().toISOString()
            });

        if (error) {
            // Handle unique constraint if they are already on it
            if (error.code === '23505') {
                return { success: true, alreadyExists: true };
            }
            throw error;
        }

        return { success: true };
    } catch (err: any) {
        console.error("[Waitlist] joinWaitlistAction failed:", err);
        return { success: false, error: err.message };
    }
}
