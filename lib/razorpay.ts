import crypto from 'crypto'

// Server-side Razorpay utilities.
// Public key id is safe for the browser; the secret is never imported client-side.
export const RAZORPAY_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
)

export interface RazorpayOrderResult {
  id: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(
  amount: number,
  orderNumber: string,
): Promise<RazorpayOrderResult> {
  if (!RAZORPAY_ENABLED) throw new Error('Razorpay not configured')

  const amountInPaise = Math.round(amount * 100)
  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    throw new Error('Invalid Razorpay amount')
  }

  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString('base64')

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
    }),
  })

  if (!res.ok) throw new Error('Failed to create Razorpay order')

  return res.json()
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  if (!RAZORPAY_ENABLED || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  const expected = Buffer.from(expectedSignature)
  const received = Buffer.from(razorpaySignature)
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}
