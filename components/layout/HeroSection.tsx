'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeroModelParallax from './HeroModelParallax'
import type { SiteSettings } from '@/types'
import { buildPageHelper } from '@/lib/pageConfig'
import { HERO_DEFAULTS } from '@/lib/pageDefaults'
import { getScrollTransitionConfig, scrollExitStyle } from '@/lib/useScrollTransition'
import { clampedParallax } from '@/lib/useScrollAnimation'
import { useViewportKind } from '@/lib/useBreakpoint'

interface HeroElement {
  id: string; visible: boolean; x: number; y: number
  fontSize?: number; color?: string; content?: string; type?: string
}
interface HeroConfig { elements: HeroElement[]; bgColor: string; accentColor: string }
interface Props { settings: SiteSettings | null }

export default function HeroSection({ settings }: Props) {
  const [scrollY, setScrollY] = useState(0)
  const viewport = useViewportKind()

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pageCfg = buildPageHelper(settings, 'hero')
  const txCfg = getScrollTransitionConfig(settings)

  // scrollY for hero = window.scrollY (section starts at top)
  const exitStyle = scrollExitStyle(scrollY, txCfg)

  const merged: HeroConfig = { bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: HERO_DEFAULTS as any[] }
  if (settings?.page_configs) {
    try {
      const pc = JSON.parse(settings.page_configs)
      const pg = (viewport === 'mobile' ? pc?._mobileConfigs?.hero : viewport === 'tablet' ? pc?._tabletConfigs?.hero : null) ?? pc?.hero
      if (pg?.elements) {
        merged.elements = HERO_DEFAULTS.map((def: any) => {
          const saved = pg.elements.find((e: any) => e.id === def.id)
          return saved ? { ...def, ...saved } : def
        })
        merged.bgColor = pg.bgColor ?? '#f5f5f3'
        merged.accentColor = pg.accentColor ?? '#f04e0f'
      }
    } catch {}
  }

  const el = (id: string) => merged.elements.find(e => e.id === id)
  const vis = (id: string) => el(id)?.visible !== false

  const description = el('description')?.content
    || settings?.hero_description
    || 'Explore curated collections, exclusive drops and everyday essentials all thoughtfully designed in one stylish shopping destination.'

  const heroImageUrl = el('model_image')?.content?.startsWith('http')
    ? el('model_image')!.content!
    : pageCfg.imageUrl('model_image')

  const imgEl = el('model_image') as any
  const imgX      = imgEl?.x      ?? 33
  const imgY      = imgEl?.y      ?? 0
  const imgW      = imgEl?.width  ?? 34
  const imgH      = imgEl?.height ?? 100
  const imgZoom   = imgEl?.zoom   ?? 1
  const imgObjPos = imgEl?.objectPosition ?? 'top center'

  const pos = (id: string): React.CSSProperties => {
    const e = el(id)
    if (!e || e.visible === false) return { display: 'none' }
    return { position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, zIndex: 10 }
  }

  if (viewport !== 'desktop') {
    const isTablet = viewport === 'tablet'
    const headline = `${el('headline_left')?.content ?? 'where\n- style'}\n${el('headline_right')?.content ?? 'lives\n- now'}`
    const padX = isTablet ? 'clamp(32px,7vw,72px)' : '20px'
    const tabletParallax = clampedParallax(scrollY, 0.07, 36)

    // ── TABLET: unchanged original layout ──
    if (isTablet) {
      return (
        <section style={{ position: 'relative', background: merged.bgColor, overflow: 'hidden', borderBottom: '1px solid #e0e0dd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.86fr) minmax(280px,1.14fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center', minHeight: 'clamp(520px,74vh,760px)', padding: `clamp(72px,10vh,118px) ${padX} clamp(56px,8vh,92px)` }}>
            <div style={{ ...exitStyle, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {vis('tag_left') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: el('tag_left')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif' }}>
                    {el('tag_left')?.content ?? '//FASHION SS 2026'}
                  </span>
                  <span style={{ flex: 1, maxWidth: 82, height: 1, background: '#d0d0cc' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '3px', color: merged.accentColor, fontFamily: 'Barlow,sans-serif' }}>SS 2026</span>
                </div>
              )}
              {(vis('headline_left') || vis('headline_right')) && (
                <h1 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(72px,10vw,118px)', lineHeight: 0.9, letterSpacing: 0, textTransform: 'lowercase', color: el('headline_left')?.color ?? '#0d0d0d', whiteSpace: 'pre-line', maxWidth: 440, margin: 0 }}>
                  {headline}
                </h1>
              )}
              {vis('description') && (
                <p style={{ fontSize: 15, lineHeight: 1.75, color: el('description')?.color ?? '#555', fontFamily: 'Barlow,sans-serif', maxWidth: 360, margin: 0 }}>
                  {description}
                </p>
              )}
              {vis('new_drop') && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                  <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 999, padding: '11px 24px', fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif', whiteSpace: 'nowrap' }}>Shop Now</Link>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa' }}><span style={{ width: 7, height: 7, borderRadius: 999, background: merged.accentColor }} />{el('new_drop')?.content ?? 'Collection 2026'}</span>
                </div>
              )}
            </div>
            <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '0 4% 0 0', background: heroImageUrl ? 'transparent' : (imgEl?.color ?? '#e2e2de'), overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', left: 0, right: 0, height: '122%', transform: `translateY(${tabletParallax}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
                  {heroImageUrl ? <Image src={heroImageUrl} alt="Hero model" fill priority sizes="50vw" style={{ objectFit: 'cover', objectPosition: imgObjPos, transform: imgZoom !== 1 ? `scale(${imgZoom})` : undefined, transformOrigin: 'center top' }} /> : null}
                </div>
              </div>
              {vis('orange_star') && <div className="animate-spin-slow" style={{ ...exitStyle, position: 'absolute', left: '2%', top: '62%', color: el('orange_star')?.color ?? merged.accentColor, fontSize: 34, lineHeight: 1 }}>{el('orange_star')?.content ?? '*'}</div>}
              {vis('tag_right') && <p style={{ ...exitStyle, position: 'absolute', right: 0, top: '23%', maxWidth: 160, fontSize: 34, lineHeight: 1.15, color: el('tag_right')?.color ?? '#aaa', fontWeight: 800, letterSpacing: '5px', textTransform: 'uppercase', fontFamily: '"Barlow Condensed",sans-serif', margin: 0 }}>{el('tag_right')?.content ?? 'Styled For Life.'}</p>}
              {vis('stat') && <div style={{ ...exitStyle, position: 'absolute', right: '2%', bottom: '6%', textAlign: 'right' }}><p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontSize: 86, lineHeight: 0.85, fontWeight: 900, margin: 0 }}>{el('stat')?.content ?? '280K'}</p>{vis('stat_label') && <p style={{ marginTop: 8, fontSize: 10, letterSpacing: '3px', color: el('stat_label')?.color ?? '#aaa' }}>{el('stat_label')?.content ?? 'PEOPLE WE INSPIRE'}</p>}</div>}
            </div>
          </div>
        </section>
      )
    }

    // Mobile: scroll outro on content, parallax-only image.
    // Hero is at top so scrollY drives all effects directly (no sectionProgress needed)
    const mobileParallax = clampedParallax(scrollY, 0.06, 34)
    // fadeIn for text zones based on how far scrollY is (they start visible, exit on scroll)
    const mobileExitStyle = scrollExitStyle(scrollY, txCfg)
    return (
      <section style={{ position: 'relative', background: merged.bgColor, overflow: 'hidden', borderBottom: '1px solid #e0e0dd', minHeight: '100svh' }}>
        {/* Guide lines (decorative, like desktop) */}
        <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '67%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.04)', pointerEvents: 'none' }} />

        {/* Zone 1 — top text — exit style on scroll */}
        <div style={{ ...mobileExitStyle, position: 'relative', zIndex: 10, padding: `68px ${padX} 0` }}>
          {vis('tag_left') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: el('tag_left')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif' }}>
                {el('tag_left')?.content ?? '//FASHION · SS 2026'}
              </span>
              <span style={{ width: 24, height: 1, background: '#d0d0cc', flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '2px', color: merged.accentColor, fontFamily: 'Barlow,sans-serif', flexShrink: 0 }}>SS 2026</span>
            </div>
          )}
          {(vis('headline_left') || vis('headline_right')) && (
            <h1 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(64px,20vw,96px)', lineHeight: 0.88, letterSpacing: '-0.5px', textTransform: 'lowercase', color: el('headline_left')?.color ?? '#0d0d0d', whiteSpace: 'pre-line', margin: '0 0 22px' }}>
              {headline}
            </h1>
          )}
        </div>

        {/* Zone 2 — full-width hero image — parallax (image does NOT get exitStyle) */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', maxHeight: '62svh', overflow: 'hidden', background: heroImageUrl ? 'transparent' : (imgEl?.color ?? '#e2e2de') }}>
          {/* Parallax inner wrapper */}
          <div style={{ position: 'absolute', top: '-12%', left: 0, right: 0, height: '124%', transform: `translateY(${mobileParallax}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
            {heroImageUrl ? (
              <Image src={heroImageUrl} alt="Hero model" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: imgObjPos, transform: imgZoom !== 1 ? `scale(${imgZoom})` : undefined, transformOrigin: 'center top' }} />
            ) : null}
          </div>
          {/* Stat — overlaid bottom-right like desktop */}
          {vis('stat') && (
            <div style={{ ...mobileExitStyle, position: 'absolute', right: padX, bottom: 14, textAlign: 'right', zIndex: 2 }}>
              <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontSize: 'clamp(52px,17vw,76px)', lineHeight: 0.85, fontWeight: 900, margin: 0, color: el('stat')?.color ?? '#0d0d0d' }}>
                {el('stat')?.content ?? '280K'}
              </p>
              {vis('stat_label') && (
                <p style={{ marginTop: 6, fontSize: 8, letterSpacing: '2.5px', textTransform: 'uppercase', color: el('stat_label')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif' }}>
                  {el('stat_label')?.content ?? 'PEOPLE WE INSPIRE'}
                </p>
              )}
            </div>
          )}
          {/* Orange star — bottom-left like desktop */}
          {vis('orange_star') && (
            <div className="animate-spin-slow" style={{ ...mobileExitStyle, position: 'absolute', left: padX, bottom: '18%', color: el('orange_star')?.color ?? merged.accentColor, fontSize: 36, lineHeight: 1, zIndex: 2 }}>
              {el('orange_star')?.content ?? '✦'}
            </div>
          )}
          {/* Styled For Life tag — top-right like desktop */}
          {vis('tag_right') && (
            <p style={{ ...mobileExitStyle, position: 'absolute', right: padX, top: 14, maxWidth: 90, fontSize: 18, lineHeight: 1.1, color: el('tag_right')?.color ?? '#aaa', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: '"Barlow Condensed",sans-serif', margin: 0, textAlign: 'right', zIndex: 2 }}>
              {el('tag_right')?.content ?? 'Styled For Life.'}
            </p>
          )}
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom,transparent,${merged.bgColor})`, pointerEvents: 'none', zIndex: 1 }} />
        </div>

        {/* Zone 3 — description + cta — exit style on scroll */}
        <div style={{ ...mobileExitStyle, position: 'relative', zIndex: 10, padding: `20px ${padX} 52px` }}>
          {vis('description') && (
            <p style={{ fontSize: 13, lineHeight: 1.8, color: el('description')?.color ?? '#555', fontFamily: 'Barlow,sans-serif', maxWidth: 340, margin: '0 0 24px' }}>
              {description}
            </p>
          )}
          {vis('new_drop') && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, gap: 8, border: '1.5px solid #0d0d0d', borderRadius: 999, padding: '10px 22px', fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif', whiteSpace: 'nowrap' }}>
                Shop Now →
              </Link>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: merged.accentColor, flexShrink: 0 }} />
                {el('new_drop')?.content ?? 'Collection 2026'}
              </span>
            </div>
          )}
          {/* EST rule — decorative like desktop */}
          {vis('est_rule') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, opacity: 0.4 }}>
              <div style={{ width: 32, height: 1, background: '#0d0d0d' }} />
              <span style={{ fontSize: 8, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>EST. 2026</span>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <>
      <section style={{ position: 'relative', minHeight: '100vh', background: merged.bgColor, overflow: 'hidden', paddingTop: 100 }}>
        <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.05)', pointerEvents: 'none' }} />

        {/* Image — no exit style */}
        <HeroModelParallax imageUrl={heroImageUrl} bgColor={merged.bgColor === '#f5f5f3' ? '#e2e2de' : merged.bgColor} x={imgX} y={imgY} width={imgW} height={imgH} zoom={imgZoom} objectPosition={imgObjPos} />

        {/* ── All text elements wrapped with exitStyle ── */}
        <div style={{ ...exitStyle, position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>

          {vis('tag_left') && (
            <div style={{ ...pos('tag_left'), pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: el('tag_left')?.fontSize ?? 10, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: el('tag_left')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif' }}>
                {el('tag_left')?.content ?? '//FASHION · SS 2026'}
              </span>
              <div style={{ width: 24, height: 1, background: '#ccc' }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: merged.accentColor, fontFamily: 'Barlow, sans-serif' }}>SS 2026</span>
            </div>
          )}

          {vis('headline_left') && (
            <div style={{ ...pos('headline_left'), maxWidth: '30%', pointerEvents: 'auto' }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: `clamp(52px, ${(el('headline_left')?.fontSize ?? 108) * 0.09}vw, ${el('headline_left')?.fontSize ?? 108}px)`, lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'lowercase', color: el('headline_left')?.color ?? '#0d0d0d', whiteSpace: 'pre-line' }}>
                {(el('headline_left')?.content ?? 'where\n- style').split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
              </div>
            </div>
          )}

          {vis('est_rule') && (
            <div style={{ ...pos('est_rule'), pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 1, background: '#0d0d0d' }} />
              <span style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>EST. 2026</span>
            </div>
          )}

          {vis('description') && (
            <div style={{ ...pos('description'), maxWidth: '28%', pointerEvents: 'auto' }}>
              <p style={{ fontSize: el('description')?.fontSize ?? 12, lineHeight: 1.8, color: el('description')?.color ?? '#555', fontFamily: 'Barlow, sans-serif', margin: 0 }}>{description}</p>
            </div>
          )}

          {vis('product_card') && (
            <Link href="/shop" style={{ ...pos('product_card'), textDecoration: 'none', pointerEvents: 'auto', background: '#fff', border: '1px solid #e8e8e5', borderRadius: 14, padding: '14px 18px', width: 172, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', fontFamily: 'Barlow, sans-serif', display: 'block', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Featured Drop</p>
              <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: el('product_card')?.fontSize ?? 15, lineHeight: 1.2, marginBottom: 10, color: el('product_card')?.color ?? '#0d0d0d' }}>{el('product_card')?.content ?? 'Cargo Oversized Jacket'}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22, color: '#0d0d0d' }}>₹3,499</span>
                <span style={{ fontSize: 9, background: merged.accentColor, color: '#fff', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>-20%</span>
              </div>
            </Link>
          )}

          {vis('new_drop') && (
            <div style={{ ...pos('new_drop'), pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: merged.accentColor }} />
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>New Drop</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', fontFamily: 'Barlow, sans-serif', marginBottom: 10 }}>{el('new_drop')?.content ?? 'Collection 2026'}</p>
              <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '7px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow, sans-serif' }}>Shop Now →</Link>
            </div>
          )}

          {vis('tag_right') && (
            <div style={{ ...pos('tag_right'), pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: el('tag_right')?.fontSize ?? 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: el('tag_right')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif' }}>{el('tag_right')?.content ?? 'Styled For Life.'}</span>
              <div style={{ width: 24, height: 1, background: '#ccc' }} />
            </div>
          )}

          {vis('headline_right') && (
            <div style={{ ...pos('headline_right'), maxWidth: '32%', textAlign: 'right', pointerEvents: 'auto' }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: `clamp(52px, ${(el('headline_right')?.fontSize ?? 108) * 0.09}vw, ${el('headline_right')?.fontSize ?? 108}px)`, lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'lowercase', color: el('headline_right')?.color ?? '#0d0d0d', whiteSpace: 'pre-line' }}>
                {(el('headline_right')?.content ?? 'lives\n- now').split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
              </div>
            </div>
          )}

          {vis('avatars') && (
            <div style={{ ...pos('avatars'), pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {['J','A'].map((l, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: '#c8c8c6', border: '2px solid ' + merged.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#555', marginLeft: i === 0 ? 0 : -8 }}>{l}</div>
              ))}
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: merged.accentColor, border: '2px solid ' + merged.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', marginLeft: -8 }}>+</div>
            </div>
          )}

          {vis('orange_star') && (
            <div style={{ ...pos('orange_star'), fontSize: el('orange_star')?.fontSize ?? 22, color: el('orange_star')?.color ?? merged.accentColor, pointerEvents: 'auto' }} className="animate-spin-slow">✦</div>
          )}

          {vis('stat') && (
            <div style={{ ...pos('stat'), textAlign: 'right', pointerEvents: 'auto' }}>
              <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: el('stat')?.fontSize ?? 64, lineHeight: 1, margin: 0, color: el('stat')?.color ?? '#0d0d0d' }}>{el('stat')?.content ?? '280K'}</p>
            </div>
          )}

          {vis('stat_label') && (
            <div style={{ ...pos('stat_label'), textAlign: 'right', pointerEvents: 'auto' }}>
              <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: el('stat_label')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif', margin: 0 }}>{el('stat_label')?.content ?? 'PEOPLE WE INSPIRE'}</p>
            </div>
          )}

          {vis('scroll_ind') && (
            <div style={{ ...pos('scroll_ind'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.3, pointerEvents: 'none' }}>
              <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, #0d0d0d)' }} />
              <span style={{ fontSize: 8, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, writingMode: 'vertical-rl', fontFamily: 'Barlow, sans-serif' }}>Scroll</span>
            </div>
          )}

        </div>{/* end exitStyle wrapper */}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#e0e0dd' }} />
      </section>
    </>
  )
}
