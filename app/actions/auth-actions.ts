
"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase-client";
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
export async function signupAction(formData: {
    email: string;
    password: string;
    childName: string;
    plan: string;
    referral: string;
}): Promise<SignupResult> {
    try {
        console.log(`[AUTH] Checking for existing user: ${formData.email}`);

        // 1. Check if user already exists via Admin API to handle re-sending links
        const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(formData.email);

        let userId: string;

        if (!userData?.user) {
            console.log(`[AUTH] Creating new user: ${formData.email}`);
            const { data: signUpData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
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
            console.log(`[AUTH] User already exists: ${userData.user.id}`);
            userId = userData.user.id;

            // If user is already confirmed, we might want to redirect them to login
            if (userData.user.email_confirmed_at) {
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
            const errMsg = (emailResult.error as any)?.message || "Check your Resend API key and domain verification.";
            return {
                success: false,
                error: `Email Delivery Failed: ${errMsg}`
            };
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
            await sendEmail({
                to: email,
                subject: "Reset your Likkle Legends Password 🔑",
                html: RESET_PASSWORD_EMAIL_TEMPLATE("Legend Parent", data.properties.action_link)
            });
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
            await sendEmail({
                to: email,
                subject: "Your Likkle Legends Login Link 🌴",
                html: CONFIRMATION_EMAIL_TEMPLATE("Legend Parent", data.properties.action_link)
            });
            return { success: true, emailSent: true };
        }

        return { success: false, error: "Failed to generate magic link." };
    } catch (err: any) {
        console.error("[AUTH] Magic Link Error:", err);
        return { success: false, error: err.message };
    }
}
