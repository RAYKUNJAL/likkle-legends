
"use server";

import { supabaseAdmin } from "@/lib/supabase-client";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "@/lib/email";
import { claimReferralReward } from "@/app/actions/referrals";
// Note: we intentionally use the SSR createClient (not supabaseAdmin) for signup
// so it works regardless of whether the service role key matches the project URL.

export interface SignupResult {
    success: boolean;
    error?: string;
    emailSent?: boolean;
    userId?: string;
}

/**
 * Commercial-grade Signup Action
 * Handles user creation, branded confirmation email, and error reporting
 */
/**
 * Commercial-grade Signup Action
 * Uses supabase.auth.signUp() so it works regardless of service role key config.
 * For frictionless onboarding: disable "Email Confirmations" in Supabase Dashboard
 * (Authentication → Email → Enable email confirmations = OFF)
 */
export async function signupAction(formData: {
    email: string;
    password: string;
    childName: string;
    plan: string;
    referral: string;
}): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Starting signup: ${formData.email}, plan: ${formData.plan}`);
        const supabase = createClient(); // SSR client — sets auth cookies on response

        // 1. Sign up via standard Supabase auth
        //    - Email confirmations OFF in Dashboard → session created immediately (auto-login)
        //    - Email confirmations ON → emailSent:true, show "check your inbox"
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/onboarding/welcome`,
                data: {
                    full_name: `Parent of ${formData.childName}`,
                    child_name: formData.childName,
                    chosen_plan: formData.plan,
                    referral_source: formData.referral,
                }
            }
        });

        if (signUpError) {
            console.error("[AUTH] SignUp Error:", signUpError.message);
            if (
                signUpError.message.toLowerCase().includes('already registered') ||
                signUpError.message.toLowerCase().includes('already exists') ||
                signUpError.message.toLowerCase().includes('email address is already taken') ||
                signUpError.message.toLowerCase().includes('user already registered')
            ) {
                return { success: false, error: "This email is already registered. Please log in." };
            }
            return { success: false, error: signUpError.message };
        }

        if (!signUpData.user) {
            return { success: false, error: "Failed to create user record. Please try again." };
        }

        const userId = signUpData.user.id;
        const isAutoConfirmed = !!signUpData.session; // session exists = auto-confirmed

        // 2. Send Welcome Email (fire-and-forget)
        sendEmail({
            to: formData.email,
            subject: "Welcome to Likkle Legends! 🌴",
            html: WELCOME_EMAIL_TEMPLATE(formData.childName || "Legend Family")
        }).catch(err => console.error("[AUTH] Welcome email failed:", err));

        // 3. Referral reward (fire-and-forget — non-blocking)
        const refCode = formData.referral;
        if (refCode && refCode !== 'direct' && refCode.startsWith('LL')) {
            claimReferralReward(refCode, userId)
                .catch(err => console.error('[AUTH] Referral claim failed:', err));
        }

        if (isAutoConfirmed) {
            console.log(`[AUTH] Auto-confirmed signup success for: ${formData.email}`);
            return { success: true, emailSent: false, userId };
        }

        // 3. Email confirmation required
        console.log(`[AUTH] Confirmation email sent to: ${formData.email}`);
        return { success: true, emailSent: true, userId };

    } catch (err: any) {
        console.error("[AUTH] Unexpected Signup Error:", err);
        return { success: false, error: err.message || "An unexpected error occurred during signup." };
    }
}

/**
 * Branded Forgot Password Action
 */
export async function forgotPasswordAction(email: string): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Initiating branded password reset for: ${email}`);

        // 1. Generate link
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/reset-password`
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data?.properties?.action_link) {
            // 2. Send branded email
            const emailResult = await sendEmail({
                to: email,
                subject: "Reset your Likkle Legends Password 🔑",
                html: RESET_PASSWORD_EMAIL_TEMPLATE("Legend Parent", data.properties.action_link)
            });

            if (!emailResult.success) {
                return { success: false, error: `Email failed: ${(emailResult.error as any)?.message}` };
            }

            return { success: true, emailSent: true };
        }

        return { success: false, error: "Failed to generate link." };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Branded Magic Link Action
 */
export async function sendMagicLinkAction(email: string): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Initiating branded magic link for: ${email}`);

        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/portal`
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data?.properties?.action_link) {
            const emailResult = await sendEmail({
                to: email,
                subject: "Your Likkle Legends Login Link 🌴",
                html: CONFIRMATION_EMAIL_TEMPLATE("Legend Parent", data.properties.action_link)
            });

            if (!emailResult.success) {
                return { success: false, error: `Email failed: ${(emailResult.error as any)?.message}` };
            }

            return { success: true, emailSent: true };
        }

        return { success: false, error: "Failed to generate magic link." };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Server Action for Password Sign In
 * Uses @supabase/ssr createServerClient to automatically set cookies on the response
 */
export async function signInAction(email: string, password: string) {
    try {
        const supabase = createClient();

        const { data: signInData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("[AUTH] Sign In Failed:", error.message);
            return { success: false, error: error.message };
        }

        // Use user returned directly — no extra getSession() round trip
        if (signInData.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', signInData.user.id)
                .single();

            return {
                success: true,
                role: profile?.role,
                isAdmin: profile?.is_admin || profile?.role === 'admin'
            };
        }

        return { success: true };
    } catch (err: any) {
        console.error("[AUTH] Sign In Exception:", err);
        return { success: false, error: "An unexpected error occurred." };
    }
}

/**
 * Server Action for Sign Out
 */
export async function signOutAction() {
    try {
        const supabase = createClient();
        await supabase.auth.signOut();
        return { success: true };
    } catch (err) {
        console.error("Sign out failed", err);
        return { success: false };
    }
}
