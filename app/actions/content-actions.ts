
"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveContent(type: 'storybooks' | 'songs' | 'games', id: string) {
    const supabase = createClient();

    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Unauthorized');

    // Check role-based access control - no email-based escalation
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', session.user.id)
        .single();

    if (profile?.role !== 'admin' && profile?.is_admin !== true) throw new Error('Unauthorized');

    const { error } = await supabase
        .from(type)
        .update({ is_active: true })
        .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/approval');
    revalidatePath('/portal/library');
    return { success: true };
}

export async function rejectContent(type: 'storybooks' | 'songs' | 'games', id: string) {
    const supabase = createClient();

    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Unauthorized');

    const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/approval');
    return { success: true };
}

export async function getPendingContent() {
    const supabase = createClient();

    const [stories, songs] = await Promise.all([
        supabase.from('storybooks').select('*').eq('is_active', false).order('created_at', { ascending: false }),
        supabase.from('songs').select('*').eq('is_active', false).order('created_at', { ascending: false })
    ]);

    return {
        stories: stories.data || [],
        songs: songs.data || []
    };
}

export async function saveGeneratedStory(storyId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('storybooks')
        .update({ is_active: true })
        .eq('id', storyId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Save failed:', error);
        throw error;
    }

    revalidatePath('/portal/stories');
    return { success: true };
}
