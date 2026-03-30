import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response to clear cookies
    const response = NextResponse.json(
      { success: true, redirectUrl: '/' },
      { status: 200 }
    );

    // Clear auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expires the cookie
      path: '/',
    });

    // Clear any Supabase session cookies
    const cookieNames = ['sb-auth-token', 'sb-access-token'];
    cookieNames.forEach((name) => {
      response.cookies.set({
        name,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
