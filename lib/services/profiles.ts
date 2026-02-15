
import { supabase } from '@/lib/storage';

/**
 * Likkle Legends v3.1.0 Profiles Service
 * Professional Schema: Using 'users' table for writes, 'profiles' view for complex reads
 */

export async function getProfile(userId: string) {
    // Read from profiles view to get is_admin and full_name
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
    // Filter out virtual columns from profiles view if present in updates
    const { full_name, is_admin, ...validUpdates } = updates as any;

    // Map full_name back to first_name for the users table
    if (full_name) {
        validUpdates.first_name = full_name;
    }


    const { data, error } = await supabase
        .from('users')
        .update(validUpdates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
