"use server";

import { createAdminClient } from "@/lib/admin";
import { runAgentGeneration } from "@/app/actions/island-brain";

// Rotating themes for variety in autonomous content generation
export const CONTENT_THEMES = [
    // Cultural appreciation
    { topic: 'Caribbean sea creatures and ocean conservation', island: 'TT', category: 'nature' },
    { topic: 'Traditional Caribbean folk dances like Limbo and Quadrille', island: 'JM', category: 'culture' },
    { topic: 'Island fruits: mangoes, ackee, breadfruit and their stories', island: 'TT', category: 'food' },
    { topic: 'Caribbean folktales: Anansi spider stories', island: 'JM', category: 'stories' },
    { topic: 'Beach safety and respecting the ocean', island: 'BB', category: 'safety' },
    // Life skills
    { topic: 'Sharing and taking turns with friends', island: 'TT', category: 'social' },
    { topic: 'Being kind to animals and nature', island: 'JM', category: 'values' },
    { topic: 'Healthy eating: trying new Caribbean foods', island: 'TT', category: 'health' },
    { topic: 'Family helpers: how we work together at home', island: 'BB', category: 'family' },
    { topic: 'Making new friends at school', island: 'TT', category: 'social' },
    // STEM
    { topic: 'How hurricanes form and staying safe', island: 'BB', category: 'science' },
    { topic: 'The colors of the rainbow after Caribbean rain', island: 'JM', category: 'science' },
    { topic: 'Counting coconuts: learning numbers with island items', island: 'TT', category: 'math' },
];

/**
 * Get the next theme based on rotation
 */
export function getRotatingTheme(offset: number = 0): typeof CONTENT_THEMES[0] {
    const weekOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const themeIndex = (weekOfYear + offset) % CONTENT_THEMES.length;
    return CONTENT_THEMES[themeIndex];
}

/**
 * Schedule content for the upcoming week
 */
export async function scheduleWeekOfContent(): Promise<{ scheduled: number; themes: string[] }> {
    const admin = createAdminClient();
    const today = new Date();
    const scheduled: string[] = [];

    for (let i = 0; i < 5; i++) {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + i + 1);

        // Skip weekends
        while (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
        }

        const theme = getRotatingTheme(i);
        const ageGroup = i % 2 === 0 ? 'mini' : 'big';

        const { error } = await admin
            .from('content_schedule')
            .insert({
                title: theme.topic,
                content_type: 'monthly_drop_bundle',
                island_id: theme.island,
                age_group: ageGroup,
                scheduled_date: scheduledDate.toISOString(),
                status: 'scheduled'
            });

        if (!error) {
            scheduled.push(theme.topic);
        }
    }

    return { scheduled: scheduled.length, themes: scheduled };
}

/**
 * Run the autonomous content generation cycle
 * Called by cron or manually from admin panel
 */
export async function runAutonomousContentCycle(token: string): Promise<{
    success: boolean;
    scheduled: number;
    generated: number;
    errors: string[];
}> {
    const admin = createAdminClient();
    const errors: string[] = [];
    let generated = 0;

    try {
        // Step 1: Schedule new content for next week if needed
        const { scheduled, themes } = await scheduleWeekOfContent();

        // Step 2: Find items that are scheduled for today and generate them
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const { data: todaysItems } = await admin
            .from('content_schedule')
            .select('*')
            .eq('status', 'scheduled')
            .gte('scheduled_date', `${todayStr}T00:00:00Z`)
            .lte('scheduled_date', `${todayStr}T23:59:59Z`);

        for (const item of todaysItems || []) {
            try {
                // Update status to generating
                await admin.from('content_schedule')
                    .update({ status: 'generating' })
                    .eq('id', item.id);

                // Run the agent
                const result = await runAgentGeneration(
                    token,
                    'monthly_drop_bundle',
                    item.title,
                    item.island_id,
                    { age_group: item.age_group }
                );

                if (result.success) {
                    await admin.from('content_schedule')
                        .update({
                            status: 'pending_review',
                            generated_content_id: result.content?.content_id
                        })
                        .eq('id', item.id);
                    generated++;
                } else {
                    throw new Error(result.error);
                }
            } catch (err: any) {
                errors.push(`Failed to generate "${item.title}": ${err.message}`);
                await admin.from('content_schedule')
                    .update({ status: 'failed' })
                    .eq('id', item.id);
            }
        }

        // Log the run
        await admin.from('system_logs').insert({
            action_type: 'autonomous_content_cycle',
            description: `Autonomous cycle: ${scheduled} scheduled, ${generated} generated, ${errors.length} errors`,
            metadata: { scheduled, generated, errors, timestamp: new Date().toISOString() }
        });

        return { success: true, scheduled, generated, errors };
    } catch (err: any) {
        return { success: false, scheduled: 0, generated: 0, errors: [err.message] };
    }
}
