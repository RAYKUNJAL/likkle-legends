import { NextResponse } from 'next/server';

// Never statically cache — stale builds previously reported api_keys:false forever.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
      '';
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks: {
        supabase: !!supabaseUrl,
        supabase_public: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
        api_keys: !!(
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
          process.env.GOOGLE_API_KEY
        ),
        paypal: !!(process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID),
        cron_secret: !!process.env.CRON_SECRET,
      },
      supabase_host: (() => {
        try {
          return supabaseUrl ? new URL(supabaseUrl).host : null;
        } catch {
          return 'invalid-url';
        }
      })(),
    };

    return NextResponse.json(health, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
