import AuthForm from '@/components/auth/AuthForm'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Sign In — CALVAC' }
export default function LoginPage() { return <AuthForm mode="login" /> }
