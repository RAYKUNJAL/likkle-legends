import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, parentName, childName, country } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if already exists
        const { data: existing } = await supabaseAdmin
            .from('leads')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already on the list' });
        }

        const { error } = await supabaseAdmin
            .from('leads')
            .insert({
                email,
                child_name: childName,
                island_preference: country, // Map country/region here or use metadata
                source: 'waitlist',
                status: 'new',
                metadata: {
                    parent_name: parentName,
                    source_modal: 'landing_v3_modal',
                    signup_date: new Date().toISOString()
                }
            });

        if (error) {
            console.error('Waitlist error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Waitlist API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
