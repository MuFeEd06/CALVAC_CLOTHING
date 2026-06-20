export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createSupabaseServer } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sameOriginGuard } from '@/lib/security'

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const supabase = createSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', req.url))
}
