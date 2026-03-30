import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, childName } = await request.json();

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        child_name: childName || '',
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create profile in database
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        subscription_status: 'free',
        trial_used: false,
        is_admin: false,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Note: User is created in auth even if profile fails
    }

    return NextResponse.json(
      {
        success: true,
        userId: authData.user.id,
        email: authData.user.email,
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Account creation error:', error);
    return NextResponse.json(
      { error: 'Account creation failed' },
      { status: 500 }
    );
  }
}
