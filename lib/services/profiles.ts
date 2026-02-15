
import { supabase } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase-client';

export async function getProfile(userId: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
