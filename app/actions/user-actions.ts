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
    parental_controls?: {
        allow_stories?: boolean;
        allow_lessons?: boolean;
        allow_games?: boolean;
        allow_radio?: boolean;
        allow_buddy?: boolean;
        daily_screen_time_minutes?: number;
    };
}) {
    const supabase = supabaseManager.getServiceClient(); // Use service role for admin-level update if needed or just anon

    try {
        const { parental_controls, ...profileFields } = data;
        const { error } = await supabase
            .from('profiles')
            .update({
                ...profileFields,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;

        if (parental_controls) {
            const { data: currentUser } = await supabase.auth.admin.getUserById(userId);
            const existingMeta = currentUser?.user?.user_metadata || {};
            const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
                user_metadata: {
                    ...existingMeta,
                    parental_controls,
                }
            });
            if (authUpdateError) {
                console.error('Failed to persist parental controls to auth metadata:', authUpdateError.message);
            }
        }
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
