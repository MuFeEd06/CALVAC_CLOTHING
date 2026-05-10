import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account — CALVAC' }

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f5f5f3' }} />}>
      <AuthForm mode="signup" />
    </Suspense>
  )
}
