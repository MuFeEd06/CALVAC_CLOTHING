import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In — CALVAC' }

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f5f3' }} />}>
      <AuthForm mode="login" />
    </Suspense>
  )
}
