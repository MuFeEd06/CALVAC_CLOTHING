import type { Product, SiteSettings } from '@/types'

export const COLLECTION_DEFAULTS = [
  {
    id: 'col1',
    fallbackLabel: 'Everyday Essentials 2026',
    stableSlug: 'everyday-essentials-2026',
  },
  {
    id: 'col2',
    fallbackLabel: 'Timeless Classics 2026',
    stableSlug: 'timeless-classics-2026',
  },
  {
    id: 'col3',
    fallbackLabel: 'Seasonal Collections 2025',
    stableSlug: 'seasonal-collections-2026',
  },
] as const

export type CollectionId = typeof COLLECTION_DEFAULTS[number]['id']

export interface CollectionLink {
  id: CollectionId
  label: string
  slug: string
  href: string
  aliases: string[]
}

export function slugifyCollectionLabel(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCollectionValue(value: string) {
  try {
    return slugifyCollectionLabel(decodeURIComponent(value))
  } catch {
    return slugifyCollectionLabel(value)
  }
}

export function getCollectionSlug(collectionIdOrLabel: string, label?: string) {
  const collection = COLLECTION_DEFAULTS.find(item => item.id === collectionIdOrLabel)
  return collection?.stableSlug ?? slugifyCollectionLabel(label ?? collectionIdOrLabel)
}

export function getCollectionHref(collectionIdOrLabel: string, label?: string) {
  return `/shop?collection=${encodeURIComponent(getCollectionSlug(collectionIdOrLabel, label))}`
}

export function getCollectionItems(settings?: SiteSettings | null): CollectionLink[] {
  let elements: any[] = []

  try {
    const parsed = settings?.page_configs ? JSON.parse(settings.page_configs) : null
    elements = Array.isArray(parsed?.collections?.elements) ? parsed.collections.elements : []
  } catch {
    elements = []
  }

  return COLLECTION_DEFAULTS.flatMap(item => {
    const element = elements.find(el => el?.id === item.id)
    const visible = element ? element.visible !== false : true

    if (!visible) return []

    const label = element?.content || item.fallbackLabel
    const aliases = Array.from(new Set([
      item.stableSlug,
      slugifyCollectionLabel(label),
      slugifyCollectionLabel(item.fallbackLabel),
    ])).filter(Boolean)

    return [{
      id: item.id,
      label,
      slug: item.stableSlug,
      href: getCollectionHref(item.id, label),
      aliases,
    }]
  })
}

export function findCollectionBySlug(collection: string | undefined, items: CollectionLink[]) {
  if (!collection) return undefined

  const normalized = normalizeCollectionValue(collection)
  return items.find(item =>
    item.slug === normalized ||
    item.id === normalized ||
    item.aliases.includes(normalized)
  )
}

export function filterProductsByCollection(
  products: Product[],
  collection: string | undefined,
  items: CollectionLink[] = getCollectionItems()
) {
  if (!collection) return products

  const normalized = normalizeCollectionValue(collection)
  const activeCollection = findCollectionBySlug(collection, items)
  const acceptedTags = new Set(activeCollection?.aliases ?? [normalized])

  return products.filter(product => {
    const tag = product.collection_tag ? normalizeCollectionValue(product.collection_tag) : ''
    return tag !== '' && acceptedTags.has(tag)
  })
}
