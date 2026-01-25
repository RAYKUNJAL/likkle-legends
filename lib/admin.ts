import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseManager } from './supabase-client';

export function createAdminClient(): SupabaseClient {
    return supabaseManager.getServiceClient();
}
