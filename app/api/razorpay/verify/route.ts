import { NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { createSupabaseServer } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json()

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

    // Update order in DB
    const supabase = createSupabaseServer()
    await supabase.from('orders').update({
      payment_status: 'paid',
      payment_method: 'razorpay',
      razorpay_order_id,
      razorpay_payment_id,
      status: 'confirmed',
    }).eq('id', order_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
