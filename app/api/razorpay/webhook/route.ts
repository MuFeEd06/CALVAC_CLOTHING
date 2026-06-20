export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'
import {
  RAZORPAY_WEBHOOK_ENABLED,
  verifyRazorpayWebhookSignature,
} from '@/lib/razorpay'
import { readTextBody } from '@/lib/security'

const MAX_WEBHOOK_BYTES = 256 * 1024

type RazorpayEntity = Record<string, unknown>
type RazorpayWebhookPayload = {
  event?: unknown
  created_at?: unknown
  payload?: {
    payment?: { entity?: RazorpayEntity }
    order?: { entity?: RazorpayEntity }
  }
}

function stringField(entity: RazorpayEntity | undefined, key: string) {
  const value = entity?.[key]
  return typeof value === 'string' ? value : ''
}

function numberField(entity: RazorpayEntity | undefined, key: string) {
  const value = entity?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export async function POST(req: Request) {
  if (!RAZORPAY_WEBHOOK_ENABLED) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    const eventIdHeader = req.headers.get('x-razorpay-event-id')?.trim()
    const rawBody = await readTextBody(req, MAX_WEBHOOK_BYTES)

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload
    const eventType = typeof payload.event === 'string' ? payload.event : ''
    if (!eventType) {
      return NextResponse.json({ error: 'Invalid webhook event' }, { status: 400 })
    }

    const payment = payload.payload?.payment?.entity
    const razorpayOrder = payload.payload?.order?.entity
    const paymentId = stringField(payment, 'id')
    const razorpayOrderId = stringField(payment, 'order_id') || stringField(razorpayOrder, 'id')
    const eventId =
      eventIdHeader ||
      `${eventType}:${paymentId || razorpayOrderId || 'unknown'}:${String(payload.created_at ?? '')}`

    const supabase = createSupabaseAdmin()
    const { error: eventError } = await supabase
      .from('payment_events')
      .insert({
        provider: 'razorpay',
        event_id: eventId,
        event_type: eventType,
        payload,
      })

    if (eventError?.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    if (eventError) throw eventError

    const { data: order } = razorpayOrderId
      ? await supabase
          .from('orders')
          .select('id, subtotal, payment_method, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle()
      : { data: null }

    if (!order || order.payment_method !== 'razorpay') {
      await supabase
        .from('payment_events')
        .update({ processed_at: new Date().toISOString() })
        .eq('provider', 'razorpay')
        .eq('event_id', eventId)
      return NextResponse.json({ received: true })
    }

    const now = new Date().toISOString()
    const amountPaid =
      numberField(payment, 'amount') ??
      numberField(razorpayOrder, 'amount_paid') ??
      numberField(razorpayOrder, 'amount')
    const expectedAmount = Math.round(Number(order.subtotal) * 100)
    const amountMatches = amountPaid !== null && amountPaid === expectedAmount

    if ((eventType === 'payment.captured' || eventType === 'order.paid') && amountMatches) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_payment_id: paymentId || undefined,
          updated_at: now,
        })
        .eq('id', order.id)
    } else if (eventType === 'payment.failed') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'pending',
          razorpay_payment_id: paymentId || undefined,
          updated_at: now,
        })
        .eq('id', order.id)
        .neq('payment_status', 'paid')
    } else if (eventType === 'payment.authorized' && paymentId) {
      await supabase
        .from('orders')
        .update({
          razorpay_payment_id: paymentId,
          updated_at: now,
        })
        .eq('id', order.id)
        .eq('payment_status', 'pending')
    }

    await supabase
      .from('payment_events')
      .update({ order_id: order.id, processed_at: now })
      .eq('provider', 'razorpay')
      .eq('event_id', eventId)

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
