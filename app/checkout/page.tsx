'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { supabase } from '@/lib/supabase'
import { buildWhatsAppMessage, openWhatsApp, generateOrderNumber } from '@/lib/whatsapp'
import type { DeliveryAddress, PaymentMethod } from '@/types'

type Step = 'details' | 'payment'
type AuthMode = 'guest' | 'login' | 'signup'

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 10,
  border: '1.5px solid #e8e8e5', fontSize: 14,
  fontFamily: 'Barlow, sans-serif', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '2px',
  textTransform: 'uppercase', color: '#888',
  display: 'block', marginBottom: 6, fontFamily: 'Barlow, sans-serif',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<Step>('details')
  const [authMode, setAuthMode] = useState<AuthMode>('guest')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')

  // Auth fields
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')

  // Delivery details
  const [addr, setAddr] = useState<DeliveryAddress>({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
  })

  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUser(data.user)
      // Load profile to auto-fill address
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (profile) {
        if (profile.full_name) setAddr(a => ({ ...a, name: a.name || profile.full_name }))
        if (profile.phone) setAddr(a => ({ ...a, phone: a.phone || profile.phone }))
        if (profile.address?.line1) setAddr(profile.address)
      } else if (data.user.user_metadata?.full_name) {
        setAddr(a => ({ ...a, name: data.user.user_metadata.full_name }))
      }
    })
    supabase.from('site_settings').select('whatsapp_number').single()
      .then(({ data }) => { if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number) })
  }, [])

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Barlow, sans-serif', background: '#f5f5f3' }}>
        <p style={{ fontSize: 18, fontWeight: 600 }}>Your cart is empty</p>
        <Link href="/shop" style={{ padding: '10px 24px', background: '#0d0d0d', color: '#fff', borderRadius: 40, textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '2px' }}>SHOP NOW</Link>
      </div>
    )
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName } } })
        if (error) throw error
        const { error: e2 } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (e2) throw e2
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (error) throw error
      }
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user?.user_metadata?.full_name) setAddr(a => ({ ...a, name: data.user!.user_metadata.full_name }))
    } catch (err: any) { setAuthError(err.message) }
    finally { setAuthLoading(false) }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const validateAddr = () => {
    if (!addr.name.trim()) return 'Name is required'
    if (!addr.phone.trim() || addr.phone.length < 10) return 'Valid phone number required'
    if (!addr.line1.trim()) return 'Address line 1 is required'
    if (!addr.city.trim()) return 'City is required'
    if (!addr.state.trim()) return 'State is required'
    if (!addr.pincode.trim() || addr.pincode.length < 6) return 'Valid pincode required'
    return null
  }

  const placeOrder = async (method: PaymentMethod) => {
    const addrError = validateAddr()
    if (addrError) { setError(addrError); return }

    setLoading(true); setError('')
    const orderNumber = generateOrderNumber()

    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] ?? '',
        size: item.size,
        color: item.color.name,
        price: item.color.price ?? item.product.price,
        quantity: item.quantity,
      }))

      if (method === 'whatsapp') {
        // Save order to DB
        const { data: order } = await supabase.from('orders').insert({
          order_number: orderNumber,
          user_id: user?.id ?? null,
          customer_name: addr.name,
          customer_phone: addr.phone,
          customer_email: user?.email ?? null,
          delivery_address: addr,
          items: orderItems,
          subtotal: subtotal,
          status: 'pending',
          payment_method: 'whatsapp',
          payment_status: 'whatsapp_pending',
        }).select().single()

        // Open WhatsApp
        const msg = buildWhatsAppMessage(items, addr.name, addr.phone,
          `${addr.line1}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`)
        if (whatsappNumber) openWhatsApp(whatsappNumber, msg)

        clearCart()
        router.push(`/checkout/success?order=${orderNumber}&method=whatsapp`)
        return
      }

      if (method === 'cod') {
        await supabase.from('orders').insert({
          order_number: orderNumber,
          user_id: user?.id ?? null,
          customer_name: addr.name,
          customer_phone: addr.phone,
          customer_email: user?.email ?? null,
          delivery_address: addr,
          items: orderItems,
          subtotal: subtotal,
          status: 'confirmed',
          payment_method: 'cod',
          payment_status: 'cod_pending',
        })
        clearCart()
        router.push(`/checkout/success?order=${orderNumber}&method=cod`)
        return
      }

      if (method === 'razorpay') {
        // Create order in DB first
        const { data: dbOrder } = await supabase.from('orders').insert({
          order_number: orderNumber,
          user_id: user?.id ?? null,
          customer_name: addr.name,
          customer_phone: addr.phone,
          customer_email: user?.email ?? null,
          delivery_address: addr,
          items: orderItems,
          subtotal: subtotal,
          status: 'pending',
          payment_method: 'razorpay',
          payment_status: 'pending',
        }).select().single()

        // Create Razorpay order
        const rpRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: subtotal, orderNumber }),
        })
        const rpOrder = await rpRes.json()
        if (!rpRes.ok) throw new Error(rpOrder.error || 'Payment init failed')

        // Open Razorpay checkout
        const win = window as any
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rpOrder.amount,
          currency: 'INR',
          name: 'CALVAC',
          description: `Order ${orderNumber}`,
          order_id: rpOrder.id,
          prefill: { name: addr.name, contact: addr.phone, email: user?.email ?? '' },
          theme: { color: '#f04e0f' },
          handler: async (response: any) => {
            // Verify on server
            await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, order_id: dbOrder?.id }),
            })
            clearCart()
            router.push(`/checkout/success?order=${orderNumber}&method=razorpay`)
          },
          modal: { ondismiss: () => setLoading(false) },
        }
        if (!win.Razorpay) { setError('Payment gateway not loaded. Please refresh.'); setLoading(false); return }
        const rp = new win.Razorpay(options)
        rp.open()
        return
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      if (method !== 'razorpay') setLoading(false)
    }
  }

  const s = {
    card: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16 } as React.CSSProperties,
    section: { fontSize: 13, fontWeight: 700, letterSpacing: '1px', marginBottom: 16, fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' as const, fontSize: 15 } as React.CSSProperties,
  }

  return (
    <>
      {/* Load Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: 'Barlow, sans-serif' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '6px', textDecoration: 'none', color: '#0d0d0d' }}>CALVAC</Link>
          <span style={{ fontSize: 13, color: '#888' }}>Checkout</span>
          <Link href="/shop" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>← Continue shopping</Link>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* ── AUTH SECTION ── */}
            <div style={s.card}>
              <p style={s.section}>Account</p>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{user.user_metadata?.full_name ?? user.email}</p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{user.email}</p>
                  </div>
                  <button onClick={handleSignOut} style={{ fontSize: 12, color: '#888', background: 'none', border: '1px solid #e8e8e5', borderRadius: 20, padding: '5px 14px', cursor: 'pointer' }}>Sign out</button>
                </div>
              ) : (
                <>
                  {/* Auth mode tabs */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['guest', 'login', 'signup'] as AuthMode[]).map(m => (
                      <button key={m} onClick={() => setAuthMode(m)} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', background: authMode === m ? '#0d0d0d' : '#f0f0ee', color: authMode === m ? '#fff' : '#666', transition: 'all 0.15s', fontFamily: 'Barlow, sans-serif' }}>
                        {m === 'guest' ? 'Guest' : m === 'login' ? 'Sign In' : 'Sign Up'}
                      </button>
                    ))}
                  </div>

                  {authMode === 'guest' && (
                    <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>Continuing as guest. <Link href="/login" style={{ color: '#f04e0f', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link> to save your order history.</p>
                  )}

                  {(authMode === 'login' || authMode === 'signup') && (
                    <form onSubmit={handleAuth}>
                      {authMode === 'signup' && (
                        <div style={{ marginBottom: 14 }}>
                          <label style={lbl}>Full Name</label>
                          <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Your name" required style={inp} />
                        </div>
                      )}
                      <div style={{ marginBottom: 14 }}>
                        <label style={lbl}>Email</label>
                        <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" required style={inp} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>Password</label>
                        <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inp} />
                      </div>
                      {authError && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{authError}</p>}
                      <button type="submit" disabled={authLoading} style={{ padding: '10px 24px', borderRadius: 40, border: 'none', background: '#0d0d0d', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Barlow, sans-serif' }}>
                        {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* ── DELIVERY ADDRESS ── */}
            <div style={s.card}>
              <p style={s.section}>Delivery Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Full Name *</label>
                  <input value={addr.name} onChange={e => setAddr(a => ({ ...a, name: e.target.value }))} placeholder="Receiver's name" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Phone *</label>
                  <input value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Pincode *</label>
                  <input value={addr.pincode} onChange={e => setAddr(a => ({ ...a, pincode: e.target.value }))} placeholder="600001" maxLength={6} style={inp} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Address Line 1 *</label>
                  <input value={addr.line1} onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))} placeholder="House/Flat No., Street" style={inp} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Address Line 2</label>
                  <input value={addr.line2} onChange={e => setAddr(a => ({ ...a, line2: e.target.value }))} placeholder="Landmark, Area (optional)" style={inp} />
                </div>
                <div>
                  <label style={lbl}>City *</label>
                  <input value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} placeholder="Chennai" style={inp} />
                </div>
                <div>
                  <label style={lbl}>State *</label>
                  <input value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} placeholder="Tamil Nadu" style={inp} />
                </div>
              </div>
            </div>

            {/* ── PAYMENT ── */}
            <div style={s.card}>
              <p style={s.section}>Payment Method</p>
              {error && <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c0392b' }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* WhatsApp — always available */}
                <button
                  onClick={() => placeOrder('whatsapp')}
                  disabled={loading}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '2px solid #25d366', background: loading ? '#f5f5f3' : '#f0fff4', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', textAlign: 'left' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Order via WhatsApp</p>
                    <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Send your order directly — no login required</p>
                  </div>
                </button>

                {/* COD — always available */}
                <button
                  onClick={() => placeOrder('cod')}
                  disabled={loading}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '2px solid #e8e8e5', background: loading ? '#f5f5f3' : '#fff', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', textAlign: 'left' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f5f5f3', border: '2px solid #e0e0de', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01M6 12h.01M18 12h.01"/></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Cash on Delivery</p>
                    <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>Pay when your order arrives</p>
                  </div>
                </button>

                {/* Razorpay — only if user is logged in */}
                <button
                  onClick={() => user ? placeOrder('razorpay') : setAuthMode('login')}
                  disabled={loading}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: `2px solid ${user ? '#0d0d0d' : '#e8e8e5'}`, background: user ? '#0d0d0d' : '#f5f5f5', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', textAlign: 'left', opacity: user ? 1 : 0.7 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: user ? '#f04e0f' : '#e0e0de', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: user ? '#fff' : '#0d0d0d' }}>
                      Pay Online {!user && '(Sign in required)'}
                    </p>
                    <p style={{ fontSize: 12, color: user ? 'rgba(255,255,255,0.6)' : '#aaa', margin: '2px 0 0' }}>
                      {user ? 'Credit/Debit Card, UPI, Net Banking' : 'Sign in above to pay online'}
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={s.card}>
              <p style={s.section}>Order Summary</p>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < items.length - 1 ? '1px solid #f0f0ee' : 'none' }}>
                    <div style={{ width: 64, height: 72, borderRadius: 8, overflow: 'hidden', background: '#f0f0ee', flexShrink: 0 }}>
                      {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} width={64} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>{item.product.name}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px' }}>{item.color.name} · Size {item.size} · Qty {item.quantity}</p>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0d0d0d', margin: 0 }}>₹{((item.color.price ?? item.product.price) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #e8e8e5', paddingTop: 14, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#666' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#666' }}>
                  <span>Delivery</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>To be confirmed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #e8e8e5' }}>
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
