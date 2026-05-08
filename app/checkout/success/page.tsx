import Link from 'next/link'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Order Confirmed — CALVAC' }

export default function SuccessPage({ searchParams }: { searchParams: { order?: string; method?: string } }) {
  const { order, method } = searchParams
  const isWhatsApp = method === 'whatsapp'
  const isCOD = method === 'cod'
  const isPaid = method === 'razorpay'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: isPaid ? '#dcfce7' : isWhatsApp ? '#dcfce7' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
          {isPaid ? '✓' : isWhatsApp ? '💬' : '📦'}
        </div>

        <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 36, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          {isPaid ? 'Payment Confirmed!' : isWhatsApp ? 'Order Sent!' : 'Order Placed!'}
        </h1>

        {order && (
          <p style={{ fontSize: 13, color: '#888', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24 }}>
            Order #{order}
          </p>
        )}

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left' }}>
          {isWhatsApp && (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>
              Your order has been sent to us via WhatsApp. Our team will confirm your order and delivery charges shortly. Please keep your phone handy!
            </p>
          )}
          {isCOD && (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>
              Your Cash on Delivery order has been placed. We'll confirm your order and dispatch it soon. Pay when it arrives at your door!
            </p>
          )}
          {isPaid && (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>
              Your payment was successful and your order is confirmed. We'll dispatch it soon!
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" style={{ padding: '12px 28px', borderRadius: 40, background: '#0d0d0d', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Continue Shopping
          </Link>
          <Link href="/account/orders" style={{ padding: '12px 28px', borderRadius: 40, background: 'none', border: '1.5px solid #0d0d0d', color: '#0d0d0d', textDecoration: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
