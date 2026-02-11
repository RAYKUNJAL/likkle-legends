
import { supabaseManager } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("📚 Fetching stories for library...");

        const client = supabaseManager.getClient();

        const { data: stories, error } = await client
            .from('storybooks')
            .select('*')
            .eq('is_active', false) // Currently we only save as is_active=false (pending). Change to true if we auto-approve.
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ stories });

    } catch (e: any) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
