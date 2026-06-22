'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signOutCurrentUser } from '@/lib/clientAuth'

interface SignOutButtonProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  errorClassName?: string
  errorStyle?: CSSProperties
  redirectTo?: string
}

export default function SignOutButton({
  children = 'Sign out',
  className,
  style,
  errorClassName,
  errorStyle,
  redirectTo = '/',
}: SignOutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setLoading(true)
    setError('')

    try {
      await signOutCurrentUser()
      router.replace(redirectTo)
      router.refresh()
    } catch {
      setError('Unable to sign out. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Signing out...' : children}
      </button>
      {error && (
        <p className={errorClassName} style={errorStyle}>
          {error}
        </p>
      )}
    </>
  )
}
