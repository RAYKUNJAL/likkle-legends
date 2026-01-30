
"use server";

import { supabaseAdmin } from "@/lib/supabase-client";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "@/lib/email";

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
 * Handles user creation, auto-login for friction-less onboarding, and welcome email.
 */
export async function signupAction(formData: {
    email: string;
    password: string;
    childName: string;
    plan: string;
    referral: string;
}): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Starting frictionless signup: ${formData.email}`);
        const supabase = createClient(); // For sign-in (cookies)

        // 1. Check for existing user (Admin API)
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === formData.email);

        if (existingUser) {
            console.log(`[AUTH] User already exists: ${existingUser.id}`);
            if (existingUser.email_confirmed_at) {
                return { success: false, error: "This email is already registered. Please log in." };
            }
            // If unconfirmed, we could potentially force confirm them here, but better to ask them to check email or login.
            // For launch speed, let's treat unconfirmed as "failed" to avoid complexity, or just delete and recreate?
            // Safer:
            return { success: false, error: "Account exists but is unverified. Please check your email or contact support." };
        }

        console.log(`[AUTH] Creating new user via Admin (Auto-Confirm): ${formData.email}`);

        // 2. Create User (Auto-Confirmed)
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true, // Auto-confirm to remove friction
            user_metadata: {
                full_name: `Parent of ${formData.childName}`,
                child_name: formData.childName,
                chosen_plan: formData.plan,
                referral_source: formData.referral
            }
        });

        if (createError) {
            console.error("[AUTH] Admin Create Error:", createError.message);
            return { success: false, error: createError.message };
        }

        if (!createData.user) {
            return { success: false, error: "Failed to create user record." };
        }

        const userId = createData.user.id;

        // 3. Auto-Login (Set Cookies)
        console.log("[AUTH] Auto-logging in user...");
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (signInError) {
            console.error("[AUTH] Auto-login failed:", signInError.message);
            // Non-critical, but user will be redirected to checkout unauthenticated?
            // Actually, if cookie isn't set, middleware might block checkout.
            return { success: false, error: "Account created, but auto-login failed. Please log in manually." };
        }

        // 4. Send Welcome Email (Fire and Forget logic, or await)
        console.log("[AUTH] Sending welcome email...");
        // internal fire-and-forget approach or await to ensure delivery?
        // Let's await to be safe for this scale.
        await sendEmail({
            to: formData.email,
            subject: "Welcome to Likkle Legends! 🌴",
            html: WELCOME_EMAIL_TEMPLATE(formData.childName || "Legend Family")
        });

        // 5. Success - emailSent: false signals the frontend to Redirect directly
        return { success: true, emailSent: false, userId };

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
