import type { SiteSettings } from '@/types'

export interface PageEl {
  id: string
  visible: boolean
  x: number       // % from left
  y: number       // % from top
  fontSize?: number
  color?: string
  content?: string
  imageUrl?: string
  width?: number
  height?: number
  isImage?: boolean
}

export interface MergedConfig {
  bgColor: string
  accentColor: string
  elements: Map<string, PageEl>
}

export function mergeConfig(
  settings: SiteSettings | null,
  pageId: string,
  defaults: PageEl[]
): MergedConfig {
  let bgColor = '#f5f5f3'
  let accentColor = '#f04e0f'
  const elementMap = new Map<string, PageEl>()

  // Start with defaults
  defaults.forEach(d => elementMap.set(d.id, { ...d }))

  // Override with saved page_configs
  if (settings?.page_configs) {
    try {
      const pc = JSON.parse(settings.page_configs)
      const pg = pc?.[pageId]
      if (pg) {
        if (pg.bgColor) bgColor = pg.bgColor
        if (pg.accentColor) accentColor = pg.accentColor
        if (pg.elements) {
          pg.elements.forEach((saved: PageEl) => {
            const def = elementMap.get(saved.id)
            if (def) elementMap.set(saved.id, { ...def, ...saved })
            else elementMap.set(saved.id, saved)
          })
        }
      }
    } catch {}
  }

  return { bgColor, accentColor, elements: elementMap }
}

// Helpers to read from merged config
export function el(cfg: MergedConfig, id: string): PageEl | undefined {
  return cfg.elements.get(id)
}

export function vis(cfg: MergedConfig, id: string): boolean {
  const e = cfg.elements.get(id)
  return e ? e.visible !== false : true
}

export function txt(cfg: MergedConfig, id: string, fallback: string): string {
  return cfg.elements.get(id)?.content || fallback
}

export function imgUrl(cfg: MergedConfig, id: string): string {
  return cfg.elements.get(id)?.imageUrl || ''
}

export function clr(cfg: MergedConfig, id: string, fallback: string): string {
  return cfg.elements.get(id)?.color || fallback
}

export function fsize(cfg: MergedConfig, id: string, fallback: number): number {
  return cfg.elements.get(id)?.fontSize ?? fallback
}

// Absolute position style from x/y %
export function pos(cfg: MergedConfig, id: string, extra?: React.CSSProperties): React.CSSProperties {
  const e = cfg.elements.get(id)
  if (!e || e.visible === false) return { display: 'none' }
  return { position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, zIndex: 10, ...extra }
}
