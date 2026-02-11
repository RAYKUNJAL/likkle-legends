
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refresh the session
    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        // Safe fail for build or missing env
    }

    // Protected routes logic
    const isPortal = request.nextUrl.pathname.startsWith('/portal');
    const isAdmin = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/central' && request.nextUrl.pathname !== '/admin';

    if (isPortal || isAdmin) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Auth routes logic (redirect if already logged in)
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
        if (user) {
            const redirectTo = request.nextUrl.searchParams.get('redirect') || '/portal';
            return NextResponse.redirect(new URL(redirectTo, request.url))
        }
    }

    return response
}
