'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Category, SiteSettings } from '@/types'
import { mergeConfig, vis, txt, imgUrl, clr, fsize } from '@/lib/useMergedConfig'
import { CATEGORIES_DEFAULTS } from '@/lib/pageDefaults'

interface Props { categories: Category[]; settings?: SiteSettings | null }

interface CategoryItem {
  id: string; name: string; visible: boolean
  imageUrl: string; count: number; fontSize: number; color: string
}

const DEFAULT_CAT_ITEMS: CategoryItem[] = [
  { id: 'cat_0', name: 'accessories', visible: true, imageUrl: '', count: 174, fontSize: 96, color: '#0d0d0d' },
  { id: 'cat_1', name: 'hoodies',     visible: true, imageUrl: '', count: 361, fontSize: 64, color: '#999999' },
  { id: 'cat_2', name: 'jackets',     visible: true, imageUrl: '', count: 368, fontSize: 46, color: '#bbbbbb' },
  { id: 'cat_3', name: 'pants',       visible: true, imageUrl: '', count: 117, fontSize: 36, color: '#cccccc' },
  { id: 'cat_4', name: 'tees',        visible: true, imageUrl: '', count: 78,  fontSize: 28, color: '#dddddd' },
]

function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.88 - rect.top) / (window.innerHeight * 0.6)))
      setProgress(p)
      setScrollY(Math.max(0, -rect.top))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    setTimeout(onScroll, 50)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return { ref, progress, scrollY }
}

function fadeIn(progress: number, start: number, end: number): React.CSSProperties {
  const p = Math.min(1, Math.max(0, (progress - start) / Math.max(0.01, end - start)))
  return {
    filter: `blur(${((1-p)*16).toFixed(1)}px)`,
    opacity: Number(p.toFixed(3)),
    transform: `translateY(${((1-p)*24).toFixed(1)}px)`,
    transition: p > 0 ? 'filter 0.6s cubic-bezier(0.4,0,0.2,1),opacity 0.6s cubic-bezier(0.4,0,0.2,1),transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
    willChange: 'filter,opacity,transform',
  }
}

export default function CategoryList({ categories, settings }: Props) {
  const { ref, progress, scrollY } = useSectionProgress()
  const cfg = mergeConfig(settings ?? null, 'categories', CATEGORIES_DEFAULTS as any)
  const [activeIdx, setActiveIdx] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const parallaxY = (scrollY * 0.2).toFixed(1)
  const description = txt(cfg, 'description', "Every piece carries rhythm beyond clothing — it's motion and meaning where street energy meets.")

  // ── FIX 1: Parse category items from admin-managed page_configs ──
  // All items including imageUrl, name, count, fontSize, color come from admin
  const allCatItems: CategoryItem[] = (() => {
    try {
      const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
      if (Array.isArray(pc?._categoryItems) && pc._categoryItems.length > 0)
        return pc._categoryItems
    } catch {}
    return DEFAULT_CAT_ITEMS
  })()

  // Only show visible items on live page
  const displayItems = allCatItems.filter(c => c.visible !== false)

  // Fallback to DB categories if no admin items at all
  const finalItems = displayItems.length > 0 ? displayItems : categories.map((c, i) => ({
    id: c.id, name: c.name, visible: true, imageUrl: '',
    count: [174,361,368,117,78][i] ?? 0,
    fontSize: [96,64,46,36,28][i] ?? 28,
    color: ['#0d0d0d','#999','#bbb','#ccc','#ddd'][i] ?? '#ddd',
  }))

  // ── FIX 2: Active image — per-category imageUrl takes priority ──
  // Falls back to global model image, then shows placeholder
  const globalModelImg = imgUrl(cfg, 'model_image')
  const activeImg = finalItems[activeIdx]?.imageUrl || globalModelImg || ''

  // Clamp activeIdx when items change
  useEffect(() => {
    setActiveIdx(i => Math.min(i, Math.max(0, finalItems.length - 1)))
  }, [finalItems.length])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 0) setActiveIdx(i => Math.min(finalItems.length - 1, i + 1))
    else setActiveIdx(i => Math.max(0, i - 1))
  }, [finalItems.length])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') setActiveIdx(i => Math.min(finalItems.length - 1, i + 1))
      if (e.key === 'ArrowUp') setActiveIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finalItems.length])

  const getFontSize = (i: number) => {
    const dist = Math.abs(i - activeIdx)
    const base = finalItems[i]?.fontSize ?? 96
    if (dist === 0) return `clamp(52px,7.5vw,${base}px)`
    if (dist === 1) return `clamp(36px,5vw,${Math.round(base * 0.67)}px)`
    if (dist === 2) return `clamp(26px,3.6vw,${Math.round(base * 0.5)}px)`
    return 'clamp(20px,2.8vw,36px)'
  }

  const getColor = (i: number) => {
    const dist = Math.abs(i - activeIdx)
    if (dist === 0) return finalItems[i]?.color ?? '#0d0d0d'
    return ['#999','#bbb','#ccc','#ddd'][Math.min(dist - 1, 3)]
  }

  // Active category slug for the SEE PRODUCT button link
  const activeCat = finalItems[activeIdx]
  const activeSlug = (activeCat?.name ?? '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '72px 52px 80px', minHeight: 760 }}>
      <div style={{ position: 'absolute', right: '-2%', top: '0%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(340px,46vw,640px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>C</div>

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '44fr 56fr', gap: '0 56px', alignItems: 'start' }}>

        {/* ── LEFT: Image only — description & SEE PRODUCT are section-level absolute below ── */}
        <div style={fadeIn(progress, 0.0, 0.42)}>

          {/* Image box */}
          <div style={{ position: 'relative', height: 520, overflow: 'hidden', background: clr(cfg, 'model_image', '#e2e0dc') }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '132%',
              transform: `translateY(${parallaxY}px)`,
              transition: 'transform 0.1s linear', willChange: 'transform',
            }}>
              {activeImg ? (
                <Image
                  key={activeImg}
                  src={activeImg}
                  alt={activeCat?.name ?? 'Category'}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center', transition: 'opacity 0.4s ease' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#ddddd9,#c8c4be)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: '#aaa', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif', textAlign: 'center', lineHeight: 2 }}>CATEGORY IMAGE</span>
                </div>
              )}
            </div>
            {/* Arrow cutout */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '28%', background: cfg.bgColor, clipPath: 'polygon(100% 0%,100% 100%,0% 100%,40% 75%,0% 50%,40% 25%,0% 0%)', zIndex: 2 }} />
          </div>
        </div>

        {/* ── RIGHT: Category scroll wheel ── */}
        <div ref={listRef} style={{ ...fadeIn(progress, 0.08, 0.46), paddingTop: 8, cursor: 'ns-resize' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {finalItems.map((cat, i) => (
              <li key={cat.id} style={{ borderBottom: '1px solid #e8e8e5' }}>
                <div
                  onClick={() => setActiveIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${i === activeIdx ? 6 : 4}px 0`, cursor: 'pointer', transition: 'padding 0.3s',
                  }}
                >
                  <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '1px', color: i === activeIdx ? '#0d0d0d' : '#ccc', width: 38, flexShrink: 0, transition: 'color 0.3s' }}>
                    [{String(i + 1).padStart(2, '0')}]
                  </span>
                  <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: getFontSize(i), lineHeight: 1, color: getColor(i), textTransform: 'lowercase', letterSpacing: '-0.5px', flex: 1, textAlign: 'right', paddingRight: 20, transition: 'font-size 0.35s cubic-bezier(0.4,0,0.2,1),color 0.35s' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: i === activeIdx ? 14 : 11, fontWeight: 500, color: i === activeIdx ? '#888' : '#ccc', flexShrink: 0, width: 52, textAlign: 'right', transition: 'color 0.3s,font-size 0.3s' }}>
                    ({cat.count})
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', flexShrink: 0 }}>
              {txt(cfg, 'label', '[CATEGORIES]')}
            </span>
            <div style={{ flex: 1, maxWidth: 140, borderTop: '1px dashed #ccc' }} />
            <div style={{ width: 22, height: 36, border: '1.5px solid #bbb', borderRadius: 11, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 5, flexShrink: 0, background: cfg.bgColor }}>
              <div style={{ width: 3, height: 7, background: '#888', borderRadius: 2, animation: 'scrollDot 1.6s ease-in-out infinite' }} />
            </div>
          </div>
          <p style={{ marginTop: 10, fontSize: 10, color: '#bbb', letterSpacing: '1px', fontFamily: 'Barlow,sans-serif', fontStyle: 'italic' }}>scroll or click to browse</p>
        </div>
      </div>

      {/* Description — absolutely positioned on section, matching canvas coordinate system */}
      {vis(cfg, 'description') && (() => {
        const descEl = cfg.elements.get('description') ?? { x: 1, y: 78 }
        // Canvas is 760px tall; section padding-top is 72px (already included in canvas coords)
        return (
          <div style={{
            ...fadeIn(progress, 0.15, 0.5),
            position: 'absolute',
            left: `${descEl.x}%`,
            top: (descEl.y / 100) * 760,
            maxWidth: '36%',
            zIndex: 5,
          }}>
            <p style={{ fontSize: fsize(cfg, 'description', 13), lineHeight: 1.8, color: clr(cfg, 'description', '#666'), fontFamily: 'Barlow,sans-serif', margin: 0 }}>
              {description}
            </p>
          </div>
        )
      })()}

      {/* SEE PRODUCT — absolutely positioned on section, matching canvas coordinate system */}
      {vis(cfg, 'see_product') && (() => {
        const seEl = cfg.elements.get('see_product') ?? { x: 1, y: 90 }
        return (
          <Link
            href={activeSlug ? `/shop?category=${activeSlug}` : '/shop'}
            style={{
              position: 'absolute',
              left: `${seEl.x}%`,
              top: (seEl.y / 100) * 760,
              display: 'inline-flex', alignItems: 'center', gap: 10,
              border: `1.5px solid ${clr(cfg, 'see_product', '#0d0d0d')}`,
              borderRadius: 40,
              padding: '9px 22px',
              fontSize: fsize(cfg, 'see_product', 10),
              fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              textDecoration: 'none',
              color: clr(cfg, 'see_product', '#0d0d0d'),
              fontFamily: 'Barlow,sans-serif',
              whiteSpace: 'nowrap',
              zIndex: 5,
            }}
          >
            {txt(cfg, 'see_product', 'SEE PRODUCT')} →
          </Link>
        )
      })()}

      <style>{`@keyframes scrollDot{0%{transform:translateY(0);opacity:1}60%{transform:translateY(12px);opacity:.2}100%{transform:translateY(0);opacity:1}}`}</style>
    </section>
  )
}
