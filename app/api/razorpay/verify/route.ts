export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { getStringField, isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  try {
    const body = await readJsonBody(req)
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid verification request' }, { status: 400 })
    }

    const razorpay_order_id = getStringField(body, 'razorpay_order_id', 96)
    const razorpay_payment_id = getStringField(body, 'razorpay_payment_id', 96)
    const razorpay_signature = getStringField(body, 'razorpay_signature', 256)
    const order_id = getStringField(body, 'order_id', 64)

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !UUID_PATTERN.test(order_id)) {
      return NextResponse.json({ error: 'Missing verification fields' }, { status: 400 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const supabase = createSupabaseAdmin()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Order access denied' }, { status: 403 })
    }
    if (
      order.payment_method !== 'razorpay' ||
      order.payment_status !== 'pending' ||
      order.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json({ error: 'Order does not match this payment' }, { status: 400 })
    }

    const valid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    )

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('payment_status', 'pending')

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      payment_status: 'pending',
      message: 'Payment received. Final confirmation is completed by Razorpay webhook.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 },
    )
  }
}
