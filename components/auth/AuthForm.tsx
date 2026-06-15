'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup'
interface Props { mode: Mode }

export default function AuthForm({ mode }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect  = searchParams.get('redirect') ?? '/'
  const redirect     = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/'
  const redirectQuery = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''

  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [notice,   setNotice]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signup') {
        const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}${redirect}` : undefined
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo,
          },
        })
        if (error) throw error
        if (!data.session) {
          setNotice('Check your email to confirm your account, then sign in. If custom SMTP is enabled in Supabase, this email will use that sender.')
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      const message = err.message ?? 'Something went wrong'
      setError(message.toLowerCase().includes('email not confirmed') ? 'Please confirm your email before signing in.' : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f5f5f3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      /* safe area padding for notched phones */
      padding: 'max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))',
      fontFamily: 'Barlow, sans-serif',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 700, fontSize: 'clamp(24px,6vw,28px)', letterSpacing: '8px',
            textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d',
          }}>CALVAC</Link>
          <p style={{ marginTop: 8, fontSize: 14, color: '#888' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: 'clamp(20px,5vw,32px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
        }}>
          <form onSubmit={handleSubmit} noValidate>

            {mode === 'signup' && (
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name" required
                  autoComplete="name"
                  style={inp}
                />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                autoComplete="email"
                inputMode="email"
                style={inp}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'} required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={inp}
              />
            </div>

            {error && (
              <div style={{
                background: '#fff0f0', border: '1px solid #ffd0d0',
                borderRadius: 10, padding: '11px 14px', marginBottom: 18,
                fontSize: 13, color: '#c0392b', lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}
            {notice && (
              <div style={{
                background: '#f4fbf6', border: '1px solid #cdebd5',
                borderRadius: 10, padding: '11px 14px', marginBottom: 18,
                fontSize: 13, color: '#166534', lineHeight: 1.5,
              }}>
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: 40, border: 'none',
                background: loading ? '#ccc' : '#0d0d0d', color: '#fff',
                fontWeight: 700, fontSize: 14, letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Barlow, sans-serif', transition: 'background 0.2s',
                /* minimum 44px tap target */
                minHeight: 48,
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 14, color: '#888' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <Link href={`/signup${redirectQuery}`} style={{ color: '#f04e0f', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up
                </Link>
              </>
            ) : (
              <>Already have an account?{' '}
                <Link href={`/login${redirectQuery}`} style={{ color: '#f04e0f', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>← Back to store</Link>
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  border: '1.5px solid #e8e8e5', fontSize: 16, /* 16px prevents iOS zoom */
  fontFamily: 'Barlow, sans-serif', outline: 'none',
  background: '#fafaf9', boxSizing: 'border-box',
  transition: 'border-color 0.2s', appearance: 'none',
  WebkitAppearance: 'none',
}

const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '2px',
  textTransform: 'uppercase', color: '#888',
  display: 'block', marginBottom: 7,
  fontFamily: 'Barlow, sans-serif',
}
