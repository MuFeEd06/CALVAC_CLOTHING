'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      setError(error?.message ?? 'Invalid credentials. Try again.')
      setLoading(false)
      return
    }

    // Hard navigate so the server re-reads the new cookie
    window.location.href = '/admin'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'Barlow, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 900, fontSize: 52, letterSpacing: '8px',
            color: '#fff', margin: 0, textTransform: 'uppercase'
          }}>CALVAC</h1>
          <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@calvac.com"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', padding: '14px 16px', fontSize: 14,
                outline: 'none', fontFamily: 'inherit', borderRadius: 4,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10 }}>
              Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', padding: '14px 48px 14px 16px', fontSize: 14,
                outline: 'none', fontFamily: 'inherit', borderRadius: 4,
                boxSizing: 'border-box'
              }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 14, top: 42,
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 16, padding: 0
            }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 4, padding: '10px 14px',
              color: '#f87171', fontSize: 13
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#c0390a' : '#f04e0f',
              color: '#fff', border: 'none', borderRadius: 4,
              padding: '15px', fontSize: 13, fontWeight: 700,
              letterSpacing: '4px', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Barlow Condensed", sans-serif',
              marginTop: 4, transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
