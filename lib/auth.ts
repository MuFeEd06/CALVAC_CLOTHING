import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { UserProfile } from '@/types'

// ─── Server-side Supabase client (for Server Components + API routes) ──
export function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// ─── Get current user (server side) ──────────────────────────
export async function getUser() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Get user profile ─────────────────────────────────────────
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseServer()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

// ─── Require auth — returns user or null (don't redirect here) ─
export async function requireUser() {
  const user = await getUser()
  return user
}
