import {
  CATALOG_REVALIDATE_SECONDS,
  getCachedCategories,
  getCachedProducts,
  getCachedSearchProducts,
  getCachedSiteSettings,
} from '@/lib/cachedDb'
import ProductGrid from '@/components/shop/ProductGrid'
import ShopFilters from '@/components/shop/ShopFilters'
import MobileShopControls from '@/components/shop/MobileShopControls'
import Navbar from '@/components/layout/Navbar'
import { filterProductsByCollection, findCollectionBySlug, getCollectionItems } from '@/lib/collections'
import type { Product, Category } from '@/types'

interface PageProps {
  searchParams: { category?: string; collection?: string; sort?: string; search?: string }
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

export default async function ShopPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.search?.trim() ?? ''
  const [allProducts, categories, settings] = await Promise.all([
    (searchQuery ? getCachedSearchProducts() : getCachedProducts({ active: true })).catch(() => []),
    getCachedCategories().catch(() => []),
    getCachedSiteSettings().catch(() => null),
  ])

  // ── Build display categories (admin _categoryItems takes priority) ──
  let displayCats: { slug: string; name: string }[] = []
  try {
    const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
    const items = pc?._categoryItems
    if (Array.isArray(items) && items.length > 0) {
      displayCats = items
        .filter((c: any) => c.visible !== false)
        .map((c: any) => ({
          slug: c.name.toLowerCase().replace(/\s+/g, '-'),
          name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        }))
    }
  } catch {}
  if (displayCats.length === 0) {
    displayCats = categories.map(c => ({ slug: c.slug, name: c.name }))
  }

  // ── Filter products ──
  const collectionItems = getCollectionItems(settings)

  let products: Product[] = allProducts

  if (searchParams.category) {
    products = products.filter(p => {
      const catSlug = p.category?.slug ?? p.category?.name?.toLowerCase().replace(/\s+/g, '-') ?? ''
      return catSlug === searchParams.category
    })
  }

  if (searchParams.collection) {
    products = filterProductsByCollection(products, searchParams.collection, collectionItems)
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    products = products.filter(p => {
      const haystack = [
        p.name,
        p.description,
        p.category?.name,
        p.category?.slug,
        p.collection_tag,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }

  // ── Sort ──
  if (searchParams.sort === 'price-asc') {
    products = [...products].sort((a, b) => a.price - b.price)
  } else if (searchParams.sort === 'price-desc') {
    products = [...products].sort((a, b) => b.price - a.price)
  }
  // default: newest (already ordered by created_at desc from DB)

  const activeCollection = findCollectionBySlug(searchParams.collection, collectionItems)
  const filterLabel = activeCollection
    ? activeCollection.label
    : searchParams.category
      ? displayCats.find(c => c.slug === searchParams.category)?.name ?? searchParams.category
      : 'All Products'
  const activeLabel = searchQuery ? `Search: "${searchQuery}"` : filterLabel

  return (
    <>
      <Navbar settings={settings} />

      {/* Page top padding accounts for fixed navbar */}
      <div className="pt-[72px] md:pt-[76px]">

        {/* ── MOBILE: category bubbles + filter/sort bar ── */}
        <MobileShopControls
          categories={displayCats}
          collections={collectionItems}
          searchParams={searchParams}
        />

        <div className="flex min-h-screen">

          {/* ── DESKTOP sidebar ── */}
          <ShopFilters
            categories={categories}
            searchParams={searchParams}
            settings={settings}
          />

          {/* ── Main content ── */}
          <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 md:py-10 min-w-0">

            {/* Result count + active filter label */}
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h1 className="font-condensed font-900 text-[clamp(26px,4vw,48px)] leading-none tracking-tight lowercase">
                  {activeLabel}
                </h1>
                <p className="text-[11px] text-[var(--gray-mid)] mt-1 tracking-wide">
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>

            <ProductGrid products={products} />
          </main>
        </div>
      </div>
    </>
  )
}
