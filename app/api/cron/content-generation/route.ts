import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

// Vercel Cron endpoint for autonomous weekly content generation
// Configure in vercel.json: "crons": [{ "path": "/api/cron/content-generation", "schedule": "0 9 * * 1" }]
// This runs every Monday at 9 AM

// Rotating themes for variety
const WEEKLY_THEMES = [
    // Cultural appreciation
    { topic: 'Caribbean sea creatures and ocean conservation', island: 'TT' },
    { topic: 'Traditional Caribbean folk dances like Limbo and Quadrille', island: 'JM' },
    { topic: 'Island fruits: mangoes, ackee, breadfruit and their stories', island: 'TT' },
    { topic: 'Caribbean folktales: Anansi spider stories', island: 'JM' },
    { topic: 'Beach safety and respecting the ocean', island: 'BB' },
    // Life skills
    { topic: 'Sharing and taking turns with friends', island: 'TT' },
    { topic: 'Being kind to animals and nature', island: 'JM' },
    { topic: 'Healthy eating: trying new Caribbean foods', island: 'TT' },
    { topic: 'Family helpers: how we work together at home', island: 'BB' },
    { topic: 'Making new friends at school', island: 'TT' },
    // STEM
    { topic: 'How hurricanes form and staying safe', island: 'BB' },
    { topic: 'The colors of the rainbow after Caribbean rain', island: 'JM' },
    { topic: 'Counting coconuts: learning numbers with island items', island: 'TT' },
];

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const admin = createAdminClient();

        // Get today and calculate next 5 weekdays
        const today = new Date();
        const weekStart = new Date(today);

        // Find what week number we're on to rotate themes
        const weekOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        const themeOffset = (weekOfYear * 5) % WEEKLY_THEMES.length;

        const scheduledItems = [];

        for (let i = 0; i < 5; i++) {
            const scheduledDate = new Date(weekStart);
            scheduledDate.setDate(weekStart.getDate() + i);

            // Skip weekends in scheduling
            while (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
                scheduledDate.setDate(scheduledDate.getDate() + 1);
            }

            // Get rotating theme
            const themeIndex = (themeOffset + i) % WEEKLY_THEMES.length;
            const theme = WEEKLY_THEMES[themeIndex];
            const ageGroup = i % 2 === 0 ? 'mini' : 'big'; // Alternate age groups

            // Check if content already scheduled for this date
            const dateStr = scheduledDate.toISOString().split('T')[0];
            const { data: existing } = await admin
                .from('content_schedule')
                .select('id')
                .gte('scheduled_date', `${dateStr}T00:00:00Z`)
                .lte('scheduled_date', `${dateStr}T23:59:59Z`)
                .limit(1);

            if (existing && existing.length > 0) {
                console.log(`Content already scheduled for ${dateStr}, skipping`);
                continue;
            }

            // Schedule new content
            const { data, error } = await admin
                .from('content_schedule')
                .insert({
                    title: theme.topic,
                    content_type: 'monthly_drop_bundle',
                    island_id: theme.island,
                    age_group: ageGroup,
                    scheduled_date: scheduledDate.toISOString(),
                    status: 'scheduled'
                })
                .select()
                .single();

            if (error) {
                console.error(`Failed to schedule for ${dateStr}:`, error);
            } else {
                scheduledItems.push(data);
            }
        }

        // Log the run
        await admin.from('system_logs').insert({
            action_type: 'autonomous_content_scheduled',
            description: `Scheduled ${scheduledItems.length} content items for the week`,
            metadata: {
                items: scheduledItems.length,
                week_of_year: weekOfYear,
                timestamp: today.toISOString()
            }
        });

        return NextResponse.json({
            success: true,
            scheduled: scheduledItems.length,
            themes_used: scheduledItems.map(s => s.title),
            timestamp: today.toISOString()
        });
    } catch (error) {
        console.error('Content generation cron failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler for manual triggering from admin panel
export async function POST(request: NextRequest) {
    // Reuse GET logic for manual trigger
    return GET(request);
}
