
import { supabaseAdmin } from "@/lib/supabase-client";
import {
    sendEmail,
    ABANDONED_CHECKOUT_TEMPLATE,
    ONBOARDING_DAY_2_TEMPLATE,
    ONBOARDING_DAY_7_TEMPLATE
} from "@/lib/email";

export async function processEmailNurture() {
    console.log("[NURTURE] Starting email nurture processing...");

    // 1. Abandoned Checkout (Created > 1 hour ago, Inactive)
    await processAbandonedCheckouts();

    // 2. Day 2 Onboarding
    await processOnboarding(2, ONBOARDING_DAY_2_TEMPLATE, "onboarding_day_2");

    // 3. Day 7 Onboarding
    await processOnboarding(7, ONBOARDING_DAY_7_TEMPLATE, "onboarding_day_7");

    console.log("[NURTURE] Nurture processing complete.");
}

async function processAbandonedCheckouts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, parent_name, created_at')
        .eq('subscription_status', 'inactive')
        .lt('created_at', oneHourAgo);

    if (error) {
        console.error("[NURTURE] Error fetching abandoned checkouts:", error);
        return;
    }

    for (const user of users) {
        // Check if already sent
        const { data: alreadySent } = await supabaseAdmin
            .from('subscription_nurture')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'abandoned_checkout')
            .single();

        if (alreadySent) continue;

        const { data: child } = await supabaseAdmin
            .from('children')
            .select('first_name')
            .eq('parent_id', user.id)
            .limit(1)
            .single();

        console.log(`[NURTURE] Sending abandoned checkout to ${user.email}`);
        await sendEmail({
            to: user.email,
            subject: "You Left Something Behind! 🛒",
            html: ABANDONED_CHECKOUT_TEMPLATE(user.parent_name || "Legend Parent", child?.first_name || "your little legend")
        });

        await supabaseAdmin.from('subscription_nurture').insert({
            user_id: user.id,
            email_type: 'abandoned_checkout'
        });
    }
}

async function processOnboarding(days: number, template: Function, type: string) {
    const startRange = new Date(Date.now() - (days + 1) * 24 * 60 * 60 * 1000).toISOString();
    const endRange = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, parent_name')
        .eq('subscription_status', 'active')
        .gt('created_at', startRange)
        .lt('created_at', endRange);

    if (error) {
        console.error(`[NURTURE] Error fetching day ${days} onboarding users:`, error);
        return;
    }

    for (const user of users) {
        const { data: alreadySent } = await supabaseAdmin
            .from('subscription_nurture')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', type)
            .single();

        if (alreadySent) continue;

        const { data: child } = await supabaseAdmin
            .from('children')
            .select('first_name')
            .eq('parent_id', user.id)
            .limit(1)
            .single();

        console.log(`[NURTURE] Sending ${type} to ${user.email}`);
        await sendEmail({
            to: user.email,
            subject: days === 2 ? "Day 2: Getting Started Tips 🚀" : "One Week In! 🎉",
            html: template(user.parent_name || "Legend Parent", child?.first_name || "your little legend")
        });

        await supabaseAdmin.from('subscription_nurture').insert({
            user_id: user.id,
            email_type: type
        });
    }
}
