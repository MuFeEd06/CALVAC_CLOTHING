import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

// ─── Server-side Supabase client (for Server Components + API routes) ──
export function createSupabaseServer() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'supabase-anon-key-placeholder'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null

  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))
  return user
}

function normalizeAdminEmail(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function getAdminEmailAllowlist() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(/[\s,;]+/)
    .map(normalizeAdminEmail)
    .filter(Boolean)
}

export function isAdminUser(user: Pick<User, 'email' | 'app_metadata'> | null | undefined) {
  if (!user) return false

  const metadata = user.app_metadata as Record<string, unknown> | undefined
  if (metadata?.role === 'admin' || metadata?.is_admin === true) return true

  const email = normalizeAdminEmail(user.email)
  return !!email && getAdminEmailAllowlist().includes(email)
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
