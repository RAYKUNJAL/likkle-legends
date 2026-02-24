
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

// Monkey-patch navigator.locks to prevent timeout
if (typeof window !== 'undefined' && navigator.locks) {
    const originalRequest = navigator.locks.request;
    navigator.locks.request = function(name: string, options: any, callback: any) {
        // Reduce timeout aggressively
        const patchedOptions = {
            ...options,
            signal: AbortSignal.timeout(1000) // 1 second max
        };
        return originalRequest.call(this, name, patchedOptions, callback).catch((err: any) => {
            if (err?.name === 'AbortError' || err?.message?.includes('timeout')) {
                console.warn(`[Supabase] Lock timeout for ${name}, continuing without lock`);
                // Continue anyway
                return callback(null);
            }
            throw err;
        });
    };
}

// Singleton client for browser
let browserClient: any;

export const createClient = () => {
    if (typeof window === 'undefined') {
        return createBrowserClient(getValidUrl(), getValidKey());
    }

    if (!browserClient) {
        browserClient = createBrowserClient(
            getValidUrl(),
            getValidKey(),
            {
                cookieOptions: {
                    name: 'sb-likkle-auth',
                },
                auth: {
                    storageKey: 'sb-likkle-auth',
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce',
                },
                // Disable the problematic lock entirely
                global: {
                    headers: {
                        'X-Client-Info': 'likkle-legends'
                    }
                }
            }
        );
    }
    return browserClient;
}
