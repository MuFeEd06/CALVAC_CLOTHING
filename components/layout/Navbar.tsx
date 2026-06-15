'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import CartDrawer from './CartDrawer'
import type { SiteSettings } from '@/types'

interface Props { settings?: SiteSettings | null }
interface CatItem { id: string; name: string; visible: boolean; imageUrl: string; count: number; fontSize: number; color: string }

const DEFAULT_LINKS = [
  { href: '/shop',                      label: 'Shop' },
  { href: '/shop?category=jackets',     label: 'Jackets' },
  { href: '/shop?category=tees',        label: 'Tees' },
  { href: '/shop?category=pants',       label: 'Pants' },
  { href: '/shop?category=accessories', label: 'Accessories' },
  { href: '/contact',                   label: 'Contact' },
]

export default function Navbar({ settings }: Props) {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [cartOpen, setCartOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems } = useCart()
  const router = useRouter()

  const announcement = settings?.announcement_text ?? ''
  const ANNOUNCE_H   = announcement ? 36 : 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = (() => {
    try {
      const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
      const items: CatItem[] = pc?._categoryItems
      if (Array.isArray(items) && items.length > 0) {
        const cats = items.filter(c => c.visible !== false).map(c => ({
          href: `/shop?category=${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`,
          label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        }))
        return [{ href: '/shop', label: 'Shop' }, ...cats, { href: '/contact', label: 'Contact' }]
      }
    } catch {}
    return DEFAULT_LINKS
  })()

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  const btnBase: React.CSSProperties = {
    border: '1.5px solid #0d0d0d', borderRadius: '50%',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.2s', position: 'relative', flexShrink: 0,
    fontFamily: 'var(--font-barlow), Barlow, sans-serif',
  }

  return (
    <>
      {/* ── Announcement bar ── */}
      {announcement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          height: ANNOUNCE_H, background: '#0d0d0d', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, letterSpacing: '3px', fontWeight: 600,
          textTransform: 'uppercase', fontFamily: 'Barlow, sans-serif',
          padding: '0 16px', textAlign: 'center',
        }}>{announcement}</div>
      )}

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: ANNOUNCE_H, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        /* mobile: 14px 16px, desktop: 18px 48px */
        padding: 'clamp(14px,2vw,18px) clamp(16px,3.5vw,48px)',
        background: scrolled ? 'rgba(245,245,243,0.96)' : '#f5f5f3',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
        fontFamily: 'var(--font-barlow), Barlow, sans-serif',
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          style={{ ...btnBase, width: 'clamp(36px,5vw,40px)', height: 'clamp(36px,5vw,40px)' }}
          aria-label="Menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#0d0d0d' }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#0d0d0d' }} />
          </div>
        </button>

        {/* Logo */}
        <Link href="/" style={{
          fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
          fontWeight: 700, fontSize: 'clamp(18px,3vw,22px)', letterSpacing: '6px',
          textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d',
        }}>CALVAC</Link>

        {/* Right icons */}
        <div style={{ display: 'flex', gap: 'clamp(6px,1.5vw,12px)', alignItems: 'center' }}>
          {/* Search — hide on very small screens */}
          <button
            onClick={() => setSearchOpen(open => !open)}
            style={{ ...btnBase, width: 'clamp(34px,4.5vw,40px)', height: 'clamp(34px,4.5vw,40px)', display: 'none' }}
            className="sm-search-btn"
            aria-label="Search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            style={{ ...btnBase, width: 'clamp(34px,4.5vw,40px)', height: 'clamp(34px,4.5vw,40px)' }}
            aria-label="Cart"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 17, height: 17, background: '#f04e0f', color: '#fff',
                fontSize: 9, fontWeight: 700, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Account */}
          <Link href="/account" style={{ textDecoration: 'none' }}>
            <button
              style={{ ...btnBase, width: 'clamp(34px,4.5vw,40px)', height: 'clamp(34px,4.5vw,40px)' }}
              aria-label="Account"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <form
          onSubmit={submitSearch}
          style={{
            position: 'fixed',
            top: `calc(${ANNOUNCE_H}px + 68px)`,
            right: 'clamp(16px,3.5vw,48px)',
            zIndex: 57,
            width: 'min(360px, calc(100vw - 32px))',
            background: '#f5f5f3',
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.12)',
            padding: 10,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 8,
          }}
        >
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products"
            style={{
              minWidth: 0,
              border: '1px solid #d8d8d4',
              background: '#fff',
              padding: '10px 12px',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'Barlow,sans-serif',
            }}
          />
          <button type="submit" style={{ border: 'none', background: '#0d0d0d', color: '#fff', padding: '0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Barlow,sans-serif' }}>
            Search
          </button>
        </form>
      )}

      {/* ── Backdrop ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 58,
          background: 'rgba(0,0,0,0.45)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* ── Side drawer ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 59,
        /* full-width on tiny phones, 320px otherwise */
        width: 'min(320px, 85vw)',
        background: '#0d0d0d',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        boxShadow: menuOpen ? '8px 0 40px rgba(0,0,0,0.4)' : 'none',
        fontFamily: 'var(--font-barlow), Barlow, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 18px' }}>
          <span style={{ fontFamily: 'var(--font-barlow-condensed),"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '6px', color: '#fff', textTransform: 'uppercase' }}>
            CALVAC
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ width: 36, height: 36, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '50%', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}
          >✕</button>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 24px' }} />

        <form onSubmit={submitSearch} style={{ padding: '18px 24px 10px' }}>
          <label style={{ display: 'block', fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
            Search
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 42px', border: '1px solid rgba(255,255,255,0.14)' }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Jacket, tee, cargo"
              style={{ minWidth: 0, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 13px', fontSize: 13, outline: 'none', fontFamily: 'Barlow,sans-serif' }}
            />
            <button type="submit" aria-label="Search products" style={{ border: 'none', borderLeft: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>
              →
            </button>
          </div>
        </form>

        <nav style={{ padding: '8px 0', flex: 1 }}>
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', padding: '13px 24px',
                fontFamily: i === 0
                  ? 'var(--font-barlow),Barlow,sans-serif'
                  : 'var(--font-barlow-condensed),"Barlow Condensed",sans-serif',
                fontWeight: i === 0 ? 500 : 700,
                fontSize: i === 0 ? 12 : 'clamp(22px,5vw,28px)',
                letterSpacing: i === 0 ? '3px' : '-0.5px',
                textTransform: i === 0 ? 'uppercase' : 'lowercase',
                textDecoration: 'none',
                color: i === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                transition: 'color 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >{link.label}</Link>
          ))}

          {/* Extra links in drawer */}
          <Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 24px', fontSize: 12, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            My Account
          </Link>
        </nav>

        <div style={{ padding: '16px 24px 28px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
            © 2026 CALVAC
          </p>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        @media (min-width: 480px) { .sm-search-btn { display: flex !important; } }
      `}</style>
    </>
  )
}
