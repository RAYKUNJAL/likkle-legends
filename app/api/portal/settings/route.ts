import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch island portal
    const { data: portal } = await supabase
      .from('island_portals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      subscription,
      portal,
    });
  } catch (err) {
    console.error('Portal settings error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updates = await req.json();

    // Update island portal settings
    const { data, error } = await supabase
      .from('island_portals')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ portal: data });
  } catch (err) {
    console.error('Portal update error:', err);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
