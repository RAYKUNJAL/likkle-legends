import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

type ServiceStatus = 'ok' | 'error' | 'unconfigured';

interface ServiceCheck {
    status: ServiceStatus;
    latency?: string;
    message?: string;
}

async function checkDatabase(): Promise<ServiceCheck> {
    const supabase = supabaseAdmin;
    if (!supabase) {
        return { status: 'unconfigured', message: 'Supabase not configured' };
    }
    const start = Date.now();
    try {
        const { error } = await supabase.from('site_settings').select('count').limit(1).maybeSingle();
        const latency = Date.now() - start;
        // PGRST116 = multiple/no results; still means DB is reachable
        const ok = !error || error.code === 'PGRST116';
        return { status: ok ? 'ok' : 'error', latency: `${latency}ms`, message: ok ? undefined : error?.message };
    } catch (e: any) {
        return { status: 'error', latency: `${Date.now() - start}ms`, message: e.message };
    }
}

function checkEnvService(keyNames: string[], label: string): ServiceCheck {
    const missing = keyNames.filter(k => !process.env[k]);
    if (missing.length === 0) return { status: 'ok' };
    return { status: 'unconfigured', message: `${label} API key not configured` };
}

async function checkElevenLabs(): Promise<ServiceCheck> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return { status: 'unconfigured', message: 'ElevenLabs API key not configured' };
    const start = Date.now();
    try {
        const res = await fetch('https://api.elevenlabs.io/v1/user', {
            headers: { 'xi-api-key': apiKey },
            signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;
        return res.ok
            ? { status: 'ok', latency: `${latency}ms` }
            : { status: 'error', latency: `${latency}ms`, message: `HTTP ${res.status}` };
    } catch (e: any) {
        return { status: 'error', latency: `${Date.now() - start}ms`, message: e.message };
    }
}

export async function GET() {
    try {
        const [database, elevenLabs] = await Promise.all([
            checkDatabase(),
            checkElevenLabs(),
        ]);

        const ai = checkEnvService(
            ['GOOGLE_GENERATIVE_AI_API_KEY', 'GEMINI_API_KEY'],
            'Gemini AI'
        );
        const payments = checkEnvService(['NEXT_PUBLIC_PAYPAL_CLIENT_ID'], 'PayPal');
        const email = checkEnvService(['RESEND_API_KEY'], 'Resend Email');

        const services = { database, ai, voice: elevenLabs, payments, email };

        const hasError = Object.values(services).some(s => s.status === 'error');
        const hasUnconfigured = Object.values(services).some(s => s.status === 'unconfigured');
        const overallStatus = hasError ? 'degraded' : hasUnconfigured ? 'degraded' : 'operational';

        return NextResponse.json(
            {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services,
            },
            { status: hasError || hasUnconfigured ? 503 : 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Health check failed',
                error: String(error),
            },
            { status: 500 }
        );
    }
}
