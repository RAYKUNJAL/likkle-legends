"use server";

import { supabase, supabaseAdmin } from "@/lib/storage";


/**
 * Verify a family access code (e.g. LEGEND-1234)
 * Returns the first child of the family if valid.
 */
export async function verifyFamilyAccessCode(code: string) {
    // 1. Validate format
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode.startsWith("LEGEND-")) {
        return { success: false, error: "Invalid code format. Must start with LEGEND-" };
    }

    const idPrefix = cleanCode.replace("LEGEND-", "").toLowerCase();
    if (idPrefix.length < 4) {
        return { success: false, error: "Code is too short." };
    }

    try {
        // 2. Find parent profile matching the ID prefix
        // Uses Service Role to bypass RLS
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .ilike('id', `${idPrefix}%`)
            .limit(1);

        if (profileError || !profiles || profiles.length === 0) {
            console.error("Profile lookup error or not found", profileError);
            return { success: false, error: "Family not found. Please check the code." };
        }

        const parentId = profiles[0].id;

        // 3. Get children for this parent
        // Explicitly use admin client
        const { data: children, error: childrenError } = await supabaseAdmin
            .from('children')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (childrenError || !children || children.length === 0) {
            return { success: false, error: "No children found for this family adventure yet!" };
        }

        // 4. Return the first child (Grandparent view usually focuses on one or lets you switch)
        // For MVP, we default to the first child.
        return {
            success: true,
            childId: children[0].id,
            childName: children[0].first_name
        };

    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, error: "Something went wrong verifying the code." };
    }
}

/**
 * Fetch all data needed for the Grandparent Dashboard
 * Uses Service Role (admin) to bypass RLS since grandparents are unauthenticated
 */
export async function getGrandparentDashData(childId: string) {
    try {
        // 1. Get Child Data
        // Use supabase with service role (admin)
        const { data: child, error: childError } = await supabaseAdmin.from('children').select('*').eq('id', childId).single();

        if (childError || !child) {
            console.error("Grandparent data fetch error (child):", childError);
            return { success: false, error: "Child not found" };
        }

        // 2. Get Child Activities (Audit Log)
        const { data: activities, error: activityError } = await supabaseAdmin
            .from('user_activity') // Correct table name usually user_activity or audit_logs
            .select('*')
            .eq('child_id', childId)
            .order('created_at', { ascending: false })
            .limit(10);

        // 3. Get Messages (Conversation between Parent and Grandparent/System?)
        // Currently, the grandparent page tries to fetch a conversation. 
        // We'll mimic that logic.
        let messages: any[] = [];
        if (child.parent_id) {
            const { data: msgs } = await supabaseAdmin
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${childId},recipient_id.eq.${childId}`) // Simplified for specific child context
                .order('created_at', { ascending: true });
            if (msgs) messages = msgs;
        }

        return {
            success: true,
            child,
            activities: activities || [],
            messages: messages || []
        };

    } catch (error) {
        console.error("Grandparent dashboard error:", error);
        return { success: false, error: "Failed to load dashboard data" };
    }
}

/**
 * Send a message from the grandparent portal (unauthenticated)
 */
export async function sendMessageAsGrandparent(childId: string, parentId: string, content: string) {
    try {
        // Validation: Verify this child actually belongs to this parent to prevent spamming random users
        const { data: child } = await supabaseAdmin
            .from('children')
            .select('id')
            .eq('id', childId)
            .eq('parent_id', parentId)
            .single();

        if (!child) {
            return { success: false, error: "Invalid family connection." };
        }

        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert({
                sender_id: childId, // We send "from the child's portal/context" for now
                recipient_id: parentId,
                content: content,
                message_type: 'text',
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, message: data };

    } catch (error) {
        console.error("Failed to send GP message:", error);
        return { success: false, error: "Failed to send message." };
    }
}
