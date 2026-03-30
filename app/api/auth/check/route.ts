import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
