'use client'
import Link from 'next/link'
import type { Category, SiteSettings } from '@/types'

interface Props {
  categories: Category[]
  searchParams: Record<string, string | undefined>
  settings?: SiteSettings | null
}

interface CatItem { id: string; name: string; visible: boolean; imageUrl: string; count: number; fontSize: number; color: string }

const COLLECTION_ROWS = [
  { id: 'col1', label: 'Everyday Essentials 2026' },
  { id: 'col2', label: 'Timeless Classics 2026' },
  { id: 'col3', label: 'Seasonal Collections 2025' },
]

export default function ShopFilters({ categories, searchParams, settings }: Props) {
  // Build category list from admin _categoryItems if available, else DB categories
  const displayCats: { slug: string; name: string }[] = (() => {
    try {
      const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
      const items: CatItem[] = pc?._categoryItems
      if (Array.isArray(items) && items.length > 0) {
        return items
          .filter(c => c.visible !== false)
          .map(c => ({
            slug: c.name.toLowerCase().replace(/\s+/g, '-'),
            name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
          }))
      }
    } catch {}
    return categories.map(c => ({ slug: c.slug, name: c.name }))
  })()

  const sorts = [
    { value: 'newest',     label: 'Newest' },
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
  ]

  return (
    // Hidden on mobile (md:block) — mobile uses MobileShopControls instead
    <aside className="hidden md:block w-52 flex-shrink-0 px-6 md:px-12 py-8 border-r border-[var(--gray-light)]">
      <div className="space-y-8 sticky top-24">

        {/* Category */}
        <div>
          <h3 className="text-[10px] font-600 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">Category</h3>
          <ul className="space-y-1.5">
            <li>
              <Link
                href="/shop"
                className={`text-sm transition-colors ${!searchParams.category ? 'font-700 text-black' : 'text-[var(--gray-dark)] hover:text-black'}`}
              >
                All Products
              </Link>
            </li>
            {displayCats.map(cat => (
              <li key={cat.slug}>
                <Link
                  href={`/shop?category=${cat.slug}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                  className={`text-sm transition-colors ${searchParams.category === cat.slug ? 'font-700 text-black' : 'text-[var(--gray-dark)] hover:text-black'}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Collections */}
        <div>
          <h3 className="text-[10px] font-600 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">Collections</h3>
          <ul className="space-y-1.5">
            {COLLECTION_ROWS.map(col => (
              <li key={col.id}>
                <Link
                  href="/shop"
                  className="text-sm text-[var(--gray-dark)] hover:text-black transition-colors"
                >
                  {col.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="text-[10px] font-600 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">Sort By</h3>
          <ul className="space-y-1.5">
            {sorts.map(s => (
              <li key={s.value}>
                <Link
                  href={`/shop?${searchParams.category ? `category=${searchParams.category}&` : ''}sort=${s.value}`}
                  className={`text-sm transition-colors ${searchParams.sort === s.value ? 'font-700 text-black' : 'text-[var(--gray-dark)] hover:text-black'}`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </aside>
  )
}
