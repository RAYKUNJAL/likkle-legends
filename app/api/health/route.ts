import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

// Lazy initialize Supabase to avoid build-time errors
function getSupabase(): SupabaseClient | null {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return null;
        _supabase = createClient(url, key);
    }
    return _supabase;
}

export async function GET() {
    try {
        const start = Date.now();
        const supabase = getSupabase();

        if (!supabase) {
            return NextResponse.json(
                { status: 'degraded', message: 'Supabase not configured' },
                { status: 503 }
            );
        }

        // 1. Check Database connection
        const { data, error } = await supabase.from('site_settings').select('count').limit(1).maybeSingle();

        // Even if table doesn't exist, a response from Supabase means it's reachable.
        // We handle specific error code for "relation does not exist" as success for connectivity check.
        // But better is to check something standard like heartbeat if exists.
        // "site_settings" was seen in sql, so maybe. 
        // Or just auth check.

        const dbLatency = Date.now() - start;
        const dbStatus = error && error.code !== 'PGRST116' ? 'error' : 'ok'; // PGRST116 is 'JSON object requested, multiple (or no) results returned' which is fine.

        return NextResponse.json(
            {
                status: dbStatus === 'ok' ? 'operational' : 'degraded',
                timestamp: new Date().toISOString(),
                services: {
                    database: {
                        status: dbStatus,
                        latency: `${dbLatency}ms`
                    },
                    api: {
                        status: 'ok',
                        uptime: process.uptime()
                    }
                }
            },
            { status: dbStatus === 'ok' ? 200 : 503 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Health check failed',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
