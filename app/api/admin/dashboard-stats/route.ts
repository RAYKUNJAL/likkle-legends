import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api/require-admin-token';
import { createAdminClient } from '@/lib/admin';
import { logAdminAction, extractIpAddress } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    // Validate admin token before processing
    const adminInfo = await requireAdminToken(request);

    const supabaseAdmin = createAdminClient();

    // Get stats
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: totalChildren } = await supabaseAdmin
      .from('children')
      .select('id', { count: 'exact', head: true });

    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: revenueData } = await supabaseAdmin
      .from('subscriptions')
      .select('current_period_end')
      .eq('status', 'active');

    // Calculate stats
    const estimatedMonthlyRevenue = (activeSubscriptions || 0) * 9.99; // Average plan price

    // Log the action (non-blocking) - viewing stats is a read operation
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && serviceKey && adminInfo) {
        const { createClient } = await import('@supabase/supabase-js');
        const loggingClient = createClient(url, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        logAdminAction(
          loggingClient,
          adminInfo.user.id,
          adminInfo.user.email || '',
          'other',
          'setting',
          undefined,
          { action: 'viewed_dashboard_stats' },
          extractIpAddress(Object.fromEntries(request.headers))
        );
      }
    } catch (auditError) {
      console.error('Failed to log dashboard stats view:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          totalChildren: totalChildren || 0,
          activeSubscriptions: activeSubscriptions || 0,
          estimatedMonthlyRevenue: estimatedMonthlyRevenue.toFixed(2),
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
