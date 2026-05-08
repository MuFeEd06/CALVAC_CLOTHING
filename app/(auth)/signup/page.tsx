import AuthForm from '@/components/auth/AuthForm'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Create Account — CALVAC' }
export default function SignupPage() { return <AuthForm mode="signup" /> }
