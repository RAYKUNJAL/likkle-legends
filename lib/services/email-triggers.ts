"use server";

import { createAdminClient } from "@/lib/admin";

// ============================================
// EMAIL TRIGGER FUNCTIONS
// These queue emails to be sent by the processor
// ============================================

function addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
}

function addHours(date: Date, hours: number): string {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result.toISOString();
}

/**
 * Queue the full welcome sequence after signup
 */
export async function queueWelcomeSequence(profileId: string, email: string, name: string, childName?: string) {
    const admin = createAdminClient();
    const now = new Date();

    const emails = [
        {
            recipient_email: email,
            template_id: 'WELCOME',
            template_data: { name, childName },
            status: 'pending',
            send_at: now.toISOString() // Immediate
        },
        {
            recipient_email: email,
            template_id: 'ONBOARDING_DAY_2',
            template_data: { name, childName },
            status: 'pending',
            send_at: addDays(now, 2)
        },
        {
            recipient_email: email,
            template_id: 'ONBOARDING_DAY_7',
            template_data: { name },
            status: 'pending',
            send_at: addDays(now, 7)
        }
    ];

    const { error } = await admin.from('email_queue').insert(emails);

    if (error) {
        console.error('Failed to queue welcome sequence:', error);
    }

    return { success: !error };
}

/**
 * Queue abandoned checkout reminder (1 hour after starting checkout)
 */
export async function queueAbandonedCheckout(email: string, name: string, planName: string = 'Legends Plus') {
    const admin = createAdminClient();
    const now = new Date();

    // First delete any existing pending abandonment emails for this user to avoid duplicates
    await admin.from('email_queue')
        .delete()
        .eq('recipient_email', email)
        .eq('template_id', 'ABANDONED_CHECKOUT')
        .eq('status', 'pending');

    const { error } = await admin.from('email_queue').insert({
        recipient_email: email,
        template_id: 'ABANDONED_CHECKOUT',
        template_data: { name, planName },
        status: 'pending',
        send_at: addHours(now, 1) // Send 1 hour after abandonment
    });

    if (error) {
        console.error('Failed to queue abandoned checkout:', error);
    }

    return { success: !error };
}

/**
 * Cancel any pending abandoned checkout reminders for a user
 * Call this after successful payment
 */
export async function cancelAbandonedCheckout(email: string) {
    const admin = createAdminClient();

    const { error } = await admin.from('email_queue')
        .delete()
        .eq('recipient_email', email)
        .eq('template_id', 'ABANDONED_CHECKOUT')
        .eq('status', 'pending');

    return { success: !error };
}

/**
 * Queue subscription confirmation after successful payment
 */
export async function queueSubscriptionConfirmation(
    email: string, 
    name: string, 
    tier: string, 
    childName?: string, 
    hasUpsell?: boolean, 
    hasHeritageStory?: boolean
) {
    const admin = createAdminClient();

    const { error } = await admin.from('email_queue').insert({
        recipient_email: email,
        template_id: 'SUBSCRIPTION_CONFIRMATION',
        template_data: { name, tier, childName, hasUpsell, hasHeritageStory },
        status: 'pending',
        send_at: new Date().toISOString() // Immediate
    });

    if (error) {
        console.error('Failed to queue subscription confirmation:', error);
    }

    return { success: !error };
}

/**
 * Queue support reply email (immediate)
 */
export async function queueSupportReply(parentEmail: string, parentName: string, subject: string, replyText: string) {
    const admin = createAdminClient();

    const { error } = await admin.from('email_queue').insert({
        recipient_email: parentEmail,
        template_id: 'SUPPORT_REPLY',
        template_data: { parentName, subject, replyText },
        status: 'pending',
        send_at: new Date().toISOString() // Immediate
    });

    if (error) {
        console.error('Failed to queue support reply:', error);
    }

    return { success: !error };
}

/**
 * Queue win-back email for inactive users (called by a scheduled job)
 */
export async function queueWinBack(email: string, name: string) {
    const admin = createAdminClient();

    const { error } = await admin.from('email_queue').insert({
        recipient_email: email,
        template_id: 'WIN_BACK',
        template_data: { name },
        status: 'pending',
        send_at: new Date().toISOString()
    });

    if (error) {
        console.error('Failed to queue win-back:', error);
    }

    return { success: !error };
}

// ============================================
// CAMPAIGN SETTINGS (Stored in site_settings)
// ============================================

export async function getEmailCampaignSettings() {
    const admin = createAdminClient();
    const { data } = await admin
        .from('site_settings')
        .select('value')
        .eq('key', 'email_campaigns')
        .single();

    return data?.value || {
        welcome_sequence_enabled: true,
        abandoned_checkout_enabled: true,
        win_back_enabled: true
    };
}

export async function updateEmailCampaignSettings(settings: any) {
    const admin = createAdminClient();
    await admin.from('site_settings').upsert({
        key: 'email_campaigns',
        value: settings,
        updated_at: new Date().toISOString()
    });
    return { success: true };
}
