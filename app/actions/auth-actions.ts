"use server";

import { supabaseAdmin } from "@/lib/supabase-client";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, CONFIRMATION_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "@/lib/email";
import { claimReferralReward } from "@/app/actions/referrals";

export interface SignupResult {
    success: boolean;
    error?: string;
    emailSent?: boolean;
    userId?: string;
    requiresLogin?: boolean;
}

function isDuplicateEmailError(message: string) {
    const text = message.toLowerCase();
    return (
        text.includes("already registered") ||
        text.includes("already exists") ||
        text.includes("email address is already taken") ||
        text.includes("user already registered")
    );
}

export async function signupAction(formData: {
    email: string;
    password: string;
    childName: string;
    plan: string;
    referral: string;
}): Promise<SignupResult> {
    try {
        const email = formData.email.trim().toLowerCase();
        const supabase = createClient();
        const metadata = {
            full_name: `Parent of ${formData.childName}`,
            child_name: formData.childName,
            chosen_plan: formData.plan,
            referral_source: formData.referral,
        };

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
        const canUseAdminAuth = !!serviceRoleKey && serviceRoleKey.length > 40 && serviceRoleKey !== "false";

        let userId: string | undefined;
        let hasSession = false;
        let emailConfirmationRequired = false;

        if (canUseAdminAuth) {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: formData.password,
                email_confirm: true,
                user_metadata: metadata
            });

            if (error) {
                if (isDuplicateEmailError(error.message)) {
                    return { success: false, error: "This email is already registered. Please log in." };
                }
                console.error("[AUTH] Admin createUser failed, falling back to standard signup:", error.message);
            } else {
                userId = data.user?.id;
            }
        }

        if (!userId) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: formData.password,
                options: { data: metadata }
            });

            if (error) {
                if (isDuplicateEmailError(error.message)) {
                    return { success: false, error: "This email is already registered. Please log in." };
                }
                return { success: false, error: error.message };
            }

            userId = data.user?.id;
            hasSession = !!data.session;
            emailConfirmationRequired = !data.session;
        }

        if (!userId) {
            return { success: false, error: "Failed to create user record. Please try again." };
        }

        if (!hasSession && !emailConfirmationRequired) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: formData.password
            });

            if (signInError) {
                console.warn("[AUTH] Auto-login warning:", signInError.message);
            } else {
                hasSession = true;
            }
        }

        Promise.resolve(
            supabaseAdmin.from("profiles").upsert({
                id: userId,
                is_coppa_designated_parent: true,
                coppa_consent_date: new Date().toISOString(),
            }, { onConflict: "id" })
        ).then(({ error }) => {
            if (error) console.error("[AUTH] COPPA consent persist failed:", error.message);
        }).catch(err => console.error("[AUTH] COPPA consent persist error:", err));

        sendEmail({
            to: email,
            subject: "Welcome to Likkle Legends! 🌴",
            html: WELCOME_EMAIL_TEMPLATE(formData.childName || "Legend Family")
        }).catch(err => console.error("[AUTH] Welcome email failed:", err));

        const refCode = formData.referral;
        if (refCode && refCode !== "direct" && refCode.startsWith("LL")) {
            claimReferralReward(refCode, userId).catch(err => console.error("[AUTH] Referral claim failed:", err));
        }

        if (emailConfirmationRequired) {
            return { success: true, emailSent: true, userId };
        }

        if (!hasSession) {
            return { success: true, emailSent: false, userId, requiresLogin: true };
        }

        return { success: true, emailSent: false, userId };
    } catch (err: any) {
        console.error("[AUTH] Unexpected Signup Error:", err);
        return { success: false, error: err.message || "An unexpected error occurred during signup." };
    }
}

export async function forgotPasswordAction(email: string): Promise<SignupResult> {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.likklelegends.com"}/api/auth/callback?next=/reset-password`
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data?.properties?.action_link) {
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

export async function sendMagicLinkAction(email: string): Promise<SignupResult> {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.likklelegends.com"}/api/auth/callback?next=/portal`
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

        if (signInData.user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role, is_admin")
                .eq("id", signInData.user.id)
                .single();

            return {
                success: true,
                role: profile?.role,
                isAdmin: profile?.is_admin || profile?.role === "admin"
            };
        }

        return { success: true };
    } catch (err: any) {
        console.error("[AUTH] Sign In Exception:", err);
        return { success: false, error: "An unexpected error occurred." };
    }
}

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
