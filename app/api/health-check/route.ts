import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        api_keys: !!process.env.ANTHROPIC_API_KEY,
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
