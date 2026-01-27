
"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase-client";
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "@/lib/email";

// Force dynamic behavior to ensure env vars are read at runtime
// Server actions are inherently dynamic, but we monitor env vars closely

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

        // Debug Env Vars (Masked)
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log(`[AUTH] Environment Check - URL: ${hasUrl}, ServiceKey: ${hasServiceKey}`);

        if (!hasServiceKey) {
            console.error("[AUTH] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server action environment.");
            return { success: false, error: "Server Configuration Error: Missing API Permissions." };
        }

        console.log(`[AUTH] Checking for existing user: ${formData.email}`);

        // 1. Check if user already exists via Admin API to handle re-sending links
        const { data, error: userError } = await supabaseAdmin.auth.admin.listUsers();

        // Filter manually since listUsers doesn't support email filter directly in all versions
        const existingUser = data?.users?.find(u => u.email === formData.email);

        let userId: string;

        if (!existingUser) {
            console.log(`[AUTH] Creating new user: ${formData.email}`);
            const { data: signUpData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `Parent of ${formData.childName}`, // Provide a default name derived from child
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

            // If user is already confirmed, we might want to redirect them to login
            if (existingUser.email_confirmed_at) {
                return { success: false, error: "This email is already registered and confirmed. Please log in." };
            }
        }

        // 2. Generate Branded Confirmation Link via Admin API
        console.log(`[AUTH] Generating confirmation link for ${formData.email}...`);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: formData.email,
            password: formData.password, // This is needed if user was just created
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/checkout`
            }
        });

        if (linkError) {
            console.error("[AUTH] Admin link generation failed:", linkError.message);

            // Check for specific common error
            if (linkError.message.includes('Email confirmations are disabled')) {
                return {
                    success: false,
                    error: "Email confirmations are currently disabled in the backend. Please contact support."
                };
            }

            // If we get here, it's likely a permission issue (e.g., using Anon Key instead of Service Role)
            if (linkError.message.includes('401') || linkError.message.includes('Unauthorized')) {
                console.error("[AUTH] CRITICAL: Admin operation failed with 401. Check SUPABASE_SERVICE_ROLE_KEY.");
                return { success: false, error: "System configuration error (Admin Key). check server logs." };
            }

            return { success: false, error: `Auth Link Error: ${linkError.message}` };
        }

        if (!linkData?.properties?.action_link) {
            console.error("[AUTH] No action link returned by Supabase.");
            return { success: false, error: "Auth system failed to generate a confirmation link." };
        }

        // 3. Send Branded Email via Resend
        console.log("[AUTH] Sending branded confirmation email via Resend...");
        const emailResult = await sendEmail({
            to: formData.email,
            subject: "Welcome to the Islands! Confirm your Likkle Legends account 🌴",
            html: CONFIRMATION_EMAIL_TEMPLATE(formData.childName || "Parent", linkData.properties.action_link)
        });

        if (!emailResult.success) {
            console.error("[AUTH] Resend API Error:", emailResult.error);
            const isUnverified = (emailResult as any).isUnverified;
            let errMsg = (emailResult.error as any)?.message || "Check your Resend API key and domain verification.";

            if (isUnverified) {
                errMsg = "Domain likklelegends.com is not verified in Resend. Emails can only be sent to the registered owner in test mode.";
            }

            return {
                success: false,
                error: `Email Delivery Failed: ${errMsg}`
            };
        }

        if ((emailResult as any).mode === 'fallback') {
            console.warn("[AUTH] Email sent via FALLBACK (onboarding@resend.dev). This will NOT reach real users.");
        }

        console.log("[AUTH] Signup flow completed successfully for", formData.email);
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
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/portal/settings`
            }
        });

        if (error) {
            console.error("[AUTH] Reset link generation failed:", error.message);
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
                return { success: false, error: `Email failed: ${(emailResult.error as any)?.message || 'Check Resend'}` };
            }

            return { success: true, emailSent: true };
        }


        return { success: false, error: "Failed to generate link." };
    } catch (err: any) {
        console.error("[AUTH] Reset Password Error:", err);
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
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/portal`
            }
        });

        if (error) {
            console.error("[AUTH] Magic link generation failed:", error.message);
            return { success: false, error: error.message };
        }

        if (data?.properties?.action_link) {
            const emailResult = await sendEmail({
                to: email,
                subject: "Your Likkle Legends Login Link 🌴",
                html: CONFIRMATION_EMAIL_TEMPLATE("Legend Parent", data.properties.action_link)
            });

            if (!emailResult.success) {
                return { success: false, error: `Email failed: ${(emailResult.error as any)?.message || 'Check Resend'}` };
            }

            return { success: true, emailSent: true };
        }

        return { success: false, error: "Failed to generate magic link." };
    } catch (err: any) {
        console.error("[AUTH] Magic Link Error:", err);
        return { success: false, error: err.message };
    }
}
