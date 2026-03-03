
import { supabase } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase-client';

function normalizeChild<T extends Record<string, any>>(child: T): T & { first_name: string } {
    const resolvedName =
        child.first_name ||
        child.full_name ||
        child.name ||
        child.child_name ||
        '';

    return {
        ...child,
        first_name: resolvedName,
    };
}

export async function getChildren(parentId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeChild);
}

export async function getChild(childId: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

    if (error) throw error;
    return data ? normalizeChild(data) : data;
}

export async function createChild(parentId: string, childData: {
    first_name: string;
    age: number;
    age_track: 'mini' | 'big';
    primary_island: string;
    secondary_island?: string;
    avatar_id?: string;
}) {
    const basePayload = {
        parent_id: parentId,
        age: childData.age,
        age_track: childData.age_track,
        primary_island: childData.primary_island,
        secondary_island: childData.secondary_island,
        avatar_id: childData.avatar_id,
    };

    // Primary schema (expected): children.first_name
    let { data, error } = await supabase
        .from('children')
        .insert({
            ...basePayload,
            first_name: childData.first_name,
        })
        .select()
        .single();

    // Fallback schema variant 1: children.full_name
    if (error?.message?.includes("Could not find the 'first_name' column")) {
        const fallback1 = await supabase
            .from('children')
            .insert({
                ...basePayload,
                full_name: childData.first_name,
            })
            .select()
            .single();
        data = fallback1.data as any;
        error = fallback1.error as any;
    }

    // Fallback schema variant 2: children.name
    if (error?.message?.includes("Could not find the 'full_name' column")) {
        const fallback2 = await supabase
            .from('children')
            .insert({
                ...basePayload,
                name: childData.first_name,
            })
            .select()
            .single();
        data = fallback2.data as any;
        error = fallback2.error as any;
    }

    if (error) throw error;
    return normalizeChild(data as any);
}

export async function updateChild(childId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', childId)
        .select()
        .single();

    if (error) throw error;
    return data ? normalizeChild(data as any) : data;
}

export async function deleteChild(childId: string) {
    const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

    if (error) throw error;
    return true;
}
