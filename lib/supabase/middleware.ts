
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0MDMyMjUsImV4cCI6MTkzMTk3OTIyNX0.placeholder';
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    const supabaseUrl = (rawUrl && rawUrl.startsWith('https://') && rawUrl.length > 15) ? rawUrl : 'https://placeholder.supabase.co';
    const supabaseKey = (rawKey && rawKey.length > 20 && rawKey !== 'false') ? rawKey : PLACEHOLDER_KEY;

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookieOptions: {
                name: 'sb-likkle-auth',
            },
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
        // Use getSession instead of getUser to avoid lock contention
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
            user = session.user;
        }
    } catch (e) {
        // Safe fail for build or missing env
        console.debug('[Middleware] Auth check failed (expected during build):', typeof e === 'object' && e && 'message' in e ? (e as any).message : 'unknown error');
    }

    // Protected routes logic
    const isPortal = request.nextUrl.pathname.startsWith('/portal');
    const isAdmin = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/central' && request.nextUrl.pathname !== '/admin';

    // Auth routes logic (redirect if already logged in)
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
        if (user) {
            const redirectTo = request.nextUrl.searchParams.get('redirect') || '/portal';
            const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

            // Critical: Copy session cookies to the redirect response
            const cookies = response.cookies.getAll();
            cookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
            });

            return redirectResponse;
        }
    }

    // Protected routes logic (redirect if not logged in)
    if (isPortal || isAdmin) {
        if (!user) {
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url));

            // Critical: Copy cleared/updated cookies to the redirect response
            // (e.g. if getUser failed and cleared the cookie)
            const cookies = response.cookies.getAll();
            cookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
            });

            return redirectResponse;
        }
    }

    return response
}
