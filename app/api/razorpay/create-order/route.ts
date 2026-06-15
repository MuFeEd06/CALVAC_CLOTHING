export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import { createRazorpayOrder, RAZORPAY_ENABLED } from '@/lib/razorpay'
import { validateCheckoutItems } from '@/lib/checkoutValidation'
import { getPaymentMethodSettings } from '@/lib/siteSettings'

export async function POST(req: Request) {
  if (!RAZORPAY_ENABLED) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

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

    return NextResponse.json(razorpayOrder)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Payment init failed' },
      { status: 500 },
    )
  }
}
