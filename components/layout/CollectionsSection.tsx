'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, SiteSettings } from '@/types'
import { getCollectionHref } from '@/lib/collections'
import { mergeDeviceConfig, vis, txt, imgUrl, clr, fsize } from '@/lib/useMergedConfig'
import { clampedParallax, imageIntroStyle, usePrefersReducedMotion } from '@/lib/useScrollAnimation'
import { useViewportKind } from '@/lib/useBreakpoint'
import { getParallaxSpeed } from '@/lib/siteSettings'
import { getOptimizedProductImageUrl } from '@/lib/productImages'

interface Props { products: Product[]; settings?: SiteSettings | null }

const DEFAULTS = [
  { id: 'intro',      visible: true, x: 5,  y: 3,  fontSize: 12, color: '#777777', content: 'From enduring classics to daring statement pieces, our collections are crafted with intention.' },
  { id: 'model_image',visible: true, x: 1,  y: 12, width: 38, height: 55, isImage: true, color: '#d8d4cc', imageUrl: '', fontSize: 14 },
  { id: 'caption',    visible: true, x: 1,  y: 70, fontSize: 11, color: '#aaaaaa', content: 'Being Part Of Our Journey.' },
  { id: 'feat_title', visible: true, x: 46, y: 4,  fontSize: 34, color: '#0d0d0d', content: 'Statement Pieces 2025' },
  { id: 'feat_desc',  visible: true, x: 46, y: 16, fontSize: 12, color: '#888888', content: 'Your go-to wardrobe staples, crafted for comfort and effortless style.' },
  { id: 'feat_btn',   visible: true, x: 46, y: 26, fontSize: 10, color: '#0d0d0d', content: 'GET STARTED' },
  { id: 'featured_img',visible:true, x: 82, y: 4,  width: 14, height: 22, isImage: true, color: '#b8c8b8', imageUrl: '', fontSize: 14 },
  { id: 'col1',       visible: true, x: 46, y: 42, fontSize: 30, color: '#555555', content: 'Everyday Essentials 2026' },
  { id: 'col2',       visible: true, x: 46, y: 58, fontSize: 30, color: '#555555', content: 'Timeless Classics 2026' },
  { id: 'col3',       visible: true, x: 46, y: 74, fontSize: 30, color: '#555555', content: 'Seasonal Collections 2025' },
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
      setProgress(Math.min(1, Math.max(0, (wH * 0.88 - rect.top) / (wH * 0.6))))
      setScrollY(Math.max(0, -rect.top))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    setTimeout(onScroll, 50)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return { ref, progress, scrollY }
}

export default function CollectionsSection({ products, settings }: Props) {
  const { ref, progress, scrollY } = useSectionProgress()
  const prefersReducedMotion = usePrefersReducedMotion()
  const viewport = useViewportKind()
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const cfg = mergeDeviceConfig(settings ?? null, 'collections', DEFAULTS, viewport)
  const parallaxSpeed = getParallaxSpeed(settings ?? null)

  const parallax1 = (scrollY * 0.16 * parallaxSpeed).toFixed(1)
  const mobileParallax1 = clampedParallax(scrollY, 0.06 * parallaxSpeed, 34 * parallaxSpeed)
  const mobileParallax2 = clampedParallax(scrollY, 0.035 * parallaxSpeed, 16 * parallaxSpeed)
  const tabletParallax1 = clampedParallax(scrollY, 0.07 * parallaxSpeed, 36 * parallaxSpeed)
  const tabletParallax2 = clampedParallax(scrollY, 0.04 * parallaxSpeed, 18 * parallaxSpeed)
  const imageIntro = (start: number, end: number) => imageIntroStyle(progress, start, end, prefersReducedMotion)
  const img1 = getOptimizedProductImageUrl(imgUrl(cfg, 'model_image') || products[0]?.images?.[0] || '', { width: 900 })
  const featuredImg = getOptimizedProductImageUrl(imgUrl(cfg, 'featured_img') || products[2]?.images?.[0] || '', { width: 320 })
  const collectionRows = [
    { id: 'col1', def: 'Everyday Essentials 2026' },
    { id: 'col2', def: 'Timeless Classics 2026' },
    { id: 'col3', def: 'Seasonal Collections 2025' },
  ]

  if (viewport !== 'desktop') {
    const isTablet = viewport === 'tablet'

    // ── TABLET: unchanged original layout ──
    if (isTablet) {
      return (
        <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '72px clamp(32px,6vw,72px) 84px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,0.72fr) minmax(0,1.28fr)', gap: 'clamp(32px,5vw,68px)', alignItems: 'start' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 22 }}>
              {vis(cfg,'intro') && <p style={{ fontSize: 16, lineHeight: 1.85, color: clr(cfg,'intro','#777'), fontFamily: 'Barlow,sans-serif', margin: 0, textAlign: 'center' }}>{txt(cfg,'intro','From enduring classics to daring statement pieces, our collections are crafted with intention.')}</p>}
              {vis(cfg,'model_image') && (
                <div>
                  <div style={{ ...imageIntro(0.05, 0.38), position: 'relative', aspectRatio: '4 / 5.4', overflow: 'hidden', background: clr(cfg,'model_image','#d8d4cc'), clipPath: 'polygon(18% 0%,100% 0%,100% 20%,76% 20%,100% 46%,100% 82%,70% 100%,18% 100%,0% 82%,28% 65%,0% 46%,0% 20%)' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: 0, right: 0, height: '122%', transform: `translateY(${tabletParallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                      {img1 ? <Image src={img1} alt="Collection" fill sizes="30vw" style={{ objectFit: 'cover', objectPosition: 'top center' }} /> : null}
                    </div>
                  </div>
                  {vis(cfg,'caption') && <p style={{ margin: '14px 0 0', fontSize: 13, color: clr(cfg,'caption','#aaa'), fontStyle: 'italic', lineHeight: 1.6 }}>{txt(cfg,'caption','Being Part Of Our Journey.')}</p>}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 132px', gap: 24, alignItems: 'start', paddingBottom: 28, borderBottom: '1px solid #e8e8e5' }}>
                <div>
                  <h3 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(46px,6vw,72px)', lineHeight: 0.98, color: clr(cfg,'feat_title','#0d0d0d'), margin: '0 0 16px', letterSpacing: 0 }}>{txt(cfg,'feat_title','Statement Pieces 2025')}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.75, color: clr(cfg,'feat_desc','#888'), fontFamily: 'Barlow,sans-serif', margin: '0 0 22px', maxWidth: 330 }}>{txt(cfg,'feat_desc','Your go-to wardrobe staples, crafted for comfort and effortless style.')}</p>
                  {vis(cfg,'feat_btn') && <Link href="/shop" style={{ display: 'inline-flex', minHeight: 44, alignItems: 'center', gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 999, padding: '11px 24px', fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>{txt(cfg,'feat_btn','GET STARTED')} →</Link>}
                </div>
                <div style={{ ...imageIntro(0.1, 0.42), position: 'relative', aspectRatio: '1 / 1.08', overflow: 'hidden', background: clr(cfg,'featured_img','#b8c8b8'), clipPath: 'polygon(5% 5%,80% 5%,95% 35%,95% 95%,20% 95%,5% 65%)' }}>
                  <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, height: '116%', transform: `translateY(${tabletParallax2}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                    {featuredImg ? <Image src={featuredImg} alt="Featured" fill sizes="132px" style={{ objectFit: 'cover', objectPosition: 'top' }} /> : null}
                  </div>
                </div>
              </div>
              <div>
                {collectionRows.map((row, i) => vis(cfg, row.id) ? (
                  <Link key={row.id} href={getCollectionHref(row.id, txt(cfg, row.id, row.def))} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 44px', gap: 16, alignItems: 'center', minHeight: 92, padding: '18px 0', borderBottom: '1px solid #e8e8e5', textDecoration: 'none' }}>
                    <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(34px,4.8vw,54px)', lineHeight: 1, color: clr(cfg,row.id,'#555'), overflowWrap: 'anywhere' }}>{txt(cfg,row.id,row.def)}</span>
                    <span style={{ width: 44, height: 44, border: '1.5px solid #ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 15 }}>→</span>
                  </Link>
                ) : null)}
              </div>
            </div>
          </div>
        </section>
      )
    }

    // Mobile: stable text with image intro and safe parallax.
    return (
      <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '52px 0 68px' }}>

        {/* Intro text */}
        {vis(cfg,'intro') && (
          <div style={{ padding: '0 20px', marginBottom: 24 }}>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: clr(cfg,'intro','#777'), fontFamily: 'Barlow,sans-serif', margin: 0, maxWidth: 300, textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              {txt(cfg,'intro','From enduring classics to daring statement pieces, our collections are crafted with intention.')}
            </p>
          </div>
        )}

        {/* S-shape model image */}
        {vis(cfg,'model_image') && (
          <div style={{ ...imageIntro(0.04, 0.38), position: 'relative', marginBottom: 16 }}>
            <div style={{ clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)', position: 'relative', margin: '0 20px' }}>
              <div style={{ position: 'absolute', left: '5%', top: '2%', width: '92%', height: '96%', background: '#e4e1db', clipPath: 'polygon(0% 100%,0% 0%,25% 0%,50% 40%,75% 0%,100% 0%,100% 100%,80% 100%,80% 30%,50% 70%,20% 30%,20% 100%)', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 2, height: 'min(80vw,340px)', overflow: 'hidden', background: clr(cfg,'model_image','#d8d4cc') }}>
                <div style={{ position: 'absolute', top: '-12%', left: 0, right: 0, height: '124%', transform: `translateY(${mobileParallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                  {img1
                    ? <Image src={img1} alt="Collection" fill sizes="(max-width:768px) 92vw" style={{ objectFit: 'cover', objectPosition: 'top center' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#c8c4bc,#b0aca4)' }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.12))', pointerEvents: 'none' }} />
                </div>
                {/* White stripe at 65% like desktop */}
                <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 8, background: cfg.bgColor, zIndex: 3 }} />
              </div>
            </div>
            {vis(cfg,'caption') && (
              <p style={{ margin: '12px 20px 0', fontSize: 11, color: clr(cfg,'caption','#aaa'), fontFamily: 'Barlow,sans-serif', fontStyle: 'italic' }}>
                {txt(cfg,'caption','Being Part Of Our Journey.')}
              </p>
            )}
          </div>
        )}

        {/* Featured card */}
        <div style={{ padding: '0 20px', paddingBottom: 24, borderBottom: '1px solid #e8e8e5', marginBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px', gap: 16, alignItems: 'start' }}>
            <div>
              <h3 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(36px,12vw,54px)', lineHeight: 0.98, color: clr(cfg,'feat_title','#0d0d0d'), margin: '0 0 10px', letterSpacing: '-0.2px' }}>
                {txt(cfg,'feat_title','Statement Pieces 2025')}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: clr(cfg,'feat_desc','#888'), fontFamily: 'Barlow,sans-serif', margin: '0 0 16px' }}>
                {txt(cfg,'feat_desc','Your go-to wardrobe staples, crafted for comfort and effortless style.')}
              </p>
              {vis(cfg,'feat_btn') && (
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '8px 18px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>
                  {txt(cfg,'feat_btn','GET STARTED')} →
                </Link>
              )}
            </div>
            {/* Featured thumbnail — desktop polygon */}
            <div style={{ ...imageIntro(0.1, 0.44), position: 'relative', width: 88, height: 88, overflow: 'hidden', flexShrink: 0, background: clr(cfg,'featured_img','#b8c8b8'), clipPath: 'polygon(5% 5%,80% 5%,95% 35%,95% 95%,20% 95%,5% 65%)' }}>
              <div style={{ position: 'absolute', top: '-8%', left: 0, right: 0, height: '116%', transform: `translateY(${mobileParallax2}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                {featuredImg ? <Image src={featuredImg} alt="Featured" fill sizes="88px" style={{ objectFit: 'cover', objectPosition: 'top' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#b8c8b8,#90a090)' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* Collection rows */}
        <div style={{ padding: '0 20px' }}>
          {collectionRows.map((row, i) => (
            vis(cfg, row.id) ? (
              <Link key={i} href={getCollectionHref(row.id, txt(cfg, row.id, row.def))}
                onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e8e8e5', textDecoration: 'none', minHeight: 72, background: 'transparent' }}
              >
                <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(28px,8vw,42px)', lineHeight: 1, color: hoveredRow === i ? '#0d0d0d' : clr(cfg,row.id,'#555'), letterSpacing: '-0.2px', transition: 'color 0.2s,transform 0.2s', transform: hoveredRow === i ? 'translateX(4px)' : 'translateX(0)', overflowWrap: 'anywhere' }}>
                  {txt(cfg, row.id, row.def)}
                </span>
                <div style={{ width: 34, height: 34, border: `1.5px solid ${hoveredRow === i ? '#0d0d0d' : '#ddd'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', background: hoveredRow === i ? '#0d0d0d' : 'transparent', marginLeft: 12 }}>
                  <span style={{ color: hoveredRow === i ? '#fff' : '#bbb', fontSize: 13 }}>→</span>
                </div>
              </Link>
            ) : null
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} style={{ position: 'relative', background: cfg.bgColor, borderTop: '1px solid #e8e8e5', overflow: 'hidden', padding: '80px 52px 88px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '42fr 58fr', gap: '0 60px', alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {vis(cfg,'intro') && (
            <div>
              <p style={{ fontSize: fsize(cfg,'intro',12), lineHeight: 1.8, color: clr(cfg,'intro','#777'), fontFamily: 'Barlow,sans-serif', maxWidth: 220, marginBottom: 32, textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
                {txt(cfg,'intro','From enduring classics to daring statement pieces, our collections are crafted with intention.')}
              </p>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            {/* S-shape wrapper for image 1 */}
            <div style={{ clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '5%', top: '2%', width: '92%', height: '96%', background: '#e4e1db', clipPath: 'polygon(0% 100%,0% 0%,25% 0%,50% 40%,75% 0%,100% 0%,100% 100%,80% 100%,80% 30%,50% 70%,20% 30%,20% 100%)', zIndex: 0 }} />
              <div style={{ ...imageIntro(0.05, 0.42), position: 'relative', zIndex: 2 }}>
                <div style={{ position: 'relative', height: 380, overflow: 'hidden', background: clr(cfg,'model_image','#d8d4cc') }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '130%', transform: `translateY(${parallax1}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                    {img1 ? <Image src={img1} alt="Collection" fill style={{ objectFit: 'cover', objectPosition: 'top center' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#c8c4bc,#b0aca4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 10, color: 'rgba(0,0,0,0.25)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif' }}>MODEL IMAGE</span></div>}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.12))', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 10, background: cfg.bgColor, zIndex: 3 }} />
                </div>
              </div>
            </div>
            {vis(cfg,'caption') && (
              <div>
                <p style={{ marginTop: 14, fontSize: fsize(cfg,'caption',11), color: clr(cfg,'caption','#aaa'), fontFamily: 'Barlow,sans-serif', fontStyle: 'italic' }}>
                  {txt(cfg,'caption','Being Part Of Our Journey.')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {/* Featured card */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start', paddingBottom: 28, borderBottom: '1px solid #e8e8e5' }}>
              <div>
                <h3 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: `clamp(22px,2.8vw,${fsize(cfg,'feat_title',34)}px)`, color: clr(cfg,'feat_title','#0d0d0d'), margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                  {txt(cfg,'feat_title','Statement Pieces 2025')}
                </h3>
                <p style={{ fontSize: fsize(cfg,'feat_desc',12), lineHeight: 1.7, color: clr(cfg,'feat_desc','#888'), fontFamily: 'Barlow,sans-serif', marginBottom: 18, maxWidth: 260 }}>
                  {txt(cfg,'feat_desc','Your go-to wardrobe staples, crafted for comfort and effortless style.')}
                </p>
                {vis(cfg,'feat_btn') && (
                  <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '8px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#0d0d0d' }}>
                    {txt(cfg,'feat_btn','GET STARTED')} →
                  </Link>
                )}
              </div>
              <div style={{ ...imageIntro(0.1, 0.38), width: 120, height: 120, overflow: 'hidden', flexShrink: 0, background: clr(cfg,'featured_img','#b8c8b8'), position: 'relative', clipPath: 'polygon(5% 5%,80% 5%,95% 35%,95% 95%,20% 95%,5% 65%)' }}>
                {featuredImg ? <Image src={featuredImg} alt="Featured" fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#b8c8b8,#90a090)' }} />}
              </div>
            </div>
          </div>

          {/* Collection rows */}
          <div>
            {collectionRows.map((row, i) => (
              vis(cfg, row.id) ? (
                <Link key={i} href={getCollectionHref(row.id, txt(cfg, row.id, row.def))} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', borderBottom: '1px solid #e8e8e5', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s', background: hoveredRow === i ? 'rgba(0,0,0,0.015)' : 'transparent' }}>
                  <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: `clamp(20px,2.5vw,${fsize(cfg,row.id,30)}px)`, color: hoveredRow === i ? '#0d0d0d' : clr(cfg,row.id,'#555'), letterSpacing: '-0.3px', transition: 'color 0.2s,transform 0.2s', transform: hoveredRow === i ? 'translateX(6px)' : 'translateX(0)' }}>
                    {txt(cfg, row.id, row.def)}
                  </span>
                  <div style={{ width: 36, height: 36, border: `1.5px solid ${hoveredRow === i ? '#0d0d0d' : '#ddd'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', background: hoveredRow === i ? '#0d0d0d' : 'transparent' }}>
                    <span style={{ color: hoveredRow === i ? '#fff' : '#bbb', fontSize: 13 }}>→</span>
                  </div>
                </Link>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
