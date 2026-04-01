import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { serverEnv } from '@/lib/env/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = serverEnv.SUPABASE_URL;
    const supabaseKey = serverEnv.SUPABASE_ANON_KEY;

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

        // Add server-side role check for admin routes
        if (isAdmin) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', user.id)
                .single();

            // Check for explicit admin role in database only (removed email-based privilege escalation)
            const isUserAdmin = profile?.role === 'admin' || profile?.is_admin === true;

            if (profileError || !isUserAdmin) {
                console.warn(`[AUTH] Unauthorized admin access attempt by ${user.email} (id: ${user.id}) to ${pathname}`);
                // Redirect to portal if not an admin
                const portalUrl = new URL('/portal', request.url);
                const redirectResponse = NextResponse.redirect(portalUrl);

                const cookies = response.cookies.getAll();
                cookies.forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
                });

                return redirectResponse;
            }
        }
    }

    return response
}
