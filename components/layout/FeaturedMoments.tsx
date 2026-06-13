'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Product, SiteSettings } from '@/types'
import { mergeDeviceConfig, vis, txt, imgUrl, clr, fsize } from '@/lib/useMergedConfig'
import { getScrollTransitionConfig, scrollExitStyle } from '@/lib/useScrollTransition'
import { clampedParallax } from '@/lib/useScrollAnimation'
import { useViewportKind } from '@/lib/useBreakpoint'

interface Props { products: Product[]; settings?: SiteSettings | null }

const DEFAULTS = [
  { id: 'headline',    visible: true, x: 2,  y: 4,  fontSize: 82,  color: '#0d0d0d', content: 'All - about\nmoments ©26' },
  { id: 'star',        visible: true, x: 3,  y: 50, fontSize: 32,  color: '#f04e0f', content: '✦' },
  { id: 'custom_text', visible: true, x: 2,  y: 62, fontSize: 13,  color: '#555555', content: 'Crafted for the bold.\nWorn by the few.' },
  { id: 'learn_more',  visible: true, x: 2,  y: 82, fontSize: 10,  color: '#0d0d0d', content: 'LEARN MORE' },
  { id: 'main_image',  visible: true, x: 29, y: 2,  width: 36, height: 75, isImage: true, color: '#c8b890', imageUrl: '', fontSize: 14 },
  { id: 'caption1',    visible: true, x: 29, y: 79, fontSize: 11,  color: '#aaaaaa', content: '©International - going distance 2026' },
  { id: 'description', visible: true, x: 67, y: 2,  fontSize: 12,  color: '#777777', content: 'Where Elegance Meets\nSustainability Luxury\nMade Accessible' },
  { id: 'thumb_image', visible: true, x: 87, y: 2,  width: 9, height: 17, isImage: true, color: '#b8c0a8', imageUrl: '', fontSize: 14 },
  { id: 'price1',      visible: true, x: 76, y: 24, fontSize: 38,  color: '#0d0d0d', content: '($120)' },
  { id: 'product2_img',visible: true, x: 66, y: 37, width: 30, height: 38, isImage: true, color: '#5a5050', imageUrl: '', fontSize: 14 },
  { id: 'caption2',    visible: true, x: 67, y: 77, fontSize: 11,  color: '#aaaaaa', content: '©International - just do it 2026' },
  { id: 'price2',      visible: true, x: 76, y: 86, fontSize: 38,  color: '#0d0d0d', content: '(45%)' },
]

function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const wH = window.innerHeight
      setProgress(Math.min(1, Math.max(0, (wH * 0.85 - rect.top) / (wH * 0.65))))
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
    filter: `blur(${((1 - p) * 18).toFixed(1)}px)`,
    opacity: Number(p.toFixed(3)),
    transform: `translateY(${((1 - p) * 28).toFixed(1)}px)`,
    transition: p > 0 ? 'filter 0.55s cubic-bezier(0.4,0,0.2,1),opacity 0.55s cubic-bezier(0.4,0,0.2,1),transform 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none',
    willChange: 'filter,opacity,transform',
  }
}

export default function FeaturedMoments({ products, settings }: Props) {
  const { ref, progress, scrollY } = useSectionProgress()
  const viewport = useViewportKind()
  const cfg = mergeDeviceConfig(settings ?? null, 'featured_moments', DEFAULTS, viewport)
  const router = useRouter()
  const txCfg = getScrollTransitionConfig(settings ?? null)
  const exitStyle = scrollExitStyle(scrollY, txCfg)

  // Slot-based product mapping
  const slotMap: Record<number, any> = {}
  products.forEach((p: any) => {
    if (p.featured_moment_slot >= 1 && p.featured_moment_slot <= 3)
      slotMap[p.featured_moment_slot] = p
  })
  const p1 = slotMap[1] ?? products[0]
  const p2 = slotMap[2] ?? undefined
  const p3 = slotMap[3] ?? products[1]

  const p1Price = txt(cfg, 'price1', '') || (p1 ? `₹${p1.price.toLocaleString('en-IN')}` : '($120)')
  const p3Display = txt(cfg, 'price2', '') || (p3?.compare_price ? `(${Math.round(((p3.compare_price - p3.price) / p3.compare_price) * 100)}%)` : p3 ? `₹${p3.price.toLocaleString('en-IN')}` : '(45%)')

  // Image sources: admin override → product image → placeholder
  const img1Src = imgUrl(cfg, 'main_image') || p1?.images?.[0] || ''
  // FIX: thumb_image uses slot 2 product or p2 fallback
  const img2Src = imgUrl(cfg, 'thumb_image') || p2?.images?.[0] || p1?.images?.[1] || ''
  const img3Src = imgUrl(cfg, 'product2_img') || p3?.images?.[0] || ''

  const parallax1 = (scrollY * 0.18).toFixed(1)
  const parallax3 = (scrollY * 0.22).toFixed(1)
  // FIX: thumb uses negative top offset so parallax doesn't leave gap at top
  const parallax2 = (scrollY * 0.12).toFixed(1)
  const mobileParallax1 = clampedParallax(scrollY, 0.06, 34)
  const mobileParallax2 = clampedParallax(scrollY, 0.035, 16)
  const mobileParallax3 = clampedParallax(scrollY, 0.045, 26)
  const tabletParallax1 = clampedParallax(scrollY, 0.07, 36)
  const tabletParallax2 = clampedParallax(scrollY, 0.04, 18)
  const tabletParallax3 = clampedParallax(scrollY, 0.05, 28)

  if (viewport !== 'desktop') {
    const isTablet = viewport === 'tablet'
    const imageShape = 'polygon(4% 0%,82% 0%,96% 34%,96% 100%,18% 100%,4% 64%)'

    // ── TABLET: unchanged original layout ──
    if (isTablet) {
      return (
        <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, overflow: 'hidden', borderTop: '1px solid #e8e8e5', padding: 'clamp(64px,9vw,96px) clamp(32px,6vw,72px)' }}>
          <div style={{ position: 'absolute', left: '36%', top: '-10%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(380px,48vw,560px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>S</div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(280px,1.05fr)', gap: 'clamp(28px,5vw,58px)', alignItems: 'center' }}>
            <div style={{ ...exitStyle, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {vis(cfg, 'headline') && (
                <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(70px,9vw,112px)', lineHeight: 0.92, letterSpacing: 0, color: clr(cfg,'headline','#0d0d0d'), margin: 0, whiteSpace: 'pre-line', maxWidth: 440 }}>
                  {txt(cfg, 'headline', 'All - about\nmoments C26')}
                </h2>
              )}
              {vis(cfg, 'star') && <div className="animate-spin-slow" style={{ color: clr(cfg,'star',cfg.accentColor), fontSize: 38, lineHeight: 1 }}>{txt(cfg,'star','*')}</div>}
              {vis(cfg, 'custom_text') && (
                <p style={{ fontSize: 16, lineHeight: 1.8, color: clr(cfg,'custom_text','#555'), fontFamily: 'Barlow,sans-serif', whiteSpace: 'pre-line', maxWidth: 330, margin: 0 }}>
                  {txt(cfg, 'custom_text', 'Crafted for the bold.\nWorn by the few.')}
                </p>
              )}
              {vis(cfg, 'learn_more') && (
                <Link href="/shop" style={{ display: 'inline-flex', width: 'fit-content', minHeight: 44, alignItems: 'center', gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 999, padding: '11px 24px', fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>
                  {txt(cfg, 'learn_more', 'LEARN MORE')} →
                </Link>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(150px,0.58fr)', gap: 24, alignItems: 'start' }}>
              {vis(cfg, 'main_image') && (
                <div>
                  <div onClick={() => p1?.slug && router.push(`/product/${p1.slug}`)} style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', clipPath: imageShape, background: clr(cfg,'main_image','#c8b890'), cursor: p1?.slug ? 'pointer' : 'default' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: 0, right: 0, height: '122%', transform: `translateY(${tabletParallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                      {img1Src ? <Image src={img1Src} alt={p1?.name ?? 'Product'} fill sizes="34vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
                    </div>
                  </div>
                  <div style={exitStyle}>
                  {vis(cfg, 'caption1') && <p style={{ margin: '12px 0 0', fontSize: 12, color: clr(cfg,'caption1','#aaa'), letterSpacing: '0.4px', fontStyle: 'italic' }}>{txt(cfg,'caption1', `©${p1?.name ?? 'International'} - going distance 2026`)}</p>}
                  {vis(cfg, 'price1') && <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 42, margin: '8px 0 0', color: clr(cfg,'price1','#0d0d0d') }}>{p1Price}</p>}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {vis(cfg, 'description') && <p style={{ ...exitStyle, flex: 1, fontSize: 14, lineHeight: 1.75, color: clr(cfg,'description','#777'), fontFamily: 'Barlow,sans-serif', margin: 0, whiteSpace: 'pre-line' }}>{txt(cfg,'description','Where Elegance Meets\nSustainability Luxury\nMade Accessible')}</p>}
                {vis(cfg, 'thumb_image') && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', overflow: 'hidden', background: clr(cfg,'thumb_image','#c8c0b8'), clipPath: imageShape }}>
                    <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, height: '116%', transform: `translateY(${tabletParallax2}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                      {img2Src ? <Image src={img2Src} alt={p2?.name ?? 'Product'} fill sizes="18vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
                    </div>
                  </div>
                )}
                {vis(cfg, 'product2_img') && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', overflow: 'hidden', background: clr(cfg,'product2_img','#5a5050'), clipPath: imageShape }}>
                    <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, height: '116%', transform: `translateY(${tabletParallax3}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                      {img3Src ? <Image src={img3Src} alt={p3?.name ?? 'Product'} fill sizes="18vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    }

    // Mobile: scroll outro on content, parallax-only images.
    const mobileTextStyle: React.CSSProperties = exitStyle

    return (
      <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, overflow: 'hidden', borderTop: '1px solid #e8e8e5', padding: '52px 20px 64px' }}>
        {/* S watermark */}
        <div style={{ position: 'absolute', left: '10%', top: '-6%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'min(88vw,340px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>S</div>

        <div style={{ position: 'relative' }}>
          {/* Headline */}
          {vis(cfg, 'headline') && (
            <div style={{ ...mobileTextStyle }}>
              <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(54px,16vw,80px)', lineHeight: 0.91, letterSpacing: '-0.5px', color: clr(cfg,'headline','#0d0d0d'), margin: '0 0 18px', whiteSpace: 'pre-line' }}>
                {txt(cfg, 'headline', 'All - about\nmoments ©26')}
              </h2>
            </div>
          )}

          {/* custom_text — body text */}
          {vis(cfg, 'custom_text') && (
            <div style={{ ...mobileTextStyle, marginBottom: 16 }}>
              <p style={{ fontSize: fsize(cfg,'custom_text',13), lineHeight: 1.75, color: clr(cfg,'custom_text','#555'), fontFamily: 'Barlow,sans-serif', margin: 0, whiteSpace: 'pre-line' }}>
                {txt(cfg, 'custom_text', 'Crafted for the bold.\nWorn by the few.')}
              </p>
            </div>
          )}

          {/* Main image */}
          {vis(cfg, 'main_image') && (
            <div
              onClick={() => p1?.slug && router.push(`/product/${p1.slug}`)}
              style={{ position: 'relative', width: '100%', aspectRatio: '4 / 4.8', overflow: 'hidden', clipPath: imageShape, background: clr(cfg,'main_image','#c8b890'), cursor: p1?.slug ? 'pointer' : 'default', marginBottom: 14 }}
            >
              <div style={{ position: 'absolute', top: '-12%', left: 0, right: 0, height: '124%', transform: `translateY(${mobileParallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                {img1Src ? <Image src={img1Src} alt={p1?.name ?? 'Product'} fill sizes="(max-width:768px) 100vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
              </div>
              {/* White stripe at ~69% like desktop */}
              <div style={{ position: 'absolute', top: '69%', left: 0, right: 0, height: 6, background: cfg.bgColor, zIndex: 3 }} />
            </div>
          )}

          {/* Caption + price row */}
          <div style={{ ...mobileTextStyle, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
            {vis(cfg, 'caption1') && (
              <p style={{ fontSize: 11, color: clr(cfg,'caption1','#aaa'), fontStyle: 'italic', letterSpacing: '0.4px', fontFamily: 'Barlow,sans-serif', margin: 0, flex: 1, paddingRight: 12 }}>
                {txt(cfg,'caption1', `©${p1?.name ?? 'International'} - going distance 2026`)}
              </p>
            )}
            {vis(cfg, 'price1') && (
              <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 'clamp(28px,10vw,42px)', margin: 0, color: clr(cfg,'price1','#0d0d0d'), flexShrink: 0 }}>
                {p1Price}
              </p>
            )}
          </div>

          {/* Description + thumb row */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 22 }}>
            {vis(cfg, 'star') && (
              <div className="animate-spin-slow" style={{ ...mobileTextStyle, color: clr(cfg,'star',cfg.accentColor), fontSize: 26, lineHeight: 1, flexShrink: 0, paddingTop: 2 }}>
                {txt(cfg,'star','✦')}
              </div>
            )}
            {vis(cfg, 'description') && (
              <p style={{ ...mobileTextStyle, flex: 1, fontSize: 13, lineHeight: 1.75, color: clr(cfg,'description','#777'), fontFamily: 'Barlow,sans-serif', margin: 0, whiteSpace: 'pre-line' }}>
                {txt(cfg,'description','Where Elegance Meets\nSustainability Luxury\nMade Accessible')}
              </p>
            )}
            {vis(cfg, 'thumb_image') && (
              <div style={{ position: 'relative', width: 72, aspectRatio: '4 / 5', overflow: 'hidden', background: clr(cfg,'thumb_image','#c8c0b8'), flexShrink: 0, clipPath: imageShape }}>
                <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, height: '116%', transform: `translateY(${mobileParallax2}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                  {img2Src ? <Image src={img2Src} alt={p2?.name ?? ''} fill sizes="72px" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
                </div>
              </div>
            )}
          </div>

          {/* Divider like desktop */}
          <div style={{ height: 1, background: '#e0e0dd', margin: '8px 0 20px' }} />

          {/* Product 2 image */}
          {vis(cfg, 'product2_img') && (
            <div
              onClick={() => p3?.slug && router.push(`/product/${p3.slug}`)}
              style={{ position: 'relative', width: '76%', aspectRatio: '4 / 3.8', overflow: 'hidden', clipPath: 'polygon(2% 2%,82% 2%,96% 44%,96% 96%,15% 96%,2% 52%)', background: clr(cfg,'product2_img','#5a5050'), cursor: p3?.slug ? 'pointer' : 'default', marginBottom: 14 }}
            >
              <div style={{ position: 'absolute', top: '-12%', left: 0, right: 0, height: '126%', transform: `translateY(${mobileParallax3}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                {img3Src ? <Image src={img3Src} alt={p3?.name ?? 'Product 2'} fill sizes="(max-width:768px) 76vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} /> : null}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.22))', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          {/* Caption2 + price2 row */}
          <div style={{ ...mobileTextStyle, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            {vis(cfg, 'caption2') && (
              <p style={{ fontSize: 11, color: clr(cfg,'caption2','#aaa'), fontStyle: 'italic', letterSpacing: '0.4px', fontFamily: 'Barlow,sans-serif', margin: 0, flex: 1, paddingRight: 12 }}>
                {txt(cfg,'caption2', `©${p3?.name ?? 'International'} - just do it 2026`)}
              </p>
            )}
            {vis(cfg, 'price2') && (
              <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 'clamp(28px,10vw,42px)', margin: 0, color: clr(cfg,'price2','#0d0d0d'), flexShrink: 0 }}>
                {p3Display}
              </p>
            )}
          </div>

          {/* CTA */}
          {vis(cfg, 'learn_more') && (
            <div style={{ ...mobileTextStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.accentColor }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ddddd9' }} />
              </div>
              <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '9px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>
                {txt(cfg, 'learn_more', 'LEARN MORE')} →
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, overflow: 'hidden' }}>
      {/* S watermark */}
      <div style={{ position: 'absolute', left: '18%', top: '-8%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(400px,52vw,720px)', lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>S</div>

      <div style={{ position: 'relative', zIndex: 1, padding: '72px 52px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28fr 38fr 34fr', alignItems: 'start' }}>

          {/* ── COL 1: text — scroll exit applied ── */}
          <div style={{ ...exitStyle, display: 'flex', flexDirection: 'column', paddingRight: 32, paddingTop: 4, minHeight: 480 }}>
            <div style={{ flex: 1 }}>
              {vis(cfg, 'headline') && (
                <div style={fadeIn(progress, 0.0, 0.35)}>
                  <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: `clamp(44px,5.8vw,${fsize(cfg,'headline',82)}px)`, lineHeight: 0.91, letterSpacing: '-1.5px', color: clr(cfg,'headline','#0d0d0d'), margin: 0, whiteSpace: 'pre-line' }}>
                    {txt(cfg, 'headline', 'All - about\nmoments ©26')}
                  </h2>
                </div>
              )}
              {vis(cfg, 'star') && (
                <div style={{ ...fadeIn(progress, 0.08, 0.38), display: 'inline-block' }}>
                  <div className="animate-spin-slow" style={{ color: clr(cfg,'star',cfg.accentColor), fontSize: fsize(cfg,'star',32), marginTop: 18, lineHeight: 1 }}>✦</div>
                </div>
              )}
              {vis(cfg, 'custom_text') && (
                <div style={{ ...fadeIn(progress, 0.10, 0.40), marginTop: 20 }}>
                  <p style={{ fontSize: fsize(cfg,'custom_text',13), lineHeight: 1.7, color: clr(cfg,'custom_text','#555'), fontFamily: 'Barlow,sans-serif', whiteSpace: 'pre-line', margin: 0 }}>
                    {txt(cfg, 'custom_text', 'Crafted for the bold.\nWorn by the few.')}
                  </p>
                </div>
              )}
            </div>
            {vis(cfg, 'learn_more') && (
              <div style={{ ...fadeIn(progress, 0.12, 0.42), marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.accentColor }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddddd9' }} />
                </div>
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '9px 22px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>
                  {txt(cfg, 'learn_more', 'LEARN MORE')} →
                </Link>
              </div>
            )}
          </div>

          {/* ── COL 2: Main S-shape image — NO exit style on images ── */}
          <div style={{ position: 'relative', paddingRight: 28, clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)' }}>
            <div style={{ position: 'absolute', left: '5%', top: '2%', width: '82%', height: '92%', background: '#e4e1db', clipPath: 'polygon(0% 100%,0% 0%,25% 0%,50% 40%,75% 0%,100% 0%,100% 100%,80% 100%,80% 30%,50% 70%,20% 30%,20% 100%)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Slot 1 image — clickable */}
              <div
                onClick={() => p1?.slug && router.push(`/product/${p1.slug}`)}
                style={{ width: '100%', height: 380, overflow: 'hidden', position: 'relative', background: clr(cfg,'main_image','#c8b890'), cursor: p1?.slug ? 'pointer' : 'default' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '190%', transform: `translateY(${parallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                  {img1Src
                    ? <Image src={img1Src} alt={p1?.name ?? 'Product'} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                    : <div style={{ width: '100%', height: '100%', background: clr(cfg,'main_image','#c8b890'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif' }}>PRODUCT IMAGE</span></div>}
                </div>
                {p1?.slug && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.3s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12 }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.18)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '4px 14px', opacity: 0, transition: 'opacity 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', fontFamily: 'Barlow,sans-serif' }}>View Product →</span>
                    </div>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '69%', left: 0, right: 0, height: 10, background: cfg.bgColor, zIndex: 3 }} />
              </div>
              {/* Caption below col 2 image — gets exit style */}
              {vis(cfg, 'caption1') && (
                <div style={{ ...fadeIn(progress, 0.20, 0.50), ...exitStyle }}>
                  <p style={{ marginTop: 12, fontSize: fsize(cfg,'caption1',11), color: clr(cfg,'caption1','#aaa'), letterSpacing: '0.5px', fontFamily: 'Barlow,sans-serif', fontStyle: 'italic' }}>
                    {txt(cfg, 'caption1', `©${p1?.name ?? 'International'} - going distance 2026`)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── COL 3: Right panel — text gets exit style, images do NOT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              {/* Description text — exit style */}
              {vis(cfg, 'description') && (
                <div style={{ ...fadeIn(progress, 0.15, 0.48), ...exitStyle }}>
                  <p style={{ fontSize: fsize(cfg,'description',12), lineHeight: 1.75, color: clr(cfg,'description','#777'), fontFamily: 'Barlow,sans-serif', margin: 0, whiteSpace: 'pre-line' }}>
                    {txt(cfg, 'description', 'Where Elegance Meets\nSustainability Luxury\nMade Accessible')}
                  </p>
                </div>
              )}
              {/* Slot 2 thumb image — NO exit style, NO fadeIn, FIX parallax gap */}
              {vis(cfg, 'thumb_image') && (
                <div style={{ flexShrink: 0 }}>
                  <div
                    onClick={() => p2?.slug && router.push(`/product/${p2.slug}`)}
                    style={{ width: 72, height: 88, overflow: 'hidden', position: 'relative', background: clr(cfg,'thumb_image','#c8c0b8'), cursor: p2?.slug ? 'pointer' : 'default' }}
                  >
                    {/* FIX: start at top:-20% so parallax downward motion fills top gap */}
                    <div style={{ position: 'absolute', top: '-20%', left: 0, right: 0, height: '140%', transform: `translateY(${parallax2}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                      {img2Src
                        ? <Image src={img2Src} alt={p2?.name ?? ''} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#b8c0a8,#909880)' }} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Price 1 — exit style */}
            {vis(cfg, 'price1') && (
              <div style={{ ...fadeIn(progress, 0.22, 0.52), ...exitStyle, textAlign: 'right', marginTop: 8 }}>
                <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: `clamp(24px,3vw,${fsize(cfg,'price1',38)}px)`, color: clr(cfg,'price1','#0d0d0d'), letterSpacing: '-0.5px' }}>{p1Price}</span>
              </div>
            )}
            <div style={{ height: 1, background: '#e0e0dd', margin: '20px 0' }} />
            <div>
              {/* Slot 3 product2 image — clickable, NO exit style */}
              {vis(cfg, 'product2_img') && (
                <div
                  onClick={() => p3?.slug && router.push(`/product/${p3.slug}`)}
                  style={{ width: '76%', height: 194, clipPath: 'polygon(2% 2%,82% 2%,96% 44%,96% 96%,15% 96%,2% 52%)', overflow: 'hidden', position: 'relative', background: clr(cfg,'product2_img','#4a4040'), cursor: p3?.slug ? 'pointer' : 'default' }}
                >
                  <div style={{ position: 'absolute', top: '-20%', left: 0, right: 0, height: '150%', transform: `translateY(${parallax3}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                    {img3Src
                      ? <Image src={img3Src} alt={p3?.name ?? 'Product 2'} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                      : <div style={{ width: '100%', height: '100%', background: clr(cfg,'product2_img','#3a3030'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif' }}>PRODUCT 2</span></div>}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.22))', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}
              {/* Caption 2 — exit style */}
              {vis(cfg, 'caption2') && (
                <div style={{ ...fadeIn(progress, 0.30, 0.62), ...exitStyle }}>
                  <p style={{ fontSize: fsize(cfg,'caption2',11), color: clr(cfg,'caption2','#aaa'), letterSpacing: '0.5px', fontFamily: 'Barlow,sans-serif', fontStyle: 'italic', margin: '10px 0 4px' }}>
                    {txt(cfg, 'caption2', `©${p3?.name ?? 'International'} - just do it 2026`)}
                  </p>
                </div>
              )}
              {/* Price 2 — exit style */}
              {vis(cfg, 'price2') && (
                <div style={{ ...exitStyle, textAlign: 'right' }}>
                  <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: `clamp(24px,3vw,${fsize(cfg,'price2',38)}px)`, color: clr(cfg,'price2','#0d0d0d'), letterSpacing: '-0.5px' }}>{p3Display}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#e0e0dd' }} />
    </section>
  )
}
