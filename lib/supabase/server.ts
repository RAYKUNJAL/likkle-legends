import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverEnv } from '@/lib/env/server';

export const createClient = () => {
  const cookieStore = cookies();

  // CRITICAL: use the PUBLIC Supabase URL (same as the browser client) so that
  // cookie names match. @supabase/ssr derives the auth cookie name from the URL —
  // if the server uses an internal URL (http://supabase-kong:8000) and the browser
  // uses the public URL (https://www.likklelegends.com/supabase), the cookie names
  // differ and the browser can never read the session → login loop / flicker.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    serverEnv.SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    serverEnv.SUPABASE_ANON_KEY;

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (_e) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
