import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — safe to import at the top level without causing SSR crashes.
// NOTE: This client uses the ANON key and is NOT cookie-aware (no session from
// SSR server actions). For authenticated server-component queries, use
// lib/supabase/server.ts. For SSR-synced browser queries, use lib/supabase/client.ts.

let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

export default getSupabaseClient
// Note: export the FUNCTION, not getSupabaseClient() — don't call it at module level
