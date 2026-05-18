'use client'

import { useEffect, useState } from 'react'

export type ViewportKind = 'mobile' | 'tablet' | 'desktop'

const TABLET_MIN = 768
const DESKTOP_MIN = 1120

function getViewportKind(width: number): ViewportKind {
  if (width >= DESKTOP_MIN) return 'desktop'
  if (width >= TABLET_MIN) return 'tablet'
  return 'mobile'
}

export function useViewportKind(): ViewportKind {
  // Lazy-init: read window.innerWidth immediately if available (client-side)
  // This prevents the flash where mobile users briefly see desktop layout
  const [kind, setKind] = useState<ViewportKind>(() => {
    if (typeof window !== 'undefined') return getViewportKind(window.innerWidth)
    return 'desktop'
  })

  useEffect(() => {
    const update = () => setKind(getViewportKind(window.innerWidth))
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return kind
}

export function responsiveClamp(value: number, mobileRatio = 0.62, tabletRatio = 0.78) {
  return {
    mobile: Math.max(10, Math.round(value * mobileRatio)),
    tablet: Math.max(12, Math.round(value * tabletRatio)),
    desktop: value,
  }
}
