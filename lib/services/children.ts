
import { supabase } from '@/lib/storage';

export async function getChildren(parentId: string) {
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getChild(childId: string) {
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

    if (error) throw error;
    return data;
}

export async function createChild(parentId: string, childData: {
    first_name: string;
    age: number;
    age_track: 'mini' | 'big';
    primary_island: string;
    secondary_island?: string;
}) {
    const { data, error } = await supabase
        .from('children')
        .insert({
            parent_id: parentId,
            ...childData,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateChild(childId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', childId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteChild(childId: string) {
    const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

    if (error) throw error;
    return true;
}
