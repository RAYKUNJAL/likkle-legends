'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — never initialized at module parse time.
// Uses @supabase/ssr createBrowserClient so it reads from the same HTTP cookies
// that server actions write to, keeping user sessions in sync.
let browserClient: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!url || !url.startsWith('https://')) {
        console.error('❌ [supabase/client] NEXT_PUBLIC_SUPABASE_URL is missing or invalid.');
        return {} as any;
    }
    if (!key || key.length < 20) {
        console.error('❌ [supabase/client] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid.');
        return {} as any;
    }

    // Reuse the singleton on the browser — avoids duplicate subscriptions
    if (typeof window !== 'undefined') {
        if (!browserClient) {
            browserClient = createBrowserClient(url, key) as unknown as SupabaseClient;
        }
        return browserClient;
    }

    // Server-side (e.g. called from a shared util):
    // prefer lib/supabase/server.ts in server components/actions
    return createBrowserClient(url, key) as unknown as SupabaseClient;
};
