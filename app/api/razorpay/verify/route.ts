export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
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
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('payment_status', 'pending')

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_method: 'razorpay',
        razorpay_payment_id,
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('payment_status', 'pending')

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Payment verification failed' },
      { status: 500 },
    )
  }
}
