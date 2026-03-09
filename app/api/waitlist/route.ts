import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

function normalizeCountry(country?: string): string | null {
    if (!country) return null;
    const value = country.trim().toLowerCase();
    if (value === 'uk' || value === 'gb' || value === 'united kingdom') return 'United Kingdom';
    if (value === 'ca' || value === 'canada') return 'Canada';
    if (value === 'us' || value === 'usa' || value === 'united states') return 'United States';
    if (value === 'other') return 'Other International';
    return country.trim();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, parentName, childName, country } = body;
        const normalizedCountry = normalizeCountry(country);

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Check if already exists in leads (ignore "no rows" errors)
        const { data: existing } = await supabaseAdmin
            .from('leads')
            .select('id')
            .eq('email', normalizedEmail)
            .single();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already on the list' });
        }

        // Primary path: insert into leads for growth segmentation.
        const { error: leadsError } = await supabaseAdmin
            .from('leads')
            .insert({
                email: normalizedEmail,
                first_name: parentName || null,
                current_location: normalizedCountry,
                source: 'waitlist',
                status: 'active',           // CHECK: 'active' | 'unsubscribed' | 'bounced' | 'spam_reported'
                utm_campaign: 'landing_v3_waitlist_modal',
                interests: childName ? [childName] : [], // store child name in interests JSONB as workaround
            });

        if (!leadsError) {
            return NextResponse.json({ success: true });
        }

        // Fallback path: always capture in waitlist table (RLS allows public inserts).
        // This keeps UK/CA waitlist flow working even when leads is restricted.
        console.warn('Waitlist leads insert failed, falling back to waitlist table:', leadsError.message);
        const { error: waitlistError } = await supabaseAdmin
            .from('waitlist')
            .insert({
                email: normalizedEmail,
                metadata: {
                    parentName: parentName || null,
                    childName: childName || null,
                    country: normalizedCountry,
                    source: 'landing_v3_waitlist_modal'
                },
                created_at: new Date().toISOString()
            });

        if (waitlistError && waitlistError.code !== '23505') {
            console.error('Waitlist fallback error:', waitlistError);
            return NextResponse.json({ error: waitlistError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, fallback: true });
    } catch (error: any) {
        console.error('Waitlist API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
