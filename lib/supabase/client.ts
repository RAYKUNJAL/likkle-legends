
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
    // Completely override the locks API to disable it
    if (navigator.locks) {
        navigator.locks.request = async function(name: string, options: any, callback: any) {
            // Skip the lock entirely - just run the callback immediately
            try {
                const result = await callback({
                    release: () => Promise.resolve(),
                    signal: new AbortSignal(),
                });
                return result;
            } catch (err) {
                console.warn('[Supabase] Lock bypassed, continuing', err?.message);
                return undefined;
            }
        } as any;
    }
}

// Singleton client for browser - using direct client without SSR wrapper to avoid lock issues
let browserClient: any;

export const createClient = () => {
    if (typeof window === 'undefined') {
        // Server-side: use direct client
        return createSupabaseClient(getValidUrl(), getValidKey());
    }

    if (!browserClient) {
        // Browser-side: use direct client with simple storage (no NavigatorLock issues)
        browserClient = createSupabaseClient(
            getValidUrl(),
            getValidKey(),
            {
                auth: {
                    storageKey: 'sb-likkle-auth',
                    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                },
                headers: {
                    'X-Client-Info': 'likkle-legends',
                }
            }
        );
    }
    return browserClient;
}
