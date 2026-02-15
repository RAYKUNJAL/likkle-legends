
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Build-time safety: return a mock/placeholder client if keys are missing
    if (!url || !key || url === 'false' || key === 'false') {
        console.warn('⚠️ Supabase credentials missing during server-side client creation. Using placeholders.');
        return createServerClient(
            'https://placeholder.supabase.co',
            'placeholder',
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { }
                }
            }
        );
    }

    const cookieStore = cookies()

    return createServerClient(
        url,
        key,
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
}
