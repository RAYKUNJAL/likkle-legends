
import { createBrowserClient } from '@supabase/ssr'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0MDMyMjUsImV4cCI6MTkzMTk3OTIyNX0.placeholder';

function getValidUrl(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    return (url && url.startsWith('https://') && url.length > 15) ? url : PLACEHOLDER_URL;
}

function getValidKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    return (key && key.length > 20 && key !== 'false') ? key : PLACEHOLDER_KEY;
}

// CRITICAL: Disable NavigatorLock before Supabase tries to use it
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    if (navigator.locks) {
        navigator.locks.request = async function (_name: string, _options: any, callback: any) {
            try {
                const result = await callback({
                    release: () => Promise.resolve(),
                    signal: new AbortSignal(),
                });
                return result;
            } catch (err) {
                console.warn('[Supabase] Lock bypassed, continuing', (err as any)?.message);
                return undefined;
            }
        } as any;
    }
}

// Singleton browser client — uses @supabase/ssr createBrowserClient so it reads
// from the same HTTP cookies that the SSR server client writes to.
// This ensures sessions set by server actions are immediately visible client-side.
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
    if (typeof window === 'undefined') {
        // Server-side (e.g. called from a shared util): return a fresh instance
        // Note: prefer using lib/supabase/server.ts in server components/actions
        return createBrowserClient(getValidUrl(), getValidKey());
    }

    if (!browserClient) {
        browserClient = createBrowserClient(getValidUrl(), getValidKey());
    }
    return browserClient;
};
