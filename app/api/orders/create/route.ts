export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/auth'
import {
  formatDeliveryAddress,
  generateServerOrderNumber,
  normalizeDeliveryAddress,
  validateCheckoutItems,
} from '@/lib/checkoutValidation'
import { getPaymentMethodSettings } from '@/lib/siteSettings'
import type { PaymentMethod, PaymentStatus, OrderStatus } from '@/types'

const PAYMENT_METHODS: PaymentMethod[] = ['whatsapp', 'cod', 'razorpay']

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHODS.includes(value as PaymentMethod)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const method = body.payment_method

    if (!isPaymentMethod(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

    if (method === 'razorpay' && !user) {
      return NextResponse.json({ error: 'Sign in required for online payment' }, { status: 401 })
    }

    const { data: settings } = await supabase
      .from('site_settings')
      .select('page_configs')
      .single()

    const paymentMethods = getPaymentMethodSettings(settings as any)
    if (!paymentMethods[method]) {
      return NextResponse.json({ error: 'Payment method currently unavailable' }, { status: 403 })
    }

    const deliveryAddress = normalizeDeliveryAddress(body.delivery_address)
    const { items, subtotal } = await validateCheckoutItems(supabase, body.items)
    const orderNumber = generateServerOrderNumber()

    const status: OrderStatus = method === 'cod' ? 'confirmed' : 'pending'
    const paymentStatus: PaymentStatus =
      method === 'cod'
        ? 'cod_pending'
        : method === 'whatsapp'
          ? 'whatsapp_pending'
          : 'pending'

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        customer_name: deliveryAddress.name,
        customer_phone: deliveryAddress.phone,
        customer_email: user?.email ?? null,
        customer_address: formatDeliveryAddress(deliveryAddress),
        delivery_address: deliveryAddress,
        items,
        subtotal,
        status,
        payment_method: method,
        payment_status: paymentStatus,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unable to create order' },
      { status: 400 },
    )
  }
}
