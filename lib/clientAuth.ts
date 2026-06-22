'use client'

import { supabase } from '@/lib/supabase'

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut()
  const message = error?.message?.toLowerCase() ?? ''

  if (error && !message.includes('session')) {
    throw error
  }
}
