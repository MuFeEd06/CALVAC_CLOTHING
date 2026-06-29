export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { createRazorpayOrder, RAZORPAY_ENABLED, RAZORPAY_PUBLIC_KEY_ID } from '@/lib/razorpay'
import { validateCheckoutItems } from '@/lib/checkoutValidation'
import { getPaymentMethodSettings } from '@/lib/siteSettings'
import { getStringField, isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  if (!RAZORPAY_ENABLED) {
    return NextResponse.json({ error: 'Online payment is unavailable' }, { status: 503 })
  }

  try {
    const body = await readJsonBody(req)
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid payment request' }, { status: 400 })
    }

    const orderId = getStringField(body, 'orderId', 64)
    if (!UUID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const supabase = createSupabaseAdmin()

    const { data: settings } = await supabase
      .from('site_settings')
      .select('page_configs')
      .single()
    const paymentMethods = getPaymentMethodSettings(settings as any)
    if (!paymentMethods.razorpay) {
      return NextResponse.json({ error: 'Payment method currently unavailable' }, { status: 403 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Order access denied' }, { status: 403 })
    }
    if (order.payment_method !== 'razorpay' || order.payment_status !== 'pending') {
      return NextResponse.json({ error: 'Order is not eligible for online payment' }, { status: 400 })
    }

    const validated = await validateCheckoutItems(supabase, order.items)
    const razorpayOrder = await createRazorpayOrder(validated.subtotal, order.order_number)

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        items: validated.items,
        subtotal: validated.subtotal,
        razorpay_order_id: razorpayOrder.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('payment_status', 'pending')

    if (updateError) throw updateError

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_PUBLIC_KEY_ID,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unable to start online payment' },
      { status: 500 },
    )
  }
}
