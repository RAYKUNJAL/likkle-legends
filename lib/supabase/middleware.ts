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
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
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

    const pathname = request.nextUrl.pathname;

    const isAuthCookieName = (name: string) =>
        /^sb-[^-]+-auth-token(?:\.\d+)?$/.test(name) || /^sb-[^-]+-auth-token-code-verifier$/.test(name);

    const sanitizeRedirectPath = (value: string | null) => {
        if (!value || !value.startsWith('/') || value.startsWith('//')) return '/portal';
        if (value === '/login' || value.startsWith('/login?') || value === '/signup' || value.startsWith('/signup?')) {
            return '/portal';
        }
        return value;
    };

    let user = null;
    try {
        const hasAuthCookie = request.cookies.getAll().some(c => isAuthCookieName(c.name));
        if (hasAuthCookie) {
            const { data, error } = await supabase.auth.getUser();
            if (!error) {
                user = data.user;
            }
        }
    } catch {
        user = null;
    }

    const isPortal = pathname.startsWith('/portal');
    const isAdmin = pathname.startsWith('/admin') && pathname !== '/admin/central' && pathname !== '/admin';

    if (pathname === '/login' || pathname === '/signup') {
        if (user) {
            const redirectTo = sanitizeRedirectPath(request.nextUrl.searchParams.get('redirect'));
            const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

            const cookies = response.cookies.getAll();
            cookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
            });

            return redirectResponse;
        }
    }

    if (isPortal || isAdmin) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const redirectResponse = NextResponse.redirect(loginUrl);

            const cookies = response.cookies.getAll();
            cookies.forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
            });

            return redirectResponse;
        }
    }

    return response
}
