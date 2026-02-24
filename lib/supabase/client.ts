
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

// Custom storage that bypasses NavigatorLock issues
class NoLockStorage implements Storage {
    private store = new Map<string, string>();

    getItem(key: string): string | null {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch {
            // Ignore quota errors
        }
        return this.store.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.store.set(key, value);
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch {
            // Ignore quota errors
        }
    }

    removeItem(key: string): void {
        this.store.delete(key);
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignore errors
        }
    }

    clear(): void {
        this.store.clear();
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
            }
        } catch {
            // Ignore errors
        }
    }

    key(index: number): string | null {
        return Array.from(this.store.keys())[index] ?? null;
    }

    get length(): number {
        return this.store.size;
    }
}

// Singleton client for browser
let browserClient: any;

export const createClient = () => {
    if (typeof window === 'undefined') {
        return createBrowserClient(getValidUrl(), getValidKey());
    }

    if (!browserClient) {
        const storage = new NoLockStorage();

        browserClient = createBrowserClient(
            getValidUrl(),
            getValidKey(),
            {
                cookieOptions: {
                    name: 'sb-likkle-auth',
                },
                db: {
                    schema: 'auth',
                },
                auth: {
                    storageKey: 'sb-likkle-auth',
                    storage: storage,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                },
            }
        );
    }
    return browserClient;
}
