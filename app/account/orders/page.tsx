import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import { createSupabaseServer } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Orders — CALVAC' }

const statusColor: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#16a34a', cancelled: '#ef4444',
}
const statusLabel: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled',
}
const paymentLabel: Record<string, string> = {
  whatsapp: '💬 WhatsApp', cod: '📦 Cash on Delivery', razorpay: '💳 Online Payment',
}
const paymentStatusLabel: Record<string, string> = {
  pending: 'Awaiting', paid: 'Paid', cod_pending: 'Pay on delivery',
  whatsapp_pending: 'Confirm via WhatsApp', failed: 'Failed',
}

export default async function OrdersPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/account/orders')

  const [settings, supabase] = await Promise.all([
    getSiteSettings().catch(() => null),
    Promise.resolve(createSupabaseServer()),
  ])

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar settings={settings} />
      <main style={{ minHeight: '100vh', background: '#f5f5f3', paddingTop: 100, fontFamily: 'Barlow, sans-serif' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <Link href="/account" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>← Account</Link>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 42, margin: 0, letterSpacing: '-0.5px' }}>My Orders</h1>
          </div>

          {!orders || orders.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
              <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>No orders yet</p>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>When you place an order, it will appear here.</p>
              <Link href="/shop" style={{ padding: '12px 28px', background: '#0d0d0d', color: '#fff', borderRadius: 40, textDecoration: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map((order: any) => (
                <div key={order.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                  {/* Order header */}
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Order #{order.order_number}</p>
                      <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', background: statusColor[order.status] + '18', color: statusColor[order.status] }}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 18 }}>
                        ₹{order.subtotal?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      {(order.items ?? []).map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 52, height: 60, borderRadius: 8, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                            {item.product_image && (
                              <Image src={item.product_image} alt={item.product_name} width={52} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 3px' }}>{item.product_name}</p>
                            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{item.color} · Size {item.size} · Qty {item.quantity}</p>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f0f0ee', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 16 }}>
                        <span>{paymentLabel[order.payment_method] ?? order.payment_method}</span>
                        <span style={{ color: order.payment_status === 'paid' ? '#16a34a' : '#f59e0b' }}>
                          {paymentStatusLabel[order.payment_status] ?? order.payment_status}
                        </span>
                      </div>
                      {order.delivery_address && (
                        <p style={{ fontSize: 11, color: '#aaa', margin: 0, maxWidth: 280 }}>
                          📍 {order.delivery_address.line1}, {order.delivery_address.city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </>
  )
}
