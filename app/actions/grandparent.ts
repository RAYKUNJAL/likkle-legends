"use server";

import { supabase } from "@/lib/storage";
import { getChildren } from "@/lib/services/children";

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
        // Note: usage of .ilike on 'id' column requires implicit casting which Supabase/PostgREST usually supports
        // We limit to 1 to avoid ambiguity, though collisions are possible with just 4 chars.
        const { data: profiles, error: profileError } = await supabase
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
        const children = await getChildren(parentId);

        if (!children || children.length === 0) {
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
