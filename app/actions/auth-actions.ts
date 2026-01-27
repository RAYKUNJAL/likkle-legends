
"use server";

import { supabaseAdmin } from "@/lib/supabase-client";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE } from "@/lib/email";

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
export async function signupAction(formData: {
    email: string;
    password: string;
    childName: string;
    plan: string;
    referral: string;
}): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Starting signup process for: ${formData.email}`);

        // We use the standard client for auth signup (cookies are handled automatically on response)
        const supabase = createClient();

        console.log(`[AUTH] Checking for existing user: ${formData.email}`);

        // 1. Check if user already exists
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === formData.email);

        let userId: string;

        if (!existingUser) {
            console.log(`[AUTH] Creating new user: ${formData.email}`);

            // Use metadata to store extra fields
            const { data: signUpData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `Parent of ${formData.childName}`,
                        child_name: formData.childName,
                        chosen_plan: formData.plan,
                        referral_source: formData.referral
                    }
                }
            });

            if (authError) {
                console.error("[AUTH] Supabase Auth Error:", authError.message);
                return { success: false, error: authError.message };
            }

            if (!signUpData.user) {
                return { success: false, error: "Failed to create user record." };
            }
            userId = signUpData.user.id;
        } else {
            console.log(`[AUTH] User already exists: ${existingUser.id}`);
            userId = existingUser.id;

            if (existingUser.email_confirmed_at) {
                return { success: false, error: "This email is already registered and confirmed. Please log in." };
            }
        }

        // 2. Generate Branded Confirmation Link via Admin API
        console.log(`[AUTH] Generating confirmation link for ${formData.email}...`);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: formData.email,
            password: formData.password,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/checkout`
            }
        });

        if (linkError) {
            console.error("[AUTH] Admin link generation failed:", linkError.message);
            return { success: false, error: `Auth Link Error: ${linkError.message}` };
        }

        if (!linkData?.properties?.action_link) {
            return { success: false, error: "Auth system failed to generate a confirmation link." };
        }

        // 3. Send Branded Email via Resend
        console.log("[AUTH] Sending branded confirmation email...");
        const emailResult = await sendEmail({
            to: formData.email,
            subject: "Welcome to the Islands! Confirm your Likkle Legends account 🌴",
            html: CONFIRMATION_EMAIL_TEMPLATE(formData.childName || "Parent", linkData.properties.action_link)
        });

        if (!emailResult.success) {
            return { success: false, error: `Email Delivery Failed: ${(emailResult.error as any)?.message}` };
        }

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
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com'}/api/auth/callback?next=/portal/settings`
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

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("[AUTH] Sign In Failed:", error.message);
            return { success: false, error: error.message };
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
