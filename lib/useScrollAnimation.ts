'use client'

import { type CSSProperties, useEffect, useState } from 'react'

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return prefersReducedMotion
}

export function clampedParallax(scrollY: number, factor: number, maxDistance: number) {
  return Math.min(maxDistance, Math.max(0, scrollY * factor)).toFixed(1)
}

export function imageIntroStyle(
  progress: number,
  start: number,
  end: number,
  prefersReducedMotion: boolean,
  blur = 16,
  distance = 22
): CSSProperties {
  if (prefersReducedMotion) {
    return { filter: 'none', opacity: 1, transform: 'none' }
  }

  const p = Math.min(1, Math.max(0, (progress - start) / Math.max(0.01, end - start)))

  return {
    filter: `blur(${((1 - p) * blur).toFixed(1)}px)`,
    opacity: Number(p.toFixed(3)),
    transform: `translateY(${((1 - p) * distance).toFixed(1)}px)`,
    transition: p > 0 ? 'filter 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none',
    willChange: 'filter, opacity, transform',
  }
}
