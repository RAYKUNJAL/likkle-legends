import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-client";
import {
    sendEmail,
    ABANDONED_CHECKOUT_TEMPLATE,
    ONBOARDING_DAY_2_TEMPLATE,
    ONBOARDING_DAY_7_TEMPLATE,
    LEAD_NURTURE_DAY1_TEMPLATE,
    LEAD_NURTURE_DAY3_TEMPLATE,
    LEAD_NURTURE_DAY5_TEMPLATE,
    LEAD_NURTURE_DAY7_TEMPLATE,
    UPGRADE_DAY14_TEMPLATE,
    UPGRADE_DAY30_TEMPLATE,
    WIN_BACK_TEMPLATE,
} from "@/lib/email";

export async function processEmailNurture() {
    if (!isSupabaseConfigured()) return;
    console.log("[NURTURE] Starting email nurture processing...");

    // 1. Abandoned Checkout (Created > 1 hour ago, Inactive)
    await processAbandonedCheckouts();

    // 2. Day 2 Onboarding
    await processOnboarding(2, ONBOARDING_DAY_2_TEMPLATE, "onboarding_day_2");

    // 3. Day 7 Onboarding
    await processOnboarding(7, ONBOARDING_DAY_7_TEMPLATE, "onboarding_day_7");

    // 4. Lead Nurture Sequence (for leads who haven't signed up yet)
    await processLeadNurture();

    // 5. Free-to-Paid Upgrade Nudges
    await processFreeToUpgrade();

    // 6. Win-Back Emails (churned subscribers)
    await processWinBack();

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

// --- Lead Nurture Sequence ---
// Sends emails to leads (email-only subscribers) who haven't signed up for an account yet.
// Day 1: Value email (3 activities), Day 3: Meet Tanty Spice, Day 5: Emotional hook, Day 7: Trial CTA

const LEAD_NURTURE_SEQUENCE = [
    {
        day: 1,
        type: 'lead_nurture_day1',
        subject: '3 Fun Caribbean Activities for Tonight',
        template: LEAD_NURTURE_DAY1_TEMPLATE,
    },
    {
        day: 3,
        type: 'lead_nurture_day3',
        subject: 'Meet Tanty Spice — Your Child\'s New Favorite Auntie',
        template: LEAD_NURTURE_DAY3_TEMPLATE,
    },
    {
        day: 5,
        type: 'lead_nurture_day5',
        subject: 'Your Child\'s Heritage Is a Superpower',
        template: LEAD_NURTURE_DAY5_TEMPLATE,
    },
    {
        day: 7,
        type: 'lead_nurture_day7',
        subject: 'Your 7-Day Free Trial Is Waiting',
        template: LEAD_NURTURE_DAY7_TEMPLATE,
    },
];

async function processLeadNurture() {
    for (const step of LEAD_NURTURE_SEQUENCE) {
        await processLeadNurtureStep(step.day, step.template, step.type, step.subject);
    }
}

async function processLeadNurtureStep(
    days: number,
    template: (name: string) => string,
    type: string,
    subject: string
) {
    const startRange = new Date(Date.now() - (days + 1) * 24 * 60 * 60 * 1000).toISOString();
    const endRange = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get leads created `days` ago who are still active (haven't unsubscribed)
    const { data: leads, error } = await supabaseAdmin
        .from('leads')
        .select('id, email, first_name, created_at')
        .eq('status', 'active')
        .gt('created_at', startRange)
        .lt('created_at', endRange);

    if (error) {
        console.error(`[NURTURE] Error fetching leads for ${type}:`, error);
        return;
    }

    if (!leads || leads.length === 0) return;

    for (const lead of leads) {
        // Check if this lead has already signed up for an account (skip if so)
        const { data: existingUser } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', lead.email)
            .single();

        if (existingUser) continue; // Already converted — no need to nurture

        // Check if already sent this email
        const { data: alreadySent } = await supabaseAdmin
            .from('email_queue')
            .select('id')
            .eq('recipient_email', lead.email)
            .eq('campaign_type', type)
            .single();

        if (alreadySent) continue;

        console.log(`[NURTURE] Sending ${type} to lead ${lead.email}`);

        await sendEmail({
            to: lead.email,
            subject,
            html: template(lead.first_name || 'Legend Parent'),
        });

        // Track in email_queue to prevent duplicates
        await supabaseAdmin.from('email_queue').insert({
            recipient_email: lead.email,
            template_id: type.toUpperCase(),
            template_data: { name: lead.first_name || 'Legend Parent' },
            status: 'sent',
            sent_at: new Date().toISOString(),
            campaign_type: type,
        });
    }
}

// --- Free-to-Paid Upgrade Sequence ---
// Targets free-tier users who have been active but haven't upgraded

async function processFreeToUpgrade() {
    // Day 14: Activity milestone nudge
    await processUpgradeStep(14, 'upgrade_day14');

    // Day 30: Special discount offer
    await processUpgradeStep(30, 'upgrade_day30');
}

async function processUpgradeStep(days: number, type: string) {
    const startRange = new Date(Date.now() - (days + 1) * 24 * 60 * 60 * 1000).toISOString();
    const endRange = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get free-tier users created ~N days ago
    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, parent_name')
        .eq('subscription_tier', 'free')
        .eq('subscription_status', 'active')
        .gt('created_at', startRange)
        .lt('created_at', endRange);

    if (error) {
        console.error(`[NURTURE] Error fetching free users for ${type}:`, error);
        return;
    }

    if (!users || users.length === 0) return;

    for (const user of users) {
        // Check if already sent
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

        const childName = child?.first_name || 'your little legend';
        const parentName = user.parent_name || 'Legend Parent';

        console.log(`[NURTURE] Sending ${type} to ${user.email}`);

        if (type === 'upgrade_day14') {
            await sendEmail({
                to: user.email,
                subject: `${childName} completed 5+ activities! Unlock unlimited content`,
                html: UPGRADE_DAY14_TEMPLATE(parentName, childName),
            });
        } else if (type === 'upgrade_day30') {
            const discountCode = 'LEGEND50';
            await sendEmail({
                to: user.email,
                subject: 'Special Offer: 50% Off Your First Month!',
                html: UPGRADE_DAY30_TEMPLATE(parentName, childName, discountCode),
            });
        }

        await supabaseAdmin.from('subscription_nurture').insert({
            user_id: user.id,
            email_type: type,
        });
    }
}

// --- Win-Back Sequence ---
// Targets users who canceled their subscription within the last 7 days

async function processWinBack() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, parent_name, updated_at')
        .eq('subscription_status', 'canceled')
        .gt('updated_at', sevenDaysAgo);

    if (error) {
        console.error('[NURTURE] Error fetching churned users:', error);
        return;
    }

    if (!users || users.length === 0) return;

    for (const user of users) {
        // Check if already sent win-back
        const { data: alreadySent } = await supabaseAdmin
            .from('subscription_nurture')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'win_back')
            .single();

        if (alreadySent) continue;

        console.log(`[NURTURE] Sending win_back to ${user.email}`);

        await sendEmail({
            to: user.email,
            subject: 'We Miss You! Come Back to de Village',
            html: WIN_BACK_TEMPLATE(user.parent_name || 'Legend Parent'),
        });

        await supabaseAdmin.from('subscription_nurture').insert({
            user_id: user.id,
            email_type: 'win_back',
        });
    }
}
