import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session created' },
        { status: 401 }
      );
    }

    // Create response with session token in httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        user: data.user,
        redirectUrl: '/portal/dashboard',
      },
      { status: 200 }
    );

    // Set httpOnly cookie with session token
    response.cookies.set({
      name: 'auth_token',
      value: data.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
