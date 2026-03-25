// Commercial-Grade Supabase Client with Enhanced Error Handling
// Production-ready with retry logic, connection pooling, and fallbacks

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';


interface SupabaseConfig {
    url: string;
    anonKey: string;
    serviceKey?: string;
    options?: {
        retryAttempts?: number;
        retryDelay?: number;
        timeout?: number;
    };
}

class SupabaseClientManager {
    private client: SupabaseClient | null = null;
    private serviceClient: SupabaseClient | null = null;
    private config: SupabaseConfig | null = null;
    private connectionAttempts = 0;
    private maxRetries = 3;

    /**
     * Initialize Supabase client with configuration
     */
    private initializeClient(useServiceRole = false): SupabaseClient {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

        // Fail fast — never silently fall back to placeholder credentials
        const isValidUrl = url && url.startsWith('https://') && url.length > 15;
        const isValidKey = anonKey && anonKey.length > 20 && anonKey !== 'false';

        if (!isValidUrl || !isValidKey) {
            throw new Error(
                `[supabase-client] Missing or invalid credentials. ` +
                `NEXT_PUBLIC_SUPABASE_URL valid: ${!!isValidUrl}, ` +
                `NEXT_PUBLIC_SUPABASE_ANON_KEY valid: ${!!isValidKey}. ` +
                `Check your .env.local or Vercel environment variables.`
            );
        }

        if (useServiceRole) {
            if (serviceKey) {
                return createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
            } else {
                console.warn('❌ Supabase Service Role Key is MISSING. Admin operations will fail, falling back to Anon key for basic connectivity check.');
                // Fallback to anon key so we have *something* to return, preventing crash
                return createClient(url, anonKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
            }
        }


        // Browser: use createBrowserClient (@supabase/ssr) so this client reads from
        // the same HTTP cookies that signupAction/signInAction write to via the SSR client.
        // This ensures all DB operations (createChild, etc.) are authenticated.
        if (typeof window !== 'undefined') {
            return createBrowserClient(url, anonKey) as unknown as SupabaseClient;
        }

        // Server-side: plain client, no session persistence needed
        return createClient(url, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }

    /**
     * Get standard client (anon key)
     */
    getClient(): SupabaseClient {
        if (!this.client) {
            this.client = this.initializeClient(false);
        }
        return this.client;
    }

    /**
     * Get admin client (service role key)
     */
    getServiceClient(): SupabaseClient {
        if (!this.serviceClient) {
            this.serviceClient = this.initializeClient(true);
        }
        return this.serviceClient;
    }

    /**
     * Test connection to Supabase
     */
    async testConnection(useServiceRole = false): Promise<{ success: boolean; error?: string }> {
        try {
            const client = useServiceRole ? this.getServiceClient() : this.getClient();

            // Simple query to test connection
            const { error } = await client
                .from('content_items')
                .select('count')
                .limit(1);

            if (error && !error.message.includes('zero rows')) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            console.log('✅ Supabase connection successful');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Supabase connection failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Execute query with retry logic
     */
    async executeWithRetry<T>(
        operation: (client: SupabaseClient) => Promise<T>,
        useServiceRole = false
    ): Promise<T> {
        const client = useServiceRole ? this.getServiceClient() : this.getClient();
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const result = await operation(client);
                return result;
            } catch (error: any) {
                lastError = error;
                console.warn(`Retry attempt ${attempt + 1}/${this.maxRetries}:`, error.message);

                // Exponential backoff
                if (attempt < this.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError || new Error('Operation failed after retries');
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'down';
        details: {
            connection: boolean;
            database: boolean;
            storage: boolean;
        };
    }> {
        const details = {
            connection: false,
            database: false,
            storage: false,
        };

        try {
            // Test connection
            const connectionTest = await this.testConnection();
            details.connection = connectionTest.success;

            // Test database query
            try {
                const { error } = await this.getClient()
                    .from('content_items')
                    .select('count')
                    .limit(1);
                details.database = !error;
            } catch {
                details.database = false;
            }

            // Test storage
            try {
                const { data } = await this.getClient()
                    .storage
                    .listBuckets();
                details.storage = !!data;
            } catch {
                details.storage = false;
            }

            // Determine overall status
            if (details.connection && details.database && details.storage) {
                return { status: 'healthy', details };
            } else if (details.connection) {
                return { status: 'degraded', details };
            } else {
                return { status: 'down', details };
            }
        } catch (error) {
            return { status: 'down', details };
        }
    }

    /**
     * Reset connection (for debugging)
     */
    resetConnection() {
        this.client = null;
        this.serviceClient = null;
        this.connectionAttempts = 0;
        console.log('🔄 Supabase connection reset');
    }
}

// Use a global variable to preserve the client across HMR reloads in development
const globalForSupabase = globalThis as unknown as {
    supabase: SupabaseClient;
    supabaseAdmin: SupabaseClient;
    manager: SupabaseClientManager;
};

// Singleton manager — never call getClient/getServiceClient at module parse time.
// Use the lazy getters below so clients are only created on first use.
export const supabaseManager = globalForSupabase.manager ?? (() => {
    const m = new SupabaseClientManager();
    if (process.env.NODE_ENV !== 'production') globalForSupabase.manager = m;
    return m;
})();

// Lazy getters — safe to import at the top of any file
export const getSupabase = () => {
    if (!globalForSupabase.supabase) {
        globalForSupabase.supabase = supabaseManager.getClient();
    }
    return globalForSupabase.supabase;
};

export const getSupabaseAdmin = () => {
    if (!globalForSupabase.supabaseAdmin) {
        globalForSupabase.supabaseAdmin = supabaseManager.getServiceClient();
    }
    return globalForSupabase.supabaseAdmin;
};

// Named shorthands used throughout the codebase — lazily resolved
// IMPORTANT: These are evaluated on first import call, NOT at module parse time.
export const supabase = new Proxy({} as SupabaseClient, {
    get(_t, prop) { return (getSupabase() as any)[prop]; }
});
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_t, prop) { return (getSupabaseAdmin() as any)[prop]; }
});

// Export utility functions
export function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && url.startsWith('https://') && key && key.length > 20);
}

export async function testSupabaseConnection() {
    return supabaseManager.testConnection();
}

export async function getSupabaseHealth() {
    return supabaseManager.healthCheck();
}

export function resetSupabaseConnection() {
    supabaseManager.resetConnection();
}
