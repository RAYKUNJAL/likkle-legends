
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    // Only allow relative paths — block open redirects like //evil.com
    const rawNext = searchParams.get('next') ?? '/portal';
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/portal';

    if (code) {
        const cookieStore = cookies()
        const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0MDMyMjUsImV4cCI6MTkzMTk3OTIyNX0.placeholder';
        const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
        const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
        const supabaseUrl = (rawUrl && rawUrl.startsWith('https://') && rawUrl.length > 15) ? rawUrl : 'https://placeholder.supabase.co';
        const supabaseKey = (rawKey && rawKey.length > 20 && rawKey !== 'false') ? rawKey : PLACEHOLDER_KEY;
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Ensure a profile row exists for OAuth users (Google, Facebook, etc.)
            // Email/password users have their profile created in signupAction.
            const user = sessionData?.user;
            if (user) {
                const { supabaseAdmin } = await import('@/lib/supabase-client');
                await Promise.resolve(
                    supabaseAdmin.from('profiles').upsert(
                        {
                            id: user.id,
                            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                            is_coppa_designated_parent: true,
                            coppa_consent_date: new Date().toISOString(),
                        },
                        { onConflict: 'id', ignoreDuplicates: true }
                    )
                ).catch(err => console.error('[AUTH CALLBACK] Profile upsert failed:', err));
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
