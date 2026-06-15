import type { Category, SiteSettings } from '@/types'
import { findCollectionBySlug, getCollectionItems } from '@/lib/collections'
import { parsePageConfigs } from '@/lib/siteSettings'

export type FeaturedDropRedirectType = 'all' | 'category' | 'collection' | 'custom'

export interface FeaturedDropRedirect {
  type: FeaturedDropRedirectType
  value?: string
}

export const DEFAULT_FEATURED_DROP_REDIRECT: FeaturedDropRedirect = { type: 'all', value: '' }

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isRedirectType(value: unknown): value is FeaturedDropRedirectType {
  return value === 'all' || value === 'category' || value === 'collection' || value === 'custom'
}

export function getFeaturedDropRedirect(settings?: SiteSettings | null): FeaturedDropRedirect {
  const pageConfigs = parsePageConfigs(settings)
  const raw = pageConfigs?._featuredDropRedirect
  if (!raw || typeof raw !== 'object' || !isRedirectType(raw.type)) {
    return DEFAULT_FEATURED_DROP_REDIRECT
  }
  return {
    type: raw.type,
    value: cleanValue(raw.value),
  }
}

export function isSafeInternalUrl(value: string) {
  return (
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.startsWith('/api') &&
    !value.startsWith('/admin')
  )
}

export function getFeaturedDropHref(
  settings?: SiteSettings | null,
  categories: Category[] = [],
  target: FeaturedDropRedirect = getFeaturedDropRedirect(settings),
) {
  if (target.type === 'category') {
    const category = categories.find(item =>
      item.is_active !== false &&
      (item.slug === target.value || item.name.toLowerCase().replace(/\s+/g, '-') === target.value)
    )
    return category ? `/shop?category=${encodeURIComponent(category.slug)}` : '/shop'
  }

  if (target.type === 'collection') {
    const collection = findCollectionBySlug(target.value, getCollectionItems(settings))
    return collection?.href ?? '/shop'
  }

  if (target.type === 'custom') {
    const value = target.value ?? ''
    return isSafeInternalUrl(value) ? value : '/shop'
  }

  return '/shop'
}
