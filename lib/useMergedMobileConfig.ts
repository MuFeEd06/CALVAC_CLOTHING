/**
 * useMergedMobileConfig
 * ─────────────────────
 * Legacy helper for _mobileSections in site_settings.page_configs.
 * The active responsive landing pages now read _mobileConfigs through
 * mergeDeviceConfig() in useMergedConfig.ts.
 *
 * Usage in legacy stacked mobile-section renderers:
 *
 *   import { useMergedMobileSection, mobileEl, mobileTxt, mobileImg, mobileVis, mobileClr, mobileFsize } from '@/lib/useMergedMobileConfig'
 *
 *   const section = useMergedMobileSection(settings, 'mobile_hero')
 *   const headline = mobileTxt(section, 'mh_headline', 'where\n- style')
 *   const heroImg  = mobileImg(section, 'mh_model')
 */

import type { SiteSettings } from '@/types'
import { MOBILE_SECTION_DEFAULTS, type MobileSectionConfig, type MobileElement } from './pageDefaults'

// ─── Core merge function (works server-side — no hooks) ───────
export function getMobileSection(
  settings: SiteSettings | null,
  sectionId: string,
): MobileSectionConfig {
  const def = MOBILE_SECTION_DEFAULTS[sectionId]
  if (!def) throw new Error(`Unknown mobile section: ${sectionId}`)

  // Build element map from defaults
  const elementMap = new Map<string, MobileElement>()
  def.elements.forEach(e => elementMap.set(e.id, { ...e }))

  let bgColor     = def.bgColor
  let accentColor = def.accentColor

  // Merge saved overrides from page_configs._mobileSections
  if (settings?.page_configs) {
    try {
      const pc = JSON.parse(settings.page_configs)
      const saved: MobileSectionConfig | undefined = pc?._mobileSections?.[sectionId]
      if (saved) {
        if (saved.bgColor)     bgColor     = saved.bgColor
        if (saved.accentColor) accentColor = saved.accentColor
        if (saved.elements) {
          saved.elements.forEach((s: MobileElement) => {
            const base = elementMap.get(s.id)
            if (base) elementMap.set(s.id, { ...base, ...s })
            else      elementMap.set(s.id, s)
          })
        }
      }
    } catch {}
  }

  return {
    ...def,
    bgColor,
    accentColor,
    elements: Array.from(elementMap.values()),
  }
}

// ─── Element accessor helpers ─────────────────────────────────

/** Get a single element (returns undefined if not found) */
export function mobileEl(
  section: MobileSectionConfig,
  id: string,
): MobileElement | undefined {
  return section.elements.find(e => e.id === id)
}

/** Is element visible? Defaults true if not found */
export function mobileVis(section: MobileSectionConfig, id: string): boolean {
  const e = section.elements.find(el => el.id === id)
  return e ? e.visible !== false : true
}

/** Get text content with fallback */
export function mobileTxt(
  section: MobileSectionConfig,
  id: string,
  fallback: string,
): string {
  return section.elements.find(e => e.id === id)?.content || fallback
}

/** Get imageUrl (empty string if not set) */
export function mobileImg(section: MobileSectionConfig, id: string): string {
  return section.elements.find(e => e.id === id)?.imageUrl || ''
}

/** Get color with fallback */
export function mobileClr(
  section: MobileSectionConfig,
  id: string,
  fallback: string,
): string {
  return section.elements.find(e => e.id === id)?.color || fallback
}

/** Get fontSize with fallback */
export function mobileFsize(
  section: MobileSectionConfig,
  id: string,
  fallback: number,
): number {
  return section.elements.find(e => e.id === id)?.fontSize ?? fallback
}
