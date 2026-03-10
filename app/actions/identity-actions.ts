
"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-client";
import { dispatchExternalMessage } from "@/lib/services/messenger";

function isDuplicateEmailError(message: string) {
    const text = message.toLowerCase();
    return (
        text.includes("already registered") ||
        text.includes("already exists") ||
        text.includes("email address is already taken") ||
        text.includes("user already registered")
    );
}

function hasServiceRoleAccess() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    return !!key && key.length > 40 && key !== "false";
}

/**
 * Sends a 6-digit OTP via WhatsApp
 */
export async function sendWhatsAppOtpAction(phone: string) {
    // Guard: WhatsApp must be configured
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
        return {
            success: false,
            error: "WhatsApp verification is not available right now. Please use Email or Google to sign in."
        };
    }

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

        // 2. Dispatch via WhatsApp template
        const sent = await dispatchExternalMessage({
            to: phone,
            body: code,
            channel: 'whatsapp'
        });

        if (!sent) throw new Error("WhatsApp message could not be delivered. Please check the number and try again.");

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

        const canUseAdminAuth = hasServiceRoleAccess();

        // 4. Handle Existing User
        if (userRecord?.email) {
            if (!canUseAdminAuth) {
                return {
                    success: false,
                    error: "WhatsApp login is temporarily unavailable. Please log in with your email and password."
                };
            }

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
            const supabase = createClient();
            const email = signupData.email.trim().toLowerCase();
            const generatedPassword = Math.random().toString(36).slice(-12);
            const userMetadata = {
                full_name: `Parent of ${signupData.childName}`,
                whatsapp_number: phone,
                child_name: signupData.childName,
                chosen_plan: signupData.plan,
                referral_source: signupData.referral
            };

            let userId: string | undefined;
            let hasSession = false;

            if (canUseAdminAuth) {
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password: generatedPassword,
                    email_confirm: true,
                    user_metadata: userMetadata
                });

                if (authError) {
                    if (isDuplicateEmailError(authError.message)) {
                        return { success: false, error: "This email is already registered. Please log in." };
                    }
                    console.error("[OTP] Admin createUser failed, falling back to signUp:", authError.message);
                } else {
                    userId = authData.user?.id;
                }
            }

            if (!userId) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: generatedPassword,
                    options: { data: userMetadata }
                });

                if (signUpError) {
                    if (isDuplicateEmailError(signUpError.message)) {
                        return { success: false, error: "This email is already registered. Please log in." };
                    }
                    throw signUpError;
                }

                userId = signUpData.user?.id;
                hasSession = !!signUpData.session;
            }

            if (!userId) {
                return { success: false, error: "Failed to create account. Please try again." };
            }

            if (!hasSession) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: generatedPassword
                });
                hasSession = !signInError;
            }

            // Link WhatsApp number in the public.users table (triggered by auth.users creation usually, but we ensure it)
            await supabaseAdmin
                .from('users')
                .update({
                    whatsapp_number: phone,
                    preferred_channel: 'whatsapp'
                })
                .eq('id', userId);

            // Mark as age verified (since they just verified via WhatsApp)
            await supabaseAdmin
                .from('users')
                .update({
                    age_verified_at: new Date().toISOString(),
                    is_coppa_designated_parent: true
                })
                .eq('id', userId);

            if (hasSession) {
                return {
                    success: true,
                    isNewUser: true,
                    userId,
                    redirectTo: '/portal'
                };
            }

            if (!canUseAdminAuth) {
                return {
                    success: true,
                    isNewUser: true,
                    userId,
                    requiresLogin: true,
                    redirectTo: '/login?redirect=/portal'
                };
            }

            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/portal`
                }
            });

            if (linkError || !linkData?.properties?.action_link) {
                return {
                    success: true,
                    isNewUser: true,
                    userId,
                    requiresLogin: true,
                    redirectTo: '/login?redirect=/portal'
                };
            }

            return {
                success: true,
                isNewUser: true,
                userId,
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
