import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { contest_id, score } = await req.json();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Insert contest entry
    const { data, error } = await supabase
      .from('contest_entries')
      .insert({
        contest_id,
        user_id: user.id,
        score,
        submitted_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update contest product sales
    await supabase.rpc('update_contest_leaderboard', {
      p_contest_id: contest_id,
    });

    return NextResponse.json({
      success: true,
      entry: data,
    });
  } catch (err) {
    console.error('Contest submission error:', err);
    return NextResponse.json(
      { error: 'Failed to submit contest entry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contest_id');

    const supabase = createClient();

    // Get leaderboard (top 100)
    const { data, error } = await supabase
      .from('contest_entries')
      .select(`
        *,
        user_id,
        score
      `)
      .eq('contest_id', contestId)
      .order('score', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ leaderboard: data });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
