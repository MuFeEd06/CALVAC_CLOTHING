import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Unable to load orders' }, { status: 400 })
  }

  return NextResponse.json({ orders: data ?? [] })
}
