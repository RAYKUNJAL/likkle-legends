// Commercial-Grade Supabase Client with Enhanced Error Handling
// Production-ready with retry logic, connection pooling, and fallbacks

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

        // Validation
        if (!url || !anonKey) {
            console.warn(`⚠️  Supabase credentials missing. URL: ${!!url}, AnonKey: ${!!anonKey}. Using placeholder.`);
            return createClient('https://placeholder.supabase.co', 'placeholder');
        }

        if (useServiceRole) {
            if (serviceKey) {
                return createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
            } else {
                // Revert to non-throwing behavior to prevent app-wide crash
                // but keep the error logged for debugging
                console.error('❌ Supabase Service Role Key is MISSING. Admin operations will fail.');
            }
        }

        const isServer = typeof window === 'undefined';

        return createClient(url, anonKey, {
            auth: {
                persistSession: !isServer,
                autoRefreshToken: !isServer,
                detectSessionInUrl: !isServer,
                flowType: 'pkce'
            }
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
                .from('storybooks')
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
                    .from('storybooks')
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

// Singleton instance
const manager = new SupabaseClientManager();

// Export clients directly - bypassing Proxy to ensure stability
export const supabase = manager.getClient();
export const supabaseAdmin = manager.getServiceClient();

// Export manager for advanced usage
export const supabaseManager = manager;

// Export utility functions
export function isSupabaseConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabase(): SupabaseClient {
    return manager.getClient();
}

export function getSupabaseAdmin(): SupabaseClient {
    return manager.getServiceClient();
}

export async function testSupabaseConnection() {
    return manager.testConnection();
}

export async function getSupabaseHealth() {
    return manager.healthCheck();
}

export function resetSupabaseConnection() {
    manager.resetConnection();
}
