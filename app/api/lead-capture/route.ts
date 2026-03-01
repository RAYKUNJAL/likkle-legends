import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';
import { sendEmail, WELCOME_EMAIL_TEMPLATE } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            first_name,
            last_name,
            user_type = 'parent',
            island_origin,
            is_diaspora = false,
            num_children,
            child_age_range,
            interests = [],
            source,
            lead_magnet_id,
            referrer_id,
            utm_source,
            utm_medium,
            utm_campaign,
        } = body;

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        const admin = createAdminClient();

        // Check if email already exists
        const { data: existing } = await admin
            .from('leads')
            .select('id, status')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            // If they previously unsubscribed, reactivate
            if (existing.status === 'unsubscribed') {
                await admin
                    .from('leads')
                    .update({
                        status: 'active',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                return NextResponse.json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated.',
                    lead_id: existing.id,
                    is_returning: true
                });
            }

            // Already active subscriber
            return NextResponse.json({
                success: true,
                message: 'You\'re already part of the island family!',
                lead_id: existing.id,
                is_existing: true
            });
        }

        // Get IP from headers
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Insert new lead
        const { data: newLead, error: insertError } = await admin
            .from('leads')
            .insert({
                email: email.toLowerCase(),
                first_name,
                last_name,
                user_type,
                island_origin,
                is_diaspora,
                num_children,
                child_age_range,
                interests,
                source,
                lead_magnet_id,
                referrer_id,
                utm_source,
                utm_medium,
                utm_campaign,
                ip_address: ip,
                email_consent: true,
                marketing_consent: true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Lead insert error:', insertError);
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
        }

        // If they downloaded a lead magnet, track it
        if (lead_magnet_id) {
            await admin.from('lead_magnet_downloads').insert({
                lead_id: newLead.id,
                lead_magnet_id,
                ip_address: ip
            });

            // Update lead magnet email capture count — silently skip if RPC not set up
            await Promise.resolve(
                admin.rpc('increment', {
                    table_name: 'lead_magnets',
                    column_name: 'email_captures',
                    row_id: lead_magnet_id
                })
            ).catch(() => { /* RPC may not be configured */ });
        }

        // Queue welcome email
        const welcomeName = first_name || 'Legend';
        await admin.from('email_queue').insert({
            recipient_email: email.toLowerCase(),
            template_id: 'WELCOME',
            template_data: { name: welcomeName },
            status: 'pending',
            send_at: new Date().toISOString(), // Send immediately
            campaign_type: 'welcome_sequence'
        });

        // Log the capture
        await admin.from('system_logs').insert({
            action_type: 'lead_captured',
            description: `New lead: ${email} via ${source}`,
            metadata: {
                lead_id: newLead.id,
                source,
                user_type,
                island_origin,
                is_diaspora,
                lead_magnet_id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Welcome to the island family!',
            lead_id: newLead.id,
            is_new: true
        });

    } catch (error) {
        console.error('Lead capture error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET endpoint to check if email exists (for gating logic)
export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
        return NextResponse.json({ exists: false });
    }

    const admin = createAdminClient();
    const { data } = await admin
        .from('leads')
        .select('id, status')
        .eq('email', email.toLowerCase())
        .eq('status', 'active')
        .single();

    return NextResponse.json({
        exists: !!data,
        lead_id: data?.id
    });
}
