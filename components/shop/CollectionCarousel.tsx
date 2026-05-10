'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Product, SiteSettings } from '@/types'
import { mergeDeviceConfig, vis, txt, imgUrl, clr } from '@/lib/useMergedConfig'
import { getScrollTransitionConfig, scrollExitStyle } from '@/lib/useScrollTransition'
import { useViewportKind } from '@/lib/useBreakpoint'

interface Props { products: Product[]; settings?: SiteSettings | null }

const DEFAULTS = [
  { id: 'title',   visible: true, x: 3,  y: 5,  fontSize: 13, color: '#0d0d0d', content: '©calvac - jacket momento' },
  { id: 'year',    visible: true, x: 3,  y: 14, fontSize: 12, color: '#aaaaaa', content: '2026' },
  { id: 'other',   visible: true, x: 12, y: 14, fontSize: 11, color: '#aaaaaa', content: '[Other]' },
  { id: 'wear',    visible: true, x: 36, y: 85, fontSize: 11, color: '#ffffff', content: '[Wear the Moment]' },
  { id: 'card1',   visible: true, x: 2,  y: 25, width: 14, height: 62, isImage: true, color: '#c8b890', imageUrl: '', fontSize: 14 },
  { id: 'card2',   visible: true, x: 17, y: 22, width: 16, height: 68, isImage: true, color: '#a8b898', imageUrl: '', fontSize: 14 },
  { id: 'card3',   visible: true, x: 34, y: 16, width: 20, height: 78, isImage: true, color: '#3e3e3e', imageUrl: '', fontSize: 14 },
  { id: 'card4',   visible: true, x: 55, y: 22, width: 16, height: 68, isImage: true, color: '#90aea8', imageUrl: '', fontSize: 14 },
  { id: 'card5',   visible: true, x: 72, y: 25, width: 14, height: 62, isImage: true, color: '#b8a888', imageUrl: '', fontSize: 14 },
  { id: 'card6',   visible: true, x: 87, y: 28, width: 12, height: 55, isImage: true, color: '#9a9088', imageUrl: '', fontSize: 14 },
]

function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      setProgress(Math.min(1, Math.max(0, (window.innerHeight * 0.88 - rect.top) / (window.innerHeight * 0.66))))
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
  return { filter: `blur(${((1-p)*16).toFixed(1)}px)`, opacity: Number(p.toFixed(3)), transform: `translateY(${((1-p)*22).toFixed(1)}px)`, transition: p > 0 ? 'filter 0.6s cubic-bezier(0.4,0,0.2,1),opacity 0.6s cubic-bezier(0.4,0,0.2,1),transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none', willChange: 'filter,opacity,transform' }
}

const CLIP = 'polygon(0% 0%, 80% 5%, 95% 35%, 100% 100%, 20% 95%, 5% 65%)'
const CARD_W = 225, CARD_W_ACTIVE = 295, CARD_H = 385, CARD_H_ACTIVE = 490, GAP = 18, LIFT = 38

export default function CollectionCarousel({ products, settings }: Props) {
  const { ref, progress, scrollY } = useSectionProgress()
  const viewport = useViewportKind()
  const router = useRouter()
  const txCfg = getScrollTransitionConfig(settings ?? null)
  const exitStyle = scrollExitStyle(scrollY, txCfg)

  // Build 6-slot array: products with carousel_slot fill their slot, rest are placeholders
  const base: any[] = Array.from({ length: 6 }, (_, i) => ({
    id: String(i), name: `Card ${i+1}`, images: [], slug: '', price: 2999,
  }))
  products.slice(0, 6).forEach((p: any) => {
    const slot = p.carousel_slot ? p.carousel_slot - 1 : null
    if (slot !== null && slot >= 0 && slot < 6) {
      base[slot] = p
    } else {
      // No slot assigned — fill first empty slot
      const emptyIdx = base.findIndex((b, i) => !products.some((p2: any) =>
        p2.carousel_slot === i + 1) && b.slug === '')
      if (emptyIdx !== -1) base[emptyIdx] = p
    }
  })
  const total = base.length
  const items = [...base, ...base, ...base]
  const [activeIdx, setActiveIdx] = useState(total + 1)
  const [trackX, setTrackX] = useState(0)
  const initialized = useRef(false)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, trackX: 0 })
  const dragDistance = useRef(0)  // track how far we dragged to distinguish click vs drag
  const dotIdx = activeIdx % total
  const isDesktop = viewport === 'desktop'
  const isTablet = viewport === 'tablet'
  const cfg = mergeDeviceConfig(settings ?? null, 'carousel', DEFAULTS, viewport)
  const cardW = isDesktop ? CARD_W : isTablet ? 210 : 168
  const cardWActive = isDesktop ? CARD_W_ACTIVE : isTablet ? 270 : 218
  const cardH = isDesktop ? CARD_H : isTablet ? 360 : 292
  const cardHActive = isDesktop ? CARD_H_ACTIVE : isTablet ? 450 : 360
  const gap = isDesktop ? GAP : isTablet ? 16 : 12
  const lift = isDesktop ? LIFT : isTablet ? 30 : 22

  // Card colors from admin or fallbacks
  const cardColors = [
    clr(cfg,'card1','#c8b890'), clr(cfg,'card2','#a8b898'), clr(cfg,'card3','#3e3e3e'),
    clr(cfg,'card4','#90aea8'), clr(cfg,'card5','#b8a888'), clr(cfg,'card6','#9a9088'),
  ]
  // Card images from admin
  const cardImgs = ['card1','card2','card3','card4','card5','card6'].map(id => imgUrl(cfg, id))

  const getCardX = (idx: number, active: number) => {
    let x = 0
    for (let k = 0; k < idx; k++) x += (k === active ? cardWActive : cardW) + gap
    return x
  }

  const centerActive = (newActive: number) => {
    const vW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const cardX = getCardX(newActive, newActive)
    setTrackX(-(cardX + cardWActive / 2 - vW / 2))
  }

  useEffect(() => {
    if (!initialized.current) { centerActive(activeIdx); initialized.current = true }
  }, [])

  useEffect(() => {
    if (initialized.current) centerActive(activeIdx)
  }, [viewport])

  const goTo = (newActive: number) => {
    let target = newActive
    if (target < total / 2) target += total
    if (target > total * 2.5) target -= total
    setActiveIdx(target)
    centerActive(target)
  }

  const prev = () => goTo(activeIdx - 1)
  const next = () => goTo(activeIdx + 1)

  const onDragStart = (x: number) => { dragging.current = true; dragDistance.current = 0; dragStart.current = { x, trackX } }
  const onDragMove = (x: number) => { if (!dragging.current) return; dragDistance.current = Math.abs(x - dragStart.current.x); setTrackX(dragStart.current.trackX + x - dragStart.current.x) }
  const onDragEnd = (x: number) => {
    if (!dragging.current) return
    dragging.current = false
    const delta = x - dragStart.current.x
    if (Math.abs(delta) > 60) delta < 0 ? next() : prev()
    else centerActive(activeIdx)
  }

  return (
    <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: isDesktop ? '64px 0 72px' : isTablet ? '62px 0 76px' : '52px 0 64px' }}>

      {/* Header */}
      <div style={{ ...fadeIn(progress, 0.0, 0.38), ...exitStyle, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: isDesktop ? '0 52px' : isTablet ? '0 clamp(32px,6vw,72px)' : '0 clamp(16px,5vw,28px)', marginBottom: isDesktop ? 40 : 30, gap: 18 }}>
        <div>
          <p style={{ fontFamily: 'Barlow,sans-serif', fontSize: isDesktop ? 25 : isTablet ? 22 : 18, fontWeight: 800,letterSpacing: '3px',color: '#0d0d0d', marginBottom: 6 }}>{txt(cfg,'title','SHOP THE COLLECTIONS')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 15, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{txt(cfg,'year','2026')}</span>
            <span style={{ fontSize: 15, color: '#aaa', letterSpacing: '2px', fontFamily: 'Barlow,sans-serif' }}>{txt(cfg,'other','[Other]')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[{ fn: prev, label: '←' }, { fn: next, label: '→' }].map((b, i) => (
            <button key={i} onClick={b.fn} style={{ width: 42, height: 42, border: '1.5px solid #0d0d0d', borderRadius: '50%', background: 'none', cursor: 'pointer', fontSize: 16, color: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#0d0d0d' }}
            >{b.label}</button>
          ))}
        </div>
      </div>

      {/* Track */}
      <div style={{ ...fadeIn(progress, 0.08, 0.52), overflow: 'hidden', cursor: 'grab', paddingBottom: lift + 10, touchAction: 'pan-y' }}
        onMouseDown={e => onDragStart(e.clientX)} onMouseMove={e => onDragMove(e.clientX)} onMouseUp={e => onDragEnd(e.clientX)} onMouseLeave={e => { if (dragging.current) onDragEnd(e.clientX) }}
        onTouchStart={e => onDragStart(e.touches[0].clientX)} onTouchMove={e => onDragMove(e.touches[0].clientX)} onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap, transform: `translateX(${trackX}px)`, transition: dragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)', willChange: 'transform', width: 'max-content' }}>
          {items.map((item, i) => {
            const isActive = i === activeIdx
            const w = isActive ? cardWActive : cardW
            const h = isActive ? cardHActive : cardH
            const bg = cardColors[i % cardColors.length]
            const imgSrc = cardImgs[i % cardImgs.length] || item?.images?.[0]
            const dist = Math.abs(i - activeIdx)
            return (
              <div key={i} onClick={() => {
                // If dragged more than 8px it's a swipe, not a click
                if (dragDistance.current > 8) return
                if (isActive && item?.slug) {
                  router.push(`/product/${item.slug}`)
                } else {
                  goTo(i)
                }
              }} style={{ flexShrink: 0, width: w, height: h, position: 'relative', overflow: 'hidden', background: bg, clipPath: CLIP, cursor: 'pointer', transform: `translateY(${isActive ? -lift : 0}px)`, opacity: dist === 0 ? 1 : dist === 1 ? 0.92 : dist === 2 ? 0.75 : 0.5, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1),height 0.5s cubic-bezier(0.4,0,0.2,1),transform 0.5s cubic-bezier(0.4,0,0.2,1),opacity 0.4s', willChange: 'transform,width,height', userSelect: 'none' }}>
                {imgSrc ? <Image src={imgSrc} alt={item.name} fill draggable={false} style={{ objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} />
                  : <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif', textAlign: 'center', padding: 10 }}>{item?.name}</span></div>}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.28))', pointerEvents: 'none' }} />
                {isActive && <div style={{ position: 'absolute', top: 0, left: 0, right: '12%', height: 2, background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }} />}
                {isActive && vis(cfg,'wear') && (
                  <div style={{ position: 'absolute', bottom: 36, left: 25, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: 11, color: clr(cfg,'wear','rgba(255,255,255,0.9)'), letterSpacing: '0.5px', fontFamily: 'Barlow,sans-serif' }}>{txt(cfg,'wear','[Wear the Moment]')}</span>
                  </div>
                )}
                {/* Product name + view prompt on active card */}
                {isActive && item?.slug && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px 14px', pointerEvents: 'none' }}>
                    {item?.name && (
                      <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px', letterSpacing: '0.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                    )}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '4px 12px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', fontFamily: 'Barlow,sans-serif' }}>View Product</span>
                      <span style={{ fontSize: 10, color: '#fff' }}>→</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dots */}
      <div style={{ ...fadeIn(progress, 0.18, 0.58), display: 'flex', justifyContent: 'center', gap: 8, marginTop: -45 }}>
        {base.map((_, i) => (
          <button key={i} onClick={() => goTo(total + i)} style={{ width: dotIdx === i ? 28 : 8, height: 5, borderRadius: 2, background: dotIdx === i ? '#0d0d0d' : '#ccc', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.3s,background 0.3s' }} />
        ))}
      </div>
    </section>
  )
}
