import { createBrowserClient } from '@supabase/ssr'

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey)

const supabaseUrl = configuredSupabaseUrl ?? 'http://127.0.0.1:54321'
const supabaseAnonKey = configuredSupabaseAnonKey ?? 'supabase-anon-key-placeholder'

// Browser client — safe to use in Client Components
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
