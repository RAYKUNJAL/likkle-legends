
"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveContent(type: 'storybooks' | 'songs' | 'games', id: string) {
    const supabase = createClient();

    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Unauthorized');

    const userEmail = session.user.email;
    const isAdmin = userEmail === 'raykunjal@gmail.com' || userEmail?.includes('admin@');
    if (!isAdmin) throw new Error('Unauthorized');

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
