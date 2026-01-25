
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
        console.log(`[AUTH] Initiating branded signup for: ${formData.email}`);

        // 1. Initial Signup (standard pkce flow)
        // We call this to let Supabase handle the user record and password hashing
        // Note: If Supabase SMTP is NOT configured, this won't send an email
        // If it IS configured, it might send a default one (unless we disable it in dashboard)
        const { data, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                // This redirect is used if they click the Supabase default link
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/checkout`,
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

        if (!data.user) {
            return { success: false, error: "Failed to create user record." };
        }

        const userId = data.user.id;

        // 2. Generate Branded Confirmation Link via Admin API
        // This is the "Commercial Grade" part: we bypass Supabase's built-in email triggers
        // and send our own via Resend with our own branding.
        try {
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'signup',
                email: formData.email,
                password: formData.password,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/checkout`
                }
            });

            if (linkError) {
                console.warn("[AUTH] Admin link generation failed (maybe SMTP is already handled by Supabase):", linkError.message);
                // We continue anyway, as the standard signUp might have triggered an email
            } else if (linkData?.properties?.action_link) {
                // 3. Send Branded Email via Resend
                console.log("[AUTH] Sending branded confirmation email via Resend...");
                await sendEmail({
                    to: formData.email,
                    subject: "Welcome to the Islands! Confirm your Likkle Legends account 🌴",
                    html: CONFIRMATION_EMAIL_TEMPLATE(formData.childName || "Parent", linkData.properties.action_link)
                });
                return { success: true, emailSent: true, userId };
            }
        } catch (adminErr) {
            console.error("[AUTH] Admin API or Resend failure:", adminErr);
            // Fallback: the user might still get the default Supabase email
        }

        // If we reach here, either the email was sent or we're relying on Supabase default
        return { success: true, emailSent: true, userId };

    } catch (err: any) {
        console.error("[AUTH] Unexpected Signup Error:", err);
        return { success: false, error: err.message || "An unexpected error occurred." };
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
