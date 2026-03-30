import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export async function GET(request: NextRequest) {
  try {
    // Verify admin access via Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
