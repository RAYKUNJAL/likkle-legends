"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";

// Helper to verify admin access
async function verifyAdmin(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Unauthorized");

    const adminClient = createAdminClient();
    const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    const isDevAdmin = user.email === 'admin@likklelegends.com' || user.email?.includes('raykunjal');

    if (!adminUser && !isDevAdmin) {
        throw new Error("Forbidden: Not an admin");
    }

    return adminClient;
}

export async function getAllLeads(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    // If table doesn't exist, return empty array (or we could create it)
    if (error && error.code === '42P01') return [];
    if (error) throw error;
    return data || [];
}

export async function deleteLead(token: string, id: string) {
    const admin = await verifyAdmin(token);
    const { error } = await admin
        .from('leads')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function updateLeadStatus(token: string, id: string, status: string) {
    const admin = await verifyAdmin(token);
    const { error } = await admin
        .from('leads')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function replyToSupportMessage(token: string, messageId: string, replyText: string) {
    const admin = await verifyAdmin(token);

    // First, get the message details for email sending
    const { data: message, error: fetchError } = await admin
        .from('support_messages')
        .select('parent_name, parent_email, subject')
        .eq('id', messageId)
        .single();

    if (fetchError) throw fetchError;

    // Update the message status to 'replied'
    const { error } = await admin
        .from('support_messages')
        .update({
            status: 'replied',
            metadata: { reply_text: replyText, replied_at: new Date().toISOString() },
            updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

    if (error) throw error;

    // Queue the actual email to the parent
    if (message?.parent_email) {
        const { queueSupportReply } = await import('@/lib/services/email-triggers');
        await queueSupportReply(
            message.parent_email,
            message.parent_name || 'Friend',
            message.subject || 'Your Support Request',
            replyText
        );
    }

    return { success: true };
}
