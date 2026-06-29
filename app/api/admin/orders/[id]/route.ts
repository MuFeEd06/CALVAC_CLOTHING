import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { OrderStatus } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
  }

  const body = await readJsonBody(req).catch(() => null)
  if (!isRecord(body) || !STATUS_OPTIONS.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('orders')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Unable to update order' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
