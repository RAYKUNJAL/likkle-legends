"use server";

import { sendEmail, WELCOME_EMAIL_TEMPLATE } from '@/lib/email';
import { supabaseManager } from '@/lib/supabase-client';

/**
 * Trigger welcome email to a new user
 */
export async function sendWelcomeEmailAction(email: string, name: string) {
    try {
        const result = await sendEmail({
            to: email,
            subject: 'Welcome to the Islands! 🌴 (Likkle Legends)',
            html: WELCOME_EMAIL_TEMPLATE(name || 'Parent'),
        });

        return result;
    } catch (error) {
        console.error('Failed to trigger welcome email:', error);
        return { success: false, error };
    }
}

/**
 * Update user profile settings
 */
export async function updateProfileSettings(userId: string, data: {
    parent_name?: string;
    marketing_opt_in?: boolean;
}) {
    const supabase = supabaseManager.getServiceClient(); // Use service role for admin-level update if needed or just anon

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update profile:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Soft delete user account
 */
export async function deleteUserAccountAction(userId: string) {
    const supabase = supabaseManager.getServiceClient();

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                deleted_at: new Date().toISOString(),
                subscription_status: 'canceled'
            })
            .eq('id', userId);

        if (error) throw error;

        // Note: Real deletion would require auth.admin.deleteUser but we soft delete for security/data retention
        return { success: true };
    } catch (error: any) {
        console.error('Soft delete failed:', error.message);
        return { success: false, error: error.message };
    }
}
