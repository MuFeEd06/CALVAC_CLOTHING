import { NextResponse } from 'next/server'
import { createRazorpayOrder, RAZORPAY_ENABLED } from '@/lib/razorpay'

export async function POST(req: Request) {
  if (!RAZORPAY_ENABLED) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }
  try {
    const { amount, orderNumber } = await req.json()
    if (!amount || !orderNumber) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const order = await createRazorpayOrder(amount, orderNumber)
    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
