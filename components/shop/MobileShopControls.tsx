'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, X, Check } from 'lucide-react'

interface CategoryItem {
  slug: string
  name: string
}

interface CollectionItem {
  id: string
  label: string
  href: string
  slug: string
  aliases?: string[]
}

interface Props {
  categories: CategoryItem[]
  collections: CollectionItem[]
  searchParams: {
    category?: string
    collection?: string
    sort?: string
  }
}

export default function MobileShopControls({ categories, collections, searchParams }: Props) {
  const [filterOpen, setFilterOpen] = useState(false)
  const activeCategory = searchParams.category
  const activeCollection = collections.find(col =>
    col.slug === searchParams.collection || col.aliases?.includes(searchParams.collection ?? '')
  )
  const activeSort = searchParams.sort ?? 'newest'

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  const sorts = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
  ]

  const activeSortLabel = sorts.find(s => s.value === activeSort)?.label ?? 'Newest First'

  const buildHref = (options: { category?: string; collection?: string; sort?: string }) => {
    const params = new URLSearchParams()
    if (options.category) params.set('category', options.category)
    if (options.collection) params.set('collection', options.collection)
    const sort = options.sort
    if (sort && sort !== 'newest') params.set('sort', sort)
    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  const withCurrentSort = (href: string) => {
    if (!searchParams.sort || searchParams.sort === 'newest') return href
    return `${href}&sort=${searchParams.sort}`
  }

  return (
    <>
      {/* ── CATEGORY BUBBLES (mobile only) ────────────────── */}
      <div className="md:hidden border-b border-[var(--gray-light)] bg-white">
        <div
          className="flex items-center gap-2 px-4 py-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {/* All */}
          <Link
            href="/shop"
            scroll={false}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-600 border transition-all duration-200 ${
              !activeCategory && !activeCollection
                ? 'bg-[var(--black)] text-white border-[var(--black)]'
                : 'border-[var(--gray-light)] text-[var(--gray-dark)] bg-white active:scale-95'
            }`}
          >
            All
          </Link>

          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={buildHref({ category: cat.slug, sort: searchParams.sort })}
              scroll={false}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-600 border transition-all duration-200 ${
                activeCategory === cat.slug
                  ? 'bg-[var(--black)] text-white border-[var(--black)]'
                  : 'border-[var(--gray-light)] text-[var(--gray-dark)] bg-white active:scale-95'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── SORT BAR (mobile only) ─────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-[var(--gray-light)]">
        <p className="text-[10px] tracking-[2px] uppercase text-[var(--gray-mid)] font-600">
          {activeSortLabel}
        </p>

        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 pl-3.5 pr-4 py-1.5 border border-[var(--gray-light)] rounded-full text-[11px] font-700 text-[var(--gray-dark)] active:scale-95 transition-transform"
          aria-label="Open filters and sort"
        >
          <SlidersHorizontal size={13} strokeWidth={2.5} />
          Filter &amp; Sort
        </button>
      </div>

      {/* ── BACKDROP ──────────────────────────────────────── */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        style={{
          opacity: filterOpen ? 1 : 0,
          pointerEvents: filterOpen ? 'auto' : 'none',
        }}
        onClick={() => setFilterOpen(false)}
        aria-hidden="true"
      />

      {/* ── BOTTOM DRAWER ─────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl"
        style={{
          transform: filterOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
          maxHeight: '86vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        }}
        aria-hidden={!filterOpen}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full bg-[var(--gray-light)]"
            style={{ background: '#d5d5d2' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--gray-light)]">
          <h3
            style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, letterSpacing: '-0.3px', margin: 0 }}
          >
            Filters
          </h3>
          <button
            onClick={() => setFilterOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--gray-light)] active:scale-90 transition-transform"
            aria-label="Close filters"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-10 space-y-7">

          {/* ── Category ── */}
          <div>
            <p className="text-[10px] font-700 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">
              Category
            </p>
            <div className="space-y-1">
              <Link
                href={buildHref({ sort: searchParams.sort })}
                scroll={false}
                onClick={() => setFilterOpen(false)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-500 transition-colors ${
                  !activeCategory && !activeCollection
                    ? 'bg-[var(--black)] text-white'
                    : 'text-[var(--gray-dark)] hover:bg-[var(--gray-light)]'
                }`}
              >
                <span>All Products</span>
                {!activeCategory && !activeCollection && <Check size={14} />}
              </Link>

              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={buildHref({ category: cat.slug, sort: searchParams.sort })}
                  scroll={false}
                  onClick={() => setFilterOpen(false)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-500 transition-colors ${
                    activeCategory === cat.slug
                      ? 'bg-[var(--black)] text-white'
                      : 'text-[var(--gray-dark)] hover:bg-[var(--gray-light)]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {activeCategory === cat.slug && <Check size={14} />}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Collections ── */}
          {collections.length > 0 && (
            <div>
              <p className="text-[10px] font-700 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">
                Collections
              </p>
              <div className="space-y-1">
                {collections.map(col => (
                  <Link
                    key={col.id}
                    href={withCurrentSort(col.href)}
                    onClick={() => setFilterOpen(false)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-500 transition-colors ${
                      activeCollection?.id === col.id
                        ? 'bg-[var(--black)] text-white'
                        : 'text-[var(--gray-dark)] hover:bg-[var(--gray-light)]'
                    }`}
                  >
                    <span>{col.label}</span>
                    {activeCollection?.id === col.id && <Check size={14} />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Sort By ── */}
          <div>
            <p className="text-[10px] font-700 tracking-[3px] uppercase text-[var(--gray-mid)] mb-3">
              Sort By
            </p>
            <div className="space-y-2">
              {sorts.map(s => (
                <Link
                  key={s.value}
                  href={buildHref({
                    category: activeCategory,
                    collection: activeCategory ? undefined : activeCollection?.slug,
                    sort: s.value,
                  })}
                  scroll={false}
                  onClick={() => setFilterOpen(false)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl border text-sm font-500 transition-colors ${
                    activeSort === s.value
                      ? 'border-[var(--black)] bg-[var(--black)] text-white'
                      : 'border-[var(--gray-light)] text-[var(--gray-dark)]'
                  }`}
                >
                  <span>{s.label}</span>
                  {activeSort === s.value && <Check size={14} />}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
