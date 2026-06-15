export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createSupabaseServer } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', req.url))
}
