import 'server-only'

import { unstable_cache } from 'next/cache'
import {
  getCarouselProducts,
  getCategories,
  getFeaturedMomentProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  getSiteSettings,
} from './db'

export const CATALOG_REVALIDATE_SECONDS = 60 * 60 * 12
export const SEARCH_REVALIDATE_SECONDS = 60 * 60

export const getCachedSiteSettings = unstable_cache(
  async () => getSiteSettings(),
  ['site-settings-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['site-settings', 'storefront'] },
)

export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ['categories-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['categories', 'storefront'] },
)

export const getCachedProducts = unstable_cache(
  async (options?: Parameters<typeof getProducts>[0]) => getProducts(options),
  ['products-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['products', 'storefront'] },
)

export const getCachedSearchProducts = unstable_cache(
  async () => getProducts({ active: true }),
  ['search-products-v1'],
  { revalidate: SEARCH_REVALIDATE_SECONDS, tags: ['products', 'search'] },
)

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => getProductBySlug(slug),
  ['product-by-slug-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['products', 'storefront'] },
)

export const getCachedFeaturedProducts = unstable_cache(
  async (limit = 8) => getFeaturedProducts(limit),
  ['featured-products-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['products', 'storefront'] },
)

export const getCachedCarouselProducts = unstable_cache(
  async () => getCarouselProducts(),
  ['carousel-products-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['products', 'storefront'] },
)

export const getCachedFeaturedMomentProducts = unstable_cache(
  async () => getFeaturedMomentProducts(),
  ['featured-moment-products-v1'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['products', 'storefront'] },
)
