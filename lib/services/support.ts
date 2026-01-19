
import { supabase } from '@/lib/storage';

export interface SupportMessage {
    id?: string;
    parent_name: string;
    parent_email: string;
    subject: string;
    message: string;
    status: 'new' | 'replied' | 'pending' | 'resolved';
    created_at?: string;
}

export async function sendSupportMessage(messageData: SupportMessage) {
    const { data, error } = await supabase
        .from('support_messages')
        .insert({
            ...messageData,
            status: 'new',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending support message:', error);
        throw error;
    }
    return data;
}

export async function getSupportMessages() {
    const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching support messages:', error);
        throw error;
    }
    return data || [];
}

export async function updateSupportMessageStatus(id: string, status: SupportMessage['status']) {
    const { data, error } = await supabase
        .from('support_messages')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating support message:', error);
        throw error;
    }
    return data;
}

export async function deleteSupportMessage(id: string) {
    const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting support message:', error);
        throw error;
    }
    return true;
}
