'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Category, SiteSettings } from '@/types'
import { mergeDeviceConfig, vis, txt, imgUrl, clr, fsize } from '@/lib/useMergedConfig'
import { getScrollTransitionConfig, scrollExitStyle } from '@/lib/useScrollTransition'
import { CATEGORIES_DEFAULTS } from '@/lib/pageDefaults'
import { useViewportKind } from '@/lib/useBreakpoint'

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
  const viewport = useViewportKind()
  const cfg = mergeDeviceConfig(settings ?? null, 'categories', CATEGORIES_DEFAULTS as any, viewport)
  const txCfg = getScrollTransitionConfig(settings ?? null)
  const exitStyle = scrollExitStyle(scrollY, txCfg)
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

  // Mobile-specific font sizing — scaled for ~42% column width
  const getMobileFontSize = (i: number, activeI: number, items: typeof finalItems) => {
    const dist = Math.abs(i - activeI)
    const base = items[i]?.fontSize ?? 96
    if (dist === 0) return `clamp(34px,10vw,${Math.round(base * 0.52)}px)`
    if (dist === 1) return `clamp(22px,6.5vw,${Math.round(base * 0.34)}px)`
    if (dist === 2) return `clamp(16px,4.8vw,${Math.round(base * 0.26)}px)`
    return 'clamp(13px,3.5vw,20px)'
  }

  const getColor = (i: number) => {
    const dist = Math.abs(i - activeIdx)
    if (dist === 0) return finalItems[i]?.color ?? '#0d0d0d'
    return ['#999','#bbb','#ccc','#ddd'][Math.min(dist - 1, 3)]
  }

  // Active category slug for the SEE PRODUCT button link
  const activeCat = finalItems[activeIdx]
  const activeSlug = (activeCat?.name ?? '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (viewport !== 'desktop') {
    const isTablet = viewport === 'tablet'
    const visibleItems = finalItems.slice(0, isTablet ? 8 : 6)

    // ── TABLET: unchanged original layout ──
    if (isTablet) {
      return (
        <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '72px clamp(32px,6vw,72px) 84px' }}>
          <div style={{ position: 'absolute', right: '2%', top: '-8%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(360px,46vw,560px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>C</div>
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'minmax(270px,0.9fr) minmax(0,1.1fr)', gap: 'clamp(30px,5vw,64px)', alignItems: 'center' }}>
            <div>
              <div style={{ position: 'relative', aspectRatio: '4 / 5.2', maxHeight: 620, overflow: 'hidden', background: clr(cfg, 'model_image', '#e2e0dc'), clipPath: 'polygon(3% 0%,82% 0%,100% 28%,100% 100%,20% 100%,3% 62%)' }}>
                {activeImg ? <Image key={activeImg} src={activeImg} alt={activeCat?.name ?? 'Category'} fill sizes="38vw" style={{ objectFit: 'cover', objectPosition: 'top center' }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#ddddd9,#c8c4be)' }} />}
              </div>
            </div>
            <div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {visibleItems.map((cat, i) => {
                  const active = i === activeIdx
                  return (
                    <li key={cat.id} style={{ borderBottom: '1px solid #e8e8e5' }}>
                      <button onClick={() => setActiveIdx(i)} style={{ width: '100%', border: 'none', background: 'transparent', display: 'grid', gridTemplateColumns: '42px minmax(0,1fr) 52px', gap: 10, alignItems: 'center', padding: active ? '12px 0' : '10px 0', cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: active ? '#0d0d0d' : '#c9c9c5', fontFamily: 'Barlow,sans-serif' }}>[{String(i + 1).padStart(2, '0')}]</span>
                        <span style={{ minWidth: 0, fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: active ? 'clamp(58px,7vw,92px)' : 'clamp(34px,4vw,54px)', lineHeight: 0.96, color: active ? (cat.color ?? '#0d0d0d') : '#c8c8c5', textTransform: 'lowercase', transition: 'font-size 0.25s ease,color 0.25s ease', overflowWrap: 'anywhere' }}>{cat.name}</span>
                        <span style={{ fontSize: active ? 15 : 13, color: active ? '#888' : '#c8c8c5', textAlign: 'right', fontFamily: 'Barlow,sans-serif' }}>({cat.count})</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
                <span style={{ fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow,sans-serif', whiteSpace: 'nowrap' }}>{txt(cfg, 'label', '[CATEGORIES]')}</span>
                <span style={{ height: 1, flex: 1, borderTop: '1px dashed #ccc' }} />
              </div>
              {vis(cfg, 'description') && <p style={{ margin: '24px 0 0', maxWidth: 420, fontSize: 16, lineHeight: 1.8, color: clr(cfg, 'description', '#666'), fontFamily: 'Barlow,sans-serif' }}>{description}</p>}
              {vis(cfg, 'see_product') && (
                <Link href={activeSlug ? `/shop?category=${activeSlug}` : '/shop'} style={{ marginTop: 28, display: 'inline-flex', minHeight: 44, alignItems: 'center', gap: 10, border: `1.5px solid ${clr(cfg, 'see_product', '#0d0d0d')}`, borderRadius: 999, padding: '11px 24px', fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: clr(cfg, 'see_product', '#0d0d0d'), fontFamily: 'Barlow,sans-serif', whiteSpace: 'nowrap' }}>
                  {txt(cfg, 'see_product', 'SEE PRODUCT')} →
                </Link>
              )}
            </div>
          </div>
        </section>
      )
    }

    // ── MOBILE: Premium layout — mirrors desktop left/right columns ──
    // Left column image (with arrow cutout clip) stacked above right column category list
    return (
      <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '52px 0 64px' }}>
        {/* C watermark */}
        <div style={{ position: 'absolute', right: '-8%', top: '-2%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'min(92vw,360px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>C</div>

        {/* Top label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', flexShrink: 0 }}>
            {txt(cfg, 'label', '[CATEGORIES]')}
          </span>
          <div style={{ flex: 1, maxWidth: 120, borderTop: '1px dashed #ccc' }} />
          {/* Scroll indicator */}
          <div style={{ width: 18, height: 30, border: '1.5px solid #bbb', borderRadius: 9, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4, flexShrink: 0 }}>
            <div style={{ width: 2.5, height: 6, background: '#888', borderRadius: 2, animation: 'scrollDot 1.6s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Two-zone layout: image left (40%) + category list right (60%) — inline-block */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '42fr 58fr', gap: 0, alignItems: 'start' }}>

          {/* LEFT — image with arrow cutout (exact desktop geometry) */}
          <div style={fadeIn(progress, 0.0, 0.42)}>
            <div style={{ position: 'relative', height: 'min(72vw,420px)', overflow: 'hidden', background: clr(cfg, 'model_image', '#e2e0dc') }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '132%',
                transform: `translateY(${parallaxY}px)`,
                transition: 'transform 0.1s linear', willChange: 'transform',
              }}>
                {activeImg
                  ? <Image key={activeImg} src={activeImg} alt={activeCat?.name ?? 'Category'} fill sizes="42vw" style={{ objectFit: 'cover', objectPosition: 'top center', transition: 'opacity 0.4s ease' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#ddddd9,#c8c4be)' }} />
                }
              </div>
              {/* Arrow cutout — same as desktop */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '28%', background: cfg.bgColor, clipPath: 'polygon(100% 0%,100% 100%,0% 100%,40% 75%,0% 50%,40% 25%,0% 0%)', zIndex: 2 }} />
            </div>
          </div>

          {/* RIGHT — category scroll wheel with exitStyle */}
          <div ref={listRef} style={{ ...fadeIn(progress, 0.08, 0.46), ...exitStyle, paddingTop: 4, paddingRight: 16, cursor: 'ns-resize' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {visibleItems.map((cat, i) => (
                <li key={cat.id} style={{ borderBottom: '1px solid #e8e8e5' }}>
                  <div
                    onClick={() => setActiveIdx(i)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${i === activeIdx ? 5 : 3}px 0`, cursor: 'pointer', transition: 'padding 0.3s' }}
                  >
                    <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: 8, fontWeight: 600, letterSpacing: '1px', color: i === activeIdx ? '#0d0d0d' : '#ccc', width: 24, flexShrink: 0, transition: 'color 0.3s' }}>
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: getMobileFontSize(i, activeIdx, finalItems), lineHeight: 1, color: i === activeIdx ? (cat.color ?? '#0d0d0d') : getColor(i), textTransform: 'lowercase', letterSpacing: '-0.5px', flex: 1, textAlign: 'right', paddingRight: 8, transition: 'font-size 0.35s cubic-bezier(0.4,0,0.2,1),color 0.35s' }}>
                      {cat.name}
                    </span>
                    <span style={{ fontFamily: 'Barlow,sans-serif', fontSize: i === activeIdx ? 11 : 9, fontWeight: 500, color: i === activeIdx ? '#888' : '#ccc', flexShrink: 0, width: 32, textAlign: 'right', transition: 'color 0.3s,font-size 0.3s' }}>
                      ({cat.count})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Below image — description + SEE PRODUCT — exitStyle + fadeIn */}
        <div style={{ ...fadeIn(progress, 0.15, 0.5), ...exitStyle, padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
          {vis(cfg, 'description') && (
            <p style={{ fontSize: 13, lineHeight: 1.8, color: clr(cfg, 'description', '#666'), fontFamily: 'Barlow,sans-serif', margin: '0 0 20px', maxWidth: 340 }}>
              {description}
            </p>
          )}
          {vis(cfg, 'see_product') && (
            <Link
              href={activeSlug ? `/shop?category=${activeSlug}` : '/shop'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${clr(cfg, 'see_product', '#0d0d0d')}`, borderRadius: 40, padding: '9px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: clr(cfg, 'see_product', '#0d0d0d'), fontFamily: 'Barlow,sans-serif', whiteSpace: 'nowrap' }}
            >
              {txt(cfg, 'see_product', 'SEE PRODUCT')} →
            </Link>
          )}
        </div>

        <style>{`@keyframes scrollDot{0%{transform:translateY(0);opacity:1}60%{transform:translateY(10px);opacity:.2}100%{transform:translateY(0);opacity:1}}`}</style>
      </section>
    )
  }

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
