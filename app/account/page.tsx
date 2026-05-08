import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserProfile } from '@/lib/auth'
import { createSupabaseServer } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account — CALVAC' }

export default async function AccountPage() {
  const user = await getUser()
  if (!user) redirect('/login?redirect=/account')

  const [profile, settings] = await Promise.all([
    getUserProfile(user.id),
    getSiteSettings().catch(() => null),
  ])

  const supabase = createSupabaseServer()
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_method, payment_status, subtotal, created_at, items')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
    delivered: '#16a34a', cancelled: '#ef4444',
  }
  const paymentLabel: Record<string, string> = {
    whatsapp: '💬 WhatsApp', cod: '📦 COD', razorpay: '💳 Online',
  }

  return (
    <>
      <Navbar settings={settings} />
      <main style={{ minHeight: '100vh', background: '#f5f5f3', paddingTop: 100, fontFamily: 'Barlow, sans-serif' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 42, margin: '0 0 6px', letterSpacing: '-0.5px' }}>My Account</h1>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>{user.email}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Profile card */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 20, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Profile</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f04e0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', flexShrink: 0 }}>
                  {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 3px' }}>{profile?.full_name ?? 'No name set'}</p>
                  <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{user.email}</p>
                  {profile?.phone && <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>{profile.phone}</p>}
                </div>
              </div>
              {profile?.address && (
                <div style={{ background: '#f9f9f8', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                  📍 {profile.address.line1}{profile.address.line2 ? `, ${profile.address.line2}` : ''}, {profile.address.city}, {profile.address.state} - {profile.address.pincode}
                </div>
              )}
              <Link href="/account/edit" style={{ display: 'inline-block', padding: '8px 20px', border: '1.5px solid #0d0d0d', borderRadius: 40, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d' }}>
                Edit Profile
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#0d0d0d', borderRadius: 20, padding: 28, color: '#fff', flex: 1 }}>
                <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>Total Orders</p>
                <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 48, margin: 0, lineHeight: 1 }}>{recentOrders?.length ?? 0}</p>
              </div>
              <Link href="/account/orders" style={{ background: '#f04e0f', borderRadius: 20, padding: 20, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>View All Orders</span>
                <span style={{ fontSize: 20 }}>→</span>
              </Link>
            </div>
          </div>

          {/* Recent orders */}
          {recentOrders && recentOrders.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 20, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Orders</h2>
                <Link href="/account/orders" style={{ fontSize: 12, color: '#f04e0f', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentOrders.map((order: any) => (
                  <div key={order.id} style={{ border: '1px solid #f0f0ee', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px' }}>#{order.order_number}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{paymentLabel[order.payment_method] ?? order.payment_method}
                        {' · '}{order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 16 }}>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', background: statusColor[order.status] + '20', color: statusColor[order.status] }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign out */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" style={{ fontSize: 13, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Barlow, sans-serif' }}>
                Sign out
              </button>
            </form>
          </div>

        </div>
      </main>
      <Footer settings={settings} />
    </>
  )
}
