import type { SiteSettings } from '@/types'

// ─── Types (mirror the admin editor types) ─────────────────────
export interface PageElement {
  id: string
  visible: boolean
  x: number
  y: number
  fontSize?: number
  color?: string
  content?: string
  imageUrl?: string
  width?: number
  height?: number
  isImage?: boolean
  type?: string
}

export interface PageConfig {
  id: string
  bgColor: string
  accentColor: string
  elements: PageElement[]
}

// ─── Parse page_configs from settings ─────────────────────────
export function parsePageConfigs(settings: SiteSettings | null): Record<string, PageConfig> | null {
  if (!settings?.page_configs) return null
  try {
    return JSON.parse(settings.page_configs)
  } catch {
    return null
  }
}

// ─── Get a specific page config ────────────────────────────────
export function getPageConfig(
  settings: SiteSettings | null,
  pageId: string
): PageConfig | null {
  const configs = parsePageConfigs(settings)
  return configs?.[pageId] ?? null
}

// ─── Helper class to access elements by id ────────────────────
export class PageConfigHelper {
  private elements: Map<string, PageElement>
  public bgColor: string
  public accentColor: string

  constructor(config: PageConfig | null) {
    this.elements = new Map()
    this.bgColor = config?.bgColor ?? '#f5f5f3'
    this.accentColor = config?.accentColor ?? '#f04e0f'
    if (config?.elements) {
      config.elements.forEach(el => this.elements.set(el.id, el))
    }
  }

  // Get element — returns null if hidden
  get(id: string): PageElement | null {
    const el = this.elements.get(id)
    if (!el || el.visible === false) return null
    return el
  }

  // Check if element is visible
  visible(id: string): boolean {
    const el = this.elements.get(id)
    return el ? el.visible !== false : true
  }

  // Get text content with fallback
  text(id: string, fallback: string): string {
    return this.get(id)?.content ?? fallback
  }

  // Get color with fallback
  color(id: string, fallback: string): string {
    return this.get(id)?.color ?? fallback
  }

  // Get font size with fallback
  fontSize(id: string, fallback: number): number {
    return this.get(id)?.fontSize ?? fallback
  }

  // Get image URL
  imageUrl(id: string): string {
    return this.get(id)?.imageUrl ?? ''
  }
}

// ─── Factory — build helper for a page from settings ──────────
export function buildPageHelper(
  settings: SiteSettings | null,
  pageId: string
): PageConfigHelper {
  return new PageConfigHelper(getPageConfig(settings, pageId))
}
