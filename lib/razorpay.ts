// ─── Razorpay utilities ───────────────────────────────────────
// Stub: activate by setting RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars

export const RAZORPAY_ENABLED = !!(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
)

export interface RazorpayOrderResult {
  id: string
  amount: number
  currency: string
}

// Called server-side to create a Razorpay order
export async function createRazorpayOrder(amount: number, orderNumber: string): Promise<RazorpayOrderResult> {
  if (!RAZORPAY_ENABLED) throw new Error('Razorpay not configured')

  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: orderNumber,
    }),
  })

  if (!res.ok) throw new Error('Failed to create Razorpay order')
  return res.json()
}

// Called server-side to verify payment signature
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (!RAZORPAY_ENABLED) return false
  const crypto = require('crypto')
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === razorpaySignature
}
