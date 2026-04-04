import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { island_code, island_name } = await req.json();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Character mapping
    const characters = {
      TT: 'Tanty Spice',
      JM: 'Dilly Doubles',
      BB: 'Scorcha Pepper',
      GD: 'Mango Moko',
      GY: 'R.O.T.I.',
      LC: 'Tanty Spice',
    };

    const characterName = characters[island_code] || 'Tanty Spice';

    // Create island portal
    const { data, error } = await supabase
      .from('island_portals')
      .insert({
        user_id: user.id,
        island_code,
        island_name,
        character_name: characterName,
        daily_fact: `Welcome to ${island_name}!`,
        theme_colors: {
          primary: '#FFD23F',
          secondary: '#2EC4B6',
        },
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      portal: data,
      message: `Welcome to your ${island_name} adventure!`,
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    return NextResponse.json(
      { error: 'Onboarding failed' },
      { status: 500 }
    );
  }
}
