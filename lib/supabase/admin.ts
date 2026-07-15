import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// SERVER-ONLY. Never import this in a client component — it uses the
// service_role key which bypasses Row Level Security entirely.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
