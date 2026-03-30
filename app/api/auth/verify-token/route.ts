import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// RBAC roles
const ROLES = {
  admin: 10,
  moderator: 5,
  user: 1,
  guest: 0,
};

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token with Supabase
    const supabase = createClient(supabaseUrl || '', '', {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user role from database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_admin')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'user';
    const isAdmin = profile?.is_admin || data.user.email?.includes('admin');

    return NextResponse.json(
      {
        valid: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role,
          isAdmin,
          roleLevel: ROLES[role as keyof typeof ROLES] || ROLES.guest,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
