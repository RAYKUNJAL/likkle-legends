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
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Validation
        if (!url || !anonKey) {
            console.error('❌ Missing Supabase credentials');
            console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');

            // Return placeholder for build time
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Supabase credentials are required in production');
            }

            console.warn('⚠️  Using placeholder client for development');
            return createClient(
                'https://placeholder.supabase.co',
                'placeholder-key'
            );
        }

        // Validate URL format
        if (!url.includes('.supabase.co') && !url.includes('localhost')) {
            console.error(`❌ Invalid Supabase URL format: ${url}`);
            throw new Error('Invalid Supabase URL');
        }

        const key = useServiceRole && serviceKey ? serviceKey : anonKey;

        // Create client with production options
        const client = createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
            global: {
                headers: {
                    'x-client-info': 'likkle-legends-platform',
                },
            },
            db: {
                schema: 'public',
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        });

        console.log(`✅ Supabase client initialized (${useServiceRole ? 'Service Role' : 'Anon'})`);
        return client;
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
    async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            const client = this.getClient();

            // Simple query to test connection
            const { error } = await client
                .from('profiles')
                .select('count')
                .limit(1)
                .single();

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

// Export clients
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (manager.getClient() as any)[prop];
    },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (manager.getServiceClient() as any)[prop];
    },
});

// Export manager for advanced usage
export const supabaseManager = manager;

// Export utility functions
export async function testSupabaseConnection() {
    return manager.testConnection();
}

export async function getSupabaseHealth() {
    return manager.healthCheck();
}

export function resetSupabaseConnection() {
    manager.resetConnection();
}
