/**
 * API Route Authentication Utilities
 * Provides secure session verification for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { serverEnv } from '@/lib/env/server';

/**
 * Get authenticated user from request cookies
 * Returns the user object if valid session exists, null otherwise
 */
export async function getAuthenticatedUser(request: NextRequest) {
    try {
        const supabaseUrl = serverEnv.SUPABASE_URL;
        const supabaseKey = serverEnv.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('[API Auth] Supabase credentials not configured');
            return null;
        }

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll() {
                    // No-op for reading session
                },
            },
        });

        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            return null;
        }

        return data.user;
    } catch (error) {
        console.error('[API Auth] Session verification failed:', error);
        return null;
    }
}

/**
 * Verify that the authenticated user matches the requested userId
 * Returns user object if valid, null/error response otherwise
 *
 * This prevents users from impersonating other users
 */
export async function verifyUserAccess(
    request: NextRequest,
    requestedUserId: string | null | undefined
): Promise<{ user: any; error?: NextResponse }> {
    // Get authenticated user from session
    const authenticatedUser = await getAuthenticatedUser(request);

    // No valid session
    if (!authenticatedUser) {
        return {
            user: null,
            error: NextResponse.json(
                { error: 'Unauthorized - Authentication required' },
                { status: 401 }
            ),
        };
    }

    // Request contains a userId that doesn't match session
    if (requestedUserId && requestedUserId !== authenticatedUser.id) {
        console.warn(
            `[API Auth] Impersonation attempt: User ${authenticatedUser.id} tried to access ${requestedUserId}`
        );
        return {
            user: null,
            error: NextResponse.json(
                { error: 'Forbidden - Cannot access other user data' },
                { status: 403 }
            ),
        };
    }

    return { user: authenticatedUser };
}

/**
 * Middleware for protecting API routes
 * Use this to wrap POST/GET handlers that require authentication
 */
export function withAuth(
    handler: (
        req: NextRequest,
        userId: string
    ) => Promise<NextResponse>
) {
    return async (req: NextRequest) => {
        try {
            const authenticatedUser = await getAuthenticatedUser(req);

            if (!authenticatedUser) {
                return NextResponse.json(
                    { error: 'Unauthorized - Authentication required' },
                    { status: 401 }
                );
            }

            // Call the handler with the authenticated user's ID
            return await handler(req, authenticatedUser.id);
        } catch (error: any) {
            console.error('[API Auth] Request handling failed:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}
