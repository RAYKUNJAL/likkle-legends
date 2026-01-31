
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    // GROWTH ENGINE: Capture Referral Code
    const refCode = request.nextUrl.searchParams.get('ref');
    if (refCode) {
        // Set a 30-day cookie for the referral
        response.cookies.set('likkle_ref', refCode, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax',
            httpOnly: false // Allow client-side access if needed
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
    ],
}
