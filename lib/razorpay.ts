import crypto from 'crypto'

// Server-side Razorpay utilities.
// Public key id is safe for the browser; the secret is never imported client-side.
export const RAZORPAY_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_WEBHOOK_SECRET,
)
export const RAZORPAY_WEBHOOK_ENABLED = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET)
export const RAZORPAY_PUBLIC_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''

export interface RazorpayOrderResult {
  id: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(
  amount: number,
  orderNumber: string,
): Promise<RazorpayOrderResult> {
  if (!RAZORPAY_ENABLED) throw new Error('Online payment is currently unavailable')

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

  if (!res.ok) throw new Error('Unable to start online payment')

  return res.json()
}

function timingSafeHexEqual(expectedHex: string, receivedHex: string) {
  const expected = Buffer.from(expectedHex)
  const received = Buffer.from(receivedHex)
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
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

  return timingSafeHexEqual(expectedSignature, razorpaySignature)
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature || !rawBody) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return timingSafeHexEqual(expectedSignature, signature)
}
