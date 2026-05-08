'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { DeliveryAddress } from '@/types'

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

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addr, setAddr] = useState<DeliveryAddress>({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (profile) {
        setFullName(profile.full_name ?? '')
        setPhone(profile.phone ?? '')
        if (profile.address) setAddr(profile.address)
      }
      setLoading(false)
    })
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) throw new Error('Not logged in')
      const { error: err } = await supabase.from('profiles').upsert({
        id: data.user.id, full_name: fullName, phone,
        address: addr.line1 ? addr : null,
        updated_at: new Date().toISOString(),
      })
      if (err) throw err
      setSaved(true)
      setTimeout(() => router.push('/account'), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e8e8e5', borderTopColor: '#0d0d0d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e5', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/account" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>← Account</Link>
        <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, letterSpacing: '4px', textTransform: 'uppercase' }}>Edit Profile</span>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <form onSubmit={handleSave}>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16 }}>
            <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px' }}>Personal Info</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inp} />
            </div>
            <div>
              <label style={lbl}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inp} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginBottom: 16 }}>
            <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Default Address</h2>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 20px' }}>Auto-filled at checkout when signed in</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Receiver Name</label>
                <input value={addr.name} onChange={e => setAddr(a => ({ ...a, name: e.target.value }))} placeholder="Receiver's name" style={inp} />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" style={inp} />
              </div>
              <div>
                <label style={lbl}>Pincode</label>
                <input value={addr.pincode} onChange={e => setAddr(a => ({ ...a, pincode: e.target.value }))} placeholder="600001" maxLength={6} style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Address Line 1</label>
                <input value={addr.line1} onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))} placeholder="House/Flat No., Street" style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Address Line 2 (optional)</label>
                <input value={addr.line2 ?? ''} onChange={e => setAddr(a => ({ ...a, line2: e.target.value }))} placeholder="Landmark, Area" style={inp} />
              </div>
              <div>
                <label style={lbl}>City</label>
                <input value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} placeholder="Chennai" style={inp} />
              </div>
              <div>
                <label style={lbl}>State</label>
                <input value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} placeholder="Tamil Nadu" style={inp} />
              </div>
            </div>
          </div>

          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#c0392b' }}>{error}</div>}

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '15px', borderRadius: 40, border: 'none',
            background: saved ? '#16a34a' : saving ? '#ccc' : '#0d0d0d',
            color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '2px',
            textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Barlow, sans-serif', transition: 'background 0.3s',
          }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
