// ─── Scroll Exit Transition ────────────────────────────────────
// Shared utility for all landing page sections.
// As a section scrolls upward past the viewport, its text fades
// up and out. Images keep their independent parallax effect.

import type { SiteSettings } from '@/types'

export interface ScrollTransitionConfig {
  enabled: boolean
  speed: number    // 0.1 (very slow) → 2.0 (very fast). Default 0.5
  distance: number // px text travels upward. Default 60
}

export function getScrollTransitionConfig(settings: SiteSettings | null): ScrollTransitionConfig {
  try {
    const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
    const t = pc?._scrollTransition
    if (t) return {
      enabled:  t.enabled  ?? true,
      speed:    t.speed    ?? 0.5,
      distance: t.distance ?? 60,
    }
  } catch {}
  return { enabled: true, speed: 0.5, distance: 60 }
}

/**
 * Returns CSS style that fades text upward as scrollY increases.
 * scrollY = Math.max(0, -sectionRect.top)  — already tracked in useSectionProgress()
 * Apply to TEXT wrapper divs only, NOT image containers.
 */
export function scrollExitStyle(
  scrollY: number,
  cfg: ScrollTransitionConfig
): React.CSSProperties {
  if (!cfg.enabled || scrollY <= 0) return {}

  // fadeRange: how many pixels of scroll to complete the exit.
  // speed=0.5 → 800px; speed=1.0 → 400px; speed=2.0 → 200px
  const fadeRange = 400 / cfg.speed
  const p = Math.min(1, scrollY / fadeRange)
  if (p <= 0) return {}

  return {
    opacity: Number((1 - p).toFixed(3)),
    transform: `translateY(${(-p * cfg.distance).toFixed(1)}px)`,
    willChange: 'transform, opacity',
    pointerEvents: p > 0.6 ? 'none' : 'auto',
  }
}
