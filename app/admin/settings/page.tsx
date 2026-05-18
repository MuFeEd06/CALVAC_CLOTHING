'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Save, Eye, EyeOff, Move, RotateCcw, Layers,
  Image as ImageIcon, Monitor, Smartphone, Tablet, Settings, Bell, ChevronLeft,
} from 'lucide-react'
import {
  HERO_DEFAULTS, FEATURED_DEFAULTS, CATEGORIES_DEFAULTS,
  CAROUSEL_DEFAULTS, COLLECTIONS_DEFAULTS, FOOTER_DEFAULTS,
} from '@/lib/pageDefaults'

// ─── Types ────────────────────────────────────────────────────
type PageId = 'hero' | 'featured_moments' | 'categories' | 'carousel' | 'collections' | 'footer'
type Tab    = 'desktop' | 'tablet' | 'mobile' | 'store' | 'announcement'

// Mobile section IDs  (separate namespace so they don't collide with desktop)
type MobilePageId =
  | 'mobile_hero'
  | 'mobile_featured'
  | 'mobile_categories'
  | 'mobile_carousel'
  | 'mobile_collections'
  | 'mobile_footer'

interface PageElement {
  id: string; label: string; visible: boolean
  x: number; y: number
  fontSize?: number; color?: string; content?: string
  imageUrl?: string; width?: number; height?: number
  isImage?: boolean; type?: 'product_card' | 'avatars' | 'default'
  zoom?: number; objectPosition?: string
}

interface PageConfig {
  id: PageId; label: string; icon: string
  bgColor: string; accentColor: string
  elements: PageElement[]
}

interface MobileSectionConfig {
  id: MobilePageId; label: string; icon: string
  bgColor: string; accentColor: string
  elements: MobileElement[]
}

interface MobileElement {
  id: string; label: string; visible: boolean
  type: 'image' | 'text' | 'button' | 'color_block'
  content?: string; imageUrl?: string
  fontSize?: number; color?: string
  bgColor?: string; fullWidth?: boolean
  hint?: string   // small description shown in editor
}

interface CategoryItem {
  id: string; name: string; visible: boolean
  imageUrl: string; count: number; fontSize: number; color: string
}

// ─── Desktop page configs ─────────────────────────────────────
const DESKTOP_DEFAULTS: Record<PageId, PageConfig> = {
  hero:             { id: 'hero',             label: 'Hero Section',        icon: '①', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: HERO_DEFAULTS as any },
  featured_moments: { id: 'featured_moments', label: 'Featured Moments',    icon: '②', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: FEATURED_DEFAULTS as any },
  categories:       { id: 'categories',       label: 'Categories',          icon: '③', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: CATEGORIES_DEFAULTS as any },
  carousel:         { id: 'carousel',         label: 'Collection Carousel', icon: '④', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: CAROUSEL_DEFAULTS as any },
  collections:      { id: 'collections',      label: 'Collections',         icon: '⑤', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: COLLECTIONS_DEFAULTS as any },
  footer:           { id: 'footer',           label: 'Footer',              icon: '⑥', bgColor: '#0d0d0d', accentColor: '#f04e0f', elements: FOOTER_DEFAULTS as any },
}

// ─── Mobile section defaults ──────────────────────────────────
// Each section maps to what is actually rendered on a 390px-wide phone screen.
// Elements are stacked vertically — no drag positioning, just ordered list.
const MOBILE_SECTION_DEFAULTS: Record<MobilePageId, MobileSectionConfig> = {
  mobile_hero: {
    id: 'mobile_hero', label: 'Hero', icon: '①', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mh_tag',        label: '//Fashion Tag',    visible: true, type: 'text',        content: '//FASHION · SS 2026', fontSize: 9,  color: '#aaaaaa' },
      { id: 'mh_headline',   label: 'Headline',         visible: true, type: 'text',        content: 'where\n- style\nlives\n- now', fontSize: 72, color: '#0d0d0d' },
      { id: 'mh_model',      label: 'Hero Image',       visible: true, type: 'image',       imageUrl: '', color: '#e2e2de', hint: 'Full-width hero image shown below headline on mobile' },
      { id: 'mh_description',label: 'Description',      visible: true, type: 'text',        content: 'Explore curated collections, exclusive drops and everyday essentials.', fontSize: 13, color: '#555555' },
      { id: 'mh_cta',        label: 'Shop Now Button',  visible: true, type: 'button',      content: 'Shop Now →', color: '#0d0d0d' },
      { id: 'mh_stat',       label: 'Stat Block',       visible: true, type: 'text',        content: '280K', fontSize: 52, color: '#0d0d0d' },
      { id: 'mh_stat_label', label: 'Stat Label',       visible: true, type: 'text',        content: 'PEOPLE WE INSPIRE', fontSize: 9, color: '#aaaaaa' },
    ],
  },
  mobile_featured: {
    id: 'mobile_featured', label: 'Featured', icon: '②', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mf_headline',   label: 'Headline',         visible: true, type: 'text',   content: 'All - about\nmoments ©26', fontSize: 52, color: '#0d0d0d' },
      { id: 'mf_main_img',   label: 'Main Product Image',visible: true,type: 'image',  imageUrl: '', color: '#c8b890', hint: 'Primary featured product image' },
      { id: 'mf_caption1',   label: 'Caption 1',        visible: true, type: 'text',   content: '©International — going distance 2026', fontSize: 11, color: '#aaaaaa' },
      { id: 'mf_price1',     label: 'Price 1',          visible: true, type: 'text',   content: '($120)', fontSize: 36, color: '#0d0d0d' },
      { id: 'mf_prod2_img',  label: 'Product 2 Image',  visible: true, type: 'image',  imageUrl: '', color: '#5a5050', hint: 'Second featured product image' },
      { id: 'mf_caption2',   label: 'Caption 2',        visible: true, type: 'text',   content: '©International — just do it 2026', fontSize: 11, color: '#aaaaaa' },
      { id: 'mf_price2',     label: 'Price / Discount', visible: true, type: 'text',   content: '(45%)', fontSize: 36, color: '#0d0d0d' },
      { id: 'mf_cta',        label: 'Learn More Button',visible: true, type: 'button', content: 'LEARN MORE →', color: '#0d0d0d' },
    ],
  },
  mobile_categories: {
    id: 'mobile_categories', label: 'Categories', icon: '③', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mc_heading',    label: 'Section Label',    visible: true, type: 'text',   content: '[CATEGORIES]', fontSize: 10, color: '#aaaaaa' },
      { id: 'mc_cat_image',  label: 'Category Image',   visible: true, type: 'image',  imageUrl: '', color: '#e2e0dc', hint: 'Image shown for active category (uses per-category image if set)' },
      { id: 'mc_description',label: 'Description Text', visible: true, type: 'text',   content: "Every piece carries rhythm beyond clothing — it's motion and meaning where street energy meets.", fontSize: 13, color: '#666666' },
      { id: 'mc_cta',        label: 'SEE PRODUCT btn',  visible: true, type: 'button', content: 'SEE PRODUCT →', color: '#0d0d0d' },
    ],
  },
  mobile_carousel: {
    id: 'mobile_carousel', label: 'Carousel', icon: '④', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mcr_title',   label: 'Section Title',      visible: true, type: 'text',  content: 'SHOP THE COLLECTIONS', fontSize: 20, color: '#0d0d0d' },
      { id: 'mcr_year',    label: 'Year Tag',            visible: true, type: 'text',  content: '2026', fontSize: 13, color: '#aaaaaa' },
      { id: 'mcr_card1',   label: 'Card 1 Image',        visible: true, type: 'image', imageUrl: '', color: '#c8b890', hint: 'Card 1 — shown as hero card on mobile' },
      { id: 'mcr_card2',   label: 'Card 2 Image',        visible: true, type: 'image', imageUrl: '', color: '#a8b898', hint: 'Card 2' },
      { id: 'mcr_card3',   label: 'Card 3 Image',        visible: true, type: 'image', imageUrl: '', color: '#3e3e3e', hint: 'Card 3' },
      { id: 'mcr_card4',   label: 'Card 4 Image',        visible: true, type: 'image', imageUrl: '', color: '#90aea8', hint: 'Card 4' },
      { id: 'mcr_card5',   label: 'Card 5 Image',        visible: true, type: 'image', imageUrl: '', color: '#b8a888', hint: 'Card 5' },
      { id: 'mcr_card6',   label: 'Card 6 Image',        visible: true, type: 'image', imageUrl: '', color: '#9a9088', hint: 'Card 6' },
      { id: 'mcr_wear',    label: '[Wear the Moment]',   visible: true, type: 'text',  content: '[Wear the Moment]', fontSize: 11, color: '#ffffff' },
    ],
  },
  mobile_collections: {
    id: 'mobile_collections', label: 'Collections', icon: '⑤', bgColor: '#f5f5f3', accentColor: '#f04e0f',
    elements: [
      { id: 'mcl_intro',      label: 'Intro Text',        visible: true, type: 'text',   content: 'From enduring classics to daring statement pieces, our collections are crafted with intention.', fontSize: 12, color: '#777777' },
      { id: 'mcl_model_img',  label: 'Model Image',       visible: true, type: 'image',  imageUrl: '', color: '#d8d4cc', hint: 'Full-width model image' },
      { id: 'mcl_feat_title', label: 'Featured Title',    visible: true, type: 'text',   content: 'Statement Pieces 2025', fontSize: 28, color: '#0d0d0d' },
      { id: 'mcl_feat_desc',  label: 'Featured Desc',     visible: true, type: 'text',   content: 'Your go-to wardrobe staples, crafted for comfort and effortless style.', fontSize: 12, color: '#888888' },
      { id: 'mcl_feat_btn',   label: 'GET STARTED btn',   visible: true, type: 'button', content: 'GET STARTED →', color: '#0d0d0d' },
      { id: 'mcl_col1',       label: 'Collection Row 1',  visible: true, type: 'text',   content: 'Everyday Essentials 2026', fontSize: 24, color: '#555555' },
      { id: 'mcl_col2',       label: 'Collection Row 2',  visible: true, type: 'text',   content: 'Timeless Classics 2026', fontSize: 24, color: '#555555' },
      { id: 'mcl_col3',       label: 'Collection Row 3',  visible: true, type: 'text',   content: 'Seasonal Collections 2025', fontSize: 24, color: '#555555' },
    ],
  },
  mobile_footer: {
    id: 'mobile_footer', label: 'Footer', icon: '⑥', bgColor: '#0d0d0d', accentColor: '#f04e0f',
    elements: [
      { id: 'mft_headline',  label: 'Headline',        visible: true, type: 'text',  content: 'Fast Selling Urban\n__Fashion Collection', fontSize: 28, color: '#ffffff' },
      { id: 'mft_email_ph',  label: 'Email Placeholder',visible:true, type: 'text',  content: 'Send email to us', fontSize: 13, color: '#555555' },
      { id: 'mft_location',  label: 'Location',        visible: true, type: 'text',  content: 'Your Store Address\nCity, State', fontSize: 13, color: '#888888' },
      { id: 'mft_email',     label: 'Email',           visible: true, type: 'text',  content: 'hello@calvac.store', fontSize: 13, color: '#888888' },
      { id: 'mft_phone',     label: 'Phone',           visible: true, type: 'text',  content: '+91 98765 43210', fontSize: 13, color: '#888888' },
      { id: 'mft_hours',     label: 'Open Time',       visible: true, type: 'text',  content: '08.00 - 11.00 pm', fontSize: 13, color: '#888888' },
      { id: 'mft_copyright', label: 'Copyright',       visible: true, type: 'text',  content: '© 2026 CALVAC. All rights reserved.', fontSize: 11, color: '#444444' },
    ],
  },
}

const DEFAULT_CAT_ITEMS: CategoryItem[] = [
  { id: 'cat_0', name: 'accessories', visible: true, imageUrl: '', count: 174, fontSize: 96, color: '#0d0d0d' },
  { id: 'cat_1', name: 'hoodies',     visible: true, imageUrl: '', count: 361, fontSize: 64, color: '#999999' },
  { id: 'cat_2', name: 'jackets',     visible: true, imageUrl: '', count: 368, fontSize: 46, color: '#bbbbbb' },
  { id: 'cat_3', name: 'pants',       visible: true, imageUrl: '', count: 117, fontSize: 36, color: '#cccccc' },
  { id: 'cat_4', name: 'tees',        visible: true, imageUrl: '', count: 78,  fontSize: 28, color: '#dddddd' },
]

// ─── Tiny shared helpers ──────────────────────────────────────
const lbl10: React.CSSProperties = { fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 7, fontFamily: 'Barlow,sans-serif' }
const inputS: React.CSSProperties = { width: '100%', border: '1px solid #e8e8e5', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'Barlow,sans-serif', outline: 'none', boxSizing: 'border-box', background: 'transparent' }

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl10}>{label}</label>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, hint, multiline }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string; multiline?: boolean
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={lbl10}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} style={{ ...inputS, resize: 'none' }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputS} />}
      {hint && <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  DESKTOP CANVAS (unchanged from original)
// ─────────────────────────────────────────────────────────────
function PageBackground({ config }: { config: PageConfig }) {
  if (config.id === 'featured_moments') {
    return (
      <>
        <div style={{ position: 'absolute', left: '14%', top: '-12%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 500, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>S</div>
        <div style={{ position: 'absolute', left: '28%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 5, left: '1%', fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 1 · 28%</div>
        <div style={{ position: 'absolute', top: 5, left: '30%', fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 2 · 38%</div>
        <div style={{ position: 'absolute', top: 5, left: '67%', fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 3 · 34%</div>
        <div style={{ position: 'absolute', left: '29%', top: '2%', width: '36%', height: '75%', background: 'rgba(200,185,150,0.15)', clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', left: '29%', width: '35%', top: 'calc(2% + 75% * 0.69)', height: 4, background: 'rgba(255,255,255,0.8)', pointerEvents: 'none', zIndex: 3 }} />
        <div style={{ position: 'absolute', left: '67%', right: '1%', top: '34%', height: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none', zIndex: 1 }} />
      </>
    )
  }
  if (config.id === 'hero') {
    return (
      <>
        <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '67%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        {[{ l: 'Left Col', x: '2%' }, { l: 'Model Image', x: '35%' }, { l: 'Right Col', x: '69%' }].map((c, i) => (
          <div key={i} style={{ position: 'absolute', top: 4, left: c.x, fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>{c.l}</div>
        ))}
      </>
    )
  }
  if (config.id === 'categories') {
    const catItems: any[] = (config as any)._items ?? DEFAULT_CAT_ITEMS
    const visibleItems = catItems.filter((c: any) => c.visible !== false)
    const yPositions = ['17%', '30%', '42%', '52%', '61%', '70%', '78%']
    const fontSizes = [11, 9, 8, 7, 6.5, 6, 5.5]
    return (
      <>
        <div style={{ position: 'absolute', right: '-4%', top: '-5%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 320, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>C</div>
        <div style={{ position: 'absolute', left: '44%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 4, left: '1%', fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>Image</div>
        <div style={{ position: 'absolute', top: 4, left: '46%', fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>Category List</div>
        <div style={{ position: 'absolute', left: '0%', top: '5%', width: '41%', height: '88%', background: 'rgba(200,196,190,0.25)', clipPath: 'polygon(0% 0%,72% 0%,72% 25%,100% 50%,72% 75%,72% 100%,0% 100%)', pointerEvents: 'none', zIndex: 0 }} />
        {visibleItems.map((cat: any, i: number) => (
          <div key={i} style={{ position: 'absolute', left: '45%', right: '1%', top: yPositions[i] ?? `${17 + i * 10}%`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 3, pointerEvents: 'none', zIndex: 2 }}>
            <span style={{ fontSize: 7, color: i === 0 ? '#333' : '#ccc', fontFamily: 'Barlow,sans-serif' }}>[{String(i + 1).padStart(2, '0')}]</span>
            <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: (fontSizes[i] ?? 5) * 1.8, color: i === 0 ? (cat.color ?? '#0d0d0d') : cat.color ?? '#ccc', textTransform: 'lowercase', flex: 1, textAlign: 'right', paddingRight: 8 }}>{cat.name}</span>
            <span style={{ fontSize: 7, color: '#ccc', fontFamily: 'Barlow,sans-serif', width: 28, textAlign: 'right' }}>({cat.count})</span>
          </div>
        ))}
      </>
    )
  }
  if (config.id === 'collections') {
    return (
      <>
        <div style={{ position: 'absolute', left: '44%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '1%', top: '12%', width: '38%', height: '55%', background: 'rgba(0,0,0,0.05)', clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)', pointerEvents: 'none' }} />
      </>
    )
  }
  if (config.id === 'carousel') {
    return <div style={{ position: 'absolute', left: '2%', top: '22%', right: '2%', height: '72%', background: 'rgba(0,0,0,0.02)', borderRadius: 4, pointerEvents: 'none', border: '1px dashed rgba(0,0,0,0.06)' }} />
  }
  return null
}

function DesktopPageCanvas({ config, selectedId, onSelect, onDrag, canvasHeight }: {
  config: PageConfig; selectedId: string | null
  onSelect: (id: string) => void; onDrag: (id: string, x: number, y: number) => void
  canvasHeight?: number
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragging  = useRef<string | null>(null)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })
  const [canvasW, setCanvasW] = useState(640)
  const CANVAS_H = canvasHeight ?? 760

  useEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver(e => setCanvasW(e[0].contentRect.width))
    ro.observe(canvasRef.current)
    setCanvasW(canvasRef.current.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation()
    onSelect(id)
    dragging.current = id
    const el = config.elements.find(x => x.id === id)!
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, elX: el.x, elY: el.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragStart.current.mouseX) / rect.width) * 100
    const dy = ((e.clientY - dragStart.current.mouseY) / rect.height) * 100
    onDrag(dragging.current,
      Math.round(Math.max(0, Math.min(90, dragStart.current.elX + dx)) * 10) / 10,
      Math.round(Math.max(0, Math.min(90, dragStart.current.elY + dy)) * 10) / 10)
  }
  const onMouseUp = () => { dragging.current = null }
  const isFooter = config.id === 'footer'

  return (
    <div ref={canvasRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      style={{ position: 'relative', width: '100%', height: CANVAS_H, background: config.bgColor, borderRadius: 8, overflow: 'hidden', cursor: 'default', userSelect: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
      <PageBackground config={config} />
      {!['featured_moments', 'hero', 'categories', 'collections', 'carousel'].includes(config.id) && [25, 50, 75].map(p => (
        <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 1, background: isFooter ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 50, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 10, letterSpacing: '1px', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>{config.label}</div>
      {config.elements.filter(e => e.visible).map(e => {
        const isSelected = selectedId === e.id
        return (
          <div key={e.id} onMouseDown={ev => onMouseDown(ev, e.id)} title={e.label}
            style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, cursor: 'grab', zIndex: isSelected ? 30 : 10, outline: isSelected ? `2px dashed ${config.accentColor}` : '2px dashed transparent', outlineOffset: 2, borderRadius: 3, transition: 'outline 0.15s' }}>
            {e.isImage ? (
              <div style={{ width: `${((e.width ?? 20) / 100) * canvasW}px`, height: `${(e.height ?? 30) * (CANVAS_H / 100)}px`, background: e.imageUrl ? `url(${e.imageUrl}) center/cover no-repeat` : (e.color ?? '#ddd'), borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minWidth: 40, minHeight: 40 }}>
                {!e.imageUrl && <div style={{ textAlign: 'center', padding: 4 }}><ImageIcon size={14} color="rgba(255,255,255,0.4)" /><p style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', fontFamily: 'Barlow,sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>{e.label}</p></div>}
              </div>
            ) : e.type === 'product_card' ? (
              <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 10, padding: '8px 12px', width: 120, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: 'Barlow,sans-serif' }}>
                <p style={{ fontSize: 7, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', margin: '0 0 4px' }}>Featured Drop</p>
                <p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: e.fontSize ?? 13, lineHeight: 1.2, margin: '0 0 6px', color: e.color ?? '#0d0d0d' }}>{e.content ?? 'Cargo Oversized Jacket'}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 16 }}>₹3,499</span>
                  <span style={{ fontSize: 8, background: config.accentColor, color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>-20%</span>
                </div>
              </div>
            ) : e.type === 'avatars' ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['J', 'A'].map((l, i) => (<div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: '#c8c8c6', border: `2px solid ${config.bgColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#555', marginLeft: i === 0 ? 0 : -6, fontFamily: 'Barlow,sans-serif' }}>{l}</div>))}
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: config.accentColor, border: `2px solid ${config.bgColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', marginLeft: -6 }}>+</div>
              </div>
            ) : (
              <div style={{ fontFamily: (e.id.includes('headline') || e.id.includes('stat') || e.id.includes('price') || e.id.includes('feat_title') || e.id.includes('cat') || e.id.includes('col')) ? '"Barlow Condensed",sans-serif' : 'Barlow,sans-serif', fontWeight: e.id.includes('headline') || e.id.includes('stat') || e.id.includes('price') || e.id.includes('cat') ? 900 : 500, fontSize: Math.max(7, Math.round((e.fontSize ?? 12) * (canvasW / 1366))), color: e.color ?? '#0d0d0d', whiteSpace: 'pre-line', lineHeight: 1.1, maxWidth: `${Math.max(60, 32 - e.x / 3)}%`, overflow: 'hidden' }}>{e.content || e.label}</div>
            )}
            {isSelected && <div style={{ position: 'absolute', top: -18, left: 0, background: config.accentColor, color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none', zIndex: 40 }}>{e.label}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MOBILE PHONE PREVIEW CANVAS
// ─────────────────────────────────────────────────────────────
function TabletSectionPreview({ config, categoryItems }: { config: PageConfig; categoryItems: CategoryItem[] }) {
  const visible = config.elements.filter(e => e.visible)
  const imageEls = visible.filter(e => e.isImage)
  const textEls = visible.filter(e => !e.isImage && e.type !== 'product_card' && e.type !== 'avatars')
  const heroImage = imageEls[0]
  const title = textEls.find(e => e.id.includes('headline') || e.id.includes('title') || e.id.includes('feat_title')) ?? textEls[0]
  const body = textEls.find(e => e.id.includes('description') || e.id.includes('intro') || e.id.includes('custom_text') || e.id.includes('feat_desc'))

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 'min(100%, 768px)', aspectRatio: '4 / 3', background: config.bgColor, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.22)', border: '10px solid #171717' }}>
        <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 34, display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ height: 2, background: '#0d0d0d' }} /><span style={{ height: 2, background: '#0d0d0d' }} /></div>
          <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '7px' }}>CALVAC</span>
          <div style={{ display: 'flex', gap: 8 }}><span style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #0d0d0d' }} /><span style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #0d0d0d' }} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: config.id === 'hero' ? '0.9fr 1.1fr' : '1fr 1fr', gap: 32, height: 'calc(100% - 58px)', padding: 34, alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 10, letterSpacing: '4px', color: '#aaa', textTransform: 'uppercase', marginBottom: 16 }}>{config.label}</p>
            {title && <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 'clamp(44px,7vw,78px)', lineHeight: 0.92, letterSpacing: 0, whiteSpace: 'pre-line', color: title.color ?? '#0d0d0d', margin: '0 0 18px' }}>{title.content ?? title.label}</h2>}
            {body && <p style={{ fontSize: 15, lineHeight: 1.75, color: body.color ?? '#666', whiteSpace: 'pre-line', maxWidth: 330, margin: '0 0 22px' }}>{body.content ?? body.label}</p>}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1.5px solid #0d0d0d', borderRadius: 999, padding: '10px 22px', fontSize: 11, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Shop now -&gt;</div>
          </div>
          <div style={{ minWidth: 0, height: '100%', display: 'grid', gridTemplateRows: config.id === 'categories' ? '1fr auto' : '1fr', gap: 18 }}>
            <div style={{ minHeight: 0, overflow: 'hidden', background: heroImage?.imageUrl ? 'transparent' : (heroImage?.color ?? '#e2e0dc'), clipPath: 'polygon(4% 0%,82% 0%,96% 34%,96% 100%,18% 100%,4% 64%)' }}>
              {heroImage?.imageUrl ? <img src={heroImage.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: heroImage.objectPosition ?? 'top center' }} /> : null}
            </div>
            {config.id === 'categories' && (
              <div>
                {categoryItems.filter(c => c.visible).slice(0, 4).map((cat, i) => (
                  <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 42px', gap: 8, alignItems: 'center', borderBottom: '1px solid #e8e8e5', padding: '7px 0' }}>
                    <span style={{ fontSize: 10, color: i === 0 ? '#0d0d0d' : '#ccc' }}>[{String(i + 1).padStart(2, '0')}]</span>
                    <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: i === 0 ? 34 : 24, lineHeight: 1, textAlign: 'right', color: i === 0 ? cat.color : '#ccc' }}>{cat.name}</span>
                    <span style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>({cat.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function buildDeviceDefaults(device: 'tablet' | 'mobile'): Record<PageId, PageConfig> {
  const fontScale = device === 'tablet' ? 0.78 : 0.56
  const imageScale = device === 'tablet' ? 1 : 1.18
  const xClamp = device === 'tablet' ? 88 : 84
  const yClamp = 88

  const clonePage = (page: PageConfig): PageConfig => ({
    ...page,
    elements: page.elements.map(el => ({
      ...el,
      x: Math.min(xClamp, Math.max(0, Math.round(el.x * 10) / 10)),
      y: Math.min(yClamp, Math.max(0, Math.round(el.y * 10) / 10)),
      fontSize: el.fontSize ? Math.max(7, Math.round(el.fontSize * fontScale)) : el.fontSize,
      width: el.width ? Math.min(device === 'tablet' ? 68 : 92, Math.max(8, Math.round(el.width * imageScale))) : el.width,
      height: el.height ? Math.min(100, Math.max(6, Math.round(el.height))) : el.height,
    })),
  })

  return {
    hero: clonePage(DESKTOP_DEFAULTS.hero),
    featured_moments: clonePage(DESKTOP_DEFAULTS.featured_moments),
    categories: clonePage(DESKTOP_DEFAULTS.categories),
    carousel: clonePage(DESKTOP_DEFAULTS.carousel),
    collections: clonePage(DESKTOP_DEFAULTS.collections),
    footer: clonePage(DESKTOP_DEFAULTS.footer),
  }
}

function DeviceElementPanel({
  pageId, selected, uploading, onUpdate, onUpload, onReset,
}: {
  pageId: PageId
  selected?: PageElement
  uploading: boolean
  onUpdate: (id: string, patch: Partial<PageElement>) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  onReset: (id: string) => void
}) {
  if (!selected) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60, color: '#ccc' }}>
        <Layers size={26} style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ fontSize: 12, lineHeight: 1.6, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>Click an element<br/>on the canvas to edit</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0ee' }}>
        <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{selected.label}</p>
        <button onClick={() => onUpdate(selected.id, { visible: !selected.visible })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.visible ? '#0d0d0d' : '#ccc' }}>
          {selected.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      <PropRow label="Position X (%)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min={0} max={92} value={selected.x} onChange={e => onUpdate(selected.id, { x: +e.target.value })} style={{ flex: 1 }} />
          <input type="number" value={selected.x} onChange={e => onUpdate(selected.id, { x: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
        </div>
      </PropRow>
      <PropRow label="Position Y (%)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min={0} max={92} value={selected.y} onChange={e => onUpdate(selected.id, { y: +e.target.value })} style={{ flex: 1 }} />
          <input type="number" value={selected.y} onChange={e => onUpdate(selected.id, { y: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
        </div>
      </PropRow>
      {selected.isImage ? (
        <>
          <PropRow label="Image">
            {selected.imageUrl ? (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img src={selected.imageUrl} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => onUpdate(selected.id, { imageUrl: '' })} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>x</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0de', borderRadius: 8, padding: '18px 12px', cursor: 'pointer', gap: 6, marginBottom: 8 }}>
                <ImageIcon size={20} color="#ccc" />
                <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onUpload(e, selected.id)} disabled={uploading} />
              </label>
            )}
          </PropRow>
          <PropRow label="Width (% of page)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={5} max={95} value={selected.width ?? 20} onChange={e => onUpdate(selected.id, { width: +e.target.value })} style={{ flex: 1 }} />
              <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selected.width ?? 20}%</span>
            </div>
          </PropRow>
          <PropRow label="Height (% of canvas)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={5} max={100} value={selected.height ?? 30} onChange={e => onUpdate(selected.id, { height: +e.target.value })} style={{ flex: 1 }} />
              <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selected.height ?? 30}%</span>
            </div>
          </PropRow>
          <PropRow label={`Zoom: ${Math.round((selected.zoom ?? 1) * 100)}%`}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={50} max={200} step={1} value={Math.round((selected.zoom ?? 1) * 100)} onChange={e => onUpdate(selected.id, { zoom: +e.target.value / 100 })} style={{ flex: 1 }} />
              <button onClick={() => onUpdate(selected.id, { zoom: 1 })} style={{ fontSize: 10, color: '#aaa', background: 'none', border: '1px solid #e8e8e5', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Reset</button>
            </div>
          </PropRow>
          <PropRow label="Image Focus">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
              {[{ label: 'Top', val: 'top center' }, { label: 'Center', val: 'center center' }, { label: 'Bottom', val: 'bottom center' }, { label: 'Left', val: 'center left' }, { label: 'Right', val: 'center right' }, { label: 'Top L', val: 'top left' }].map(opt => (
                <button key={opt.val} onClick={() => onUpdate(selected.id, { objectPosition: opt.val })} style={{ padding: '5px 4px', fontSize: 10, borderRadius: 5, border: `1px solid ${(selected.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#e8e8e5'}`, background: (selected.objectPosition ?? 'top center') === opt.val ? '#fff4f0' : '#fff', cursor: 'pointer', color: (selected.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#666', fontFamily: 'Barlow,sans-serif' }}>{opt.label}</button>
              ))}
            </div>
            <input type="text" value={selected.objectPosition ?? 'top center'} onChange={e => onUpdate(selected.id, { objectPosition: e.target.value })} placeholder="e.g. 50% 20%" style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const }} />
          </PropRow>
          <PropRow label="Placeholder Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={selected.color ?? '#dddddd'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={selected.color ?? '#dddddd'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
        </>
      ) : (
        <>
          {selected.fontSize !== undefined && (
            <PropRow label="Font Size (px)">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="range" min={7} max={120} value={selected.fontSize} onChange={e => onUpdate(selected.id, { fontSize: +e.target.value })} style={{ flex: 1 }} />
                <input type="number" value={selected.fontSize} onChange={e => onUpdate(selected.id, { fontSize: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
              </div>
            </PropRow>
          )}
          <PropRow label="Text Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={selected.color ?? '#000000'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={selected.color ?? '#000000'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
          {selected.content !== undefined && (
            <PropRow label="Content">
              <textarea value={selected.content} onChange={e => onUpdate(selected.id, { content: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'Barlow,sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' as const }} />
            </PropRow>
          )}
        </>
      )}
      <button onClick={() => onReset(selected.id)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', color: '#666', marginTop: 6 }}>
        Reset Position
      </button>
    </>
  )
}

function DeviceCanvasEditor({
  device, pages, configs, activePage, selectedEl, uploading, categoryItems,
  onActivePage, onSelectedEl, onUpdateEl, onResetPage, onUpload, onColorChange, sideBtn,
}: {
  device: 'desktop' | 'tablet' | 'mobile'
  pages: PageId[]
  configs: Record<PageId, PageConfig>
  activePage: PageId
  selectedEl: string | null
  uploading: boolean
  categoryItems: CategoryItem[]
  onActivePage: (page: PageId) => void
  onSelectedEl: (id: string | null) => void
  onUpdateEl: (id: string, patch: Partial<PageElement>) => void
  onResetPage: () => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  onColorChange: (key: 'bgColor' | 'accentColor', value: string) => void
  sideBtn: (active: boolean) => React.CSSProperties
}) {
  const cfg = configs[activePage]
  const selEl = cfg.elements.find(e => e.id === selectedEl)
  const canvasHeight = device === 'mobile' ? 820 : device === 'tablet' ? 620 : 760
  const label = device[0].toUpperCase() + device.slice(1)
  const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor

  return (
    <>
      <div style={{ width: 170, background: '#fff', borderRight: '1px solid #e8e8e5', overflowY: 'auto', flexShrink: 0, padding: '10px 6px' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', padding: '4px 8px 10px', fontFamily: 'Barlow,sans-serif' }}>PAGES</p>
        {pages.map(pid => {
          const c = configs[pid]
          return (
            <button key={pid} onClick={() => { onActivePage(pid); onSelectedEl(null) }} style={sideBtn(activePage === pid)}>
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: activePage === pid ? '#0d0d0d' : '#666', margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{c.elements.length} elements</p>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#e8e7e4' }}>
        <div style={{ background: device === 'desktop' ? '#fffbe6' : '#eef8f3', border: `1px solid ${device === 'desktop' ? '#f0d060' : '#bce2ce'}`, borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color={device === 'desktop' ? '#a16c00' : '#16834a'} />
          <span style={{ fontSize: 11, color: device === 'desktop' ? '#7a6000' : '#166534', fontFamily: 'Barlow,sans-serif', lineHeight: 1.5 }}>
            <strong>{label} editor</strong> - drag elements to reposition, click an element on the canvas to edit, and use the right panel for size, color, content and images.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Move size={12} color="#888" />
            <span style={{ fontSize: 11, color: '#888', fontFamily: 'Barlow,sans-serif' }}>Drag to reposition - Click to select - Edit in panel</span>
          </div>
          <button onClick={onResetPage} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow,sans-serif', color: '#666' }}>
            <RotateCcw size={11} /> Reset Page
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {cfg.elements.map(e => (
            <button key={e.id} onClick={() => onUpdateEl(e.id, { visible: !e.visible })} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: e.visible ? '#0d0d0d' : '#e0e0de', color: e.visible ? '#fff' : '#888', fontSize: 10, fontFamily: 'Barlow,sans-serif', transition: 'all 0.15s' }}>
              {e.visible ? <Eye size={9} /> : <EyeOff size={9} />}{e.label}
            </button>
          ))}
        </div>
        <div style={{ maxWidth: device === 'mobile' ? 390 : device === 'tablet' ? 768 : 'none', margin: device === 'desktop' ? 0 : '0 auto' }}>
          <DesktopPageCanvas
            config={activePage === 'categories' ? { ...cfg, _items: categoryItems } as any : cfg}
            selectedId={selectedEl}
            onSelect={onSelectedEl}
            onDrag={(id, x, y) => onUpdateEl(id, { x, y })}
            canvasHeight={canvasHeight}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, background: '#fff', borderRadius: 12, padding: 14 }}>
          {([['Page Background', 'bgColor'], ['Accent Color', 'accentColor']] as const).map(([labelText, key]) => (
            <div key={key}>
              <label style={{ ...lbl10, marginBottom: 8 }}>{labelText}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={key === 'bgColor' ? cfg.bgColor : cfg.accentColor} onChange={e => onColorChange(key, e.target.value)} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <code style={{ fontSize: 11, color: '#666' }}>{key === 'bgColor' ? cfg.bgColor : cfg.accentColor}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: 250, borderLeft: '1px solid #e8e8e5', background: '#fff', overflowY: 'auto', padding: 14, flexShrink: 0 }}>
        <DeviceElementPanel
          pageId={activePage}
          selected={selEl}
          uploading={uploading}
          onUpdate={onUpdateEl}
          onUpload={onUpload}
          onReset={id => {
            const defaults = buildDeviceDefaults(device === 'desktop' ? 'tablet' : device)
            const d = (device === 'desktop' ? DESKTOP_DEFAULTS : defaults)[activePage].elements.find(x => x.id === id)
            if (d) onUpdateEl(id, { x: d.x, y: d.y })
          }}
        />
      </div>
    </>
  )
}

function MobilePhoneFrame({ children, bgColor }: { children: React.ReactNode; bgColor: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {/* Phone outer shell */}
      <div style={{ width: 280, flexShrink: 0, background: '#1a1a1a', borderRadius: 36, padding: '14px 10px', boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        {/* Status bar */}
        <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, fontFamily: 'Barlow,sans-serif' }}>9:41</span>
          <div style={{ width: 60, height: 14, background: '#1a1a1a', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ width: 14, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
            <div style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
          </div>
        </div>
        {/* Screen */}
        <div style={{ background: bgColor, borderRadius: 24, overflow: 'hidden', minHeight: 560, maxHeight: 560, overflowY: 'auto' }}>
          {children}
        </div>
        {/* Home bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

function MobileSectionPreview({ section, categoryItems }: { section: MobileSectionConfig; categoryItems: CategoryItem[] }) {
  const isFooter = section.bgColor === '#0d0d0d'

  return (
    <MobilePhoneFrame bgColor={section.bgColor}>
      {/* Mobile navbar mock */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${isFooter ? 'rgba(255,255,255,0.08)' : '#e8e8e5'}`, background: section.bgColor }}>
        <div style={{ width: 24, height: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ height: 1.5, background: isFooter ? '#fff' : '#0d0d0d', borderRadius: 1 }} />
          <div style={{ height: 1.5, background: isFooter ? '#fff' : '#0d0d0d', borderRadius: 1 }} />
        </div>
        <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '4px', color: isFooter ? '#fff' : '#0d0d0d' }}>CALVAC</span>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isFooter ? 'rgba(255,255,255,0.3)' : '#0d0d0d'}` }} />
      </div>

      {/* Section elements rendered as stacked blocks */}
      <div style={{ padding: section.id === 'mobile_footer' ? '20px 14px 24px' : '14px 14px 20px' }}>
        {section.elements.filter(e => e.visible).map(el => {
          if (el.type === 'image') {
            return (
              <div key={el.id} style={{ width: '100%', height: section.id === 'mobile_hero' ? 220 : 160, background: el.imageUrl ? `url(${el.imageUrl}) center/cover` : (el.color ?? '#ddd'), borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {!el.imageUrl && <div style={{ textAlign: 'center' }}><ImageIcon size={18} color="rgba(255,255,255,0.3)" /><p style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Barlow,sans-serif' }}>{el.label}</p></div>}
              </div>
            )
          }
          if (el.type === 'button') {
            return (
              <div key={el.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${el.color ?? '#0d0d0d'}`, borderRadius: 30, padding: '7px 16px' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: el.color ?? '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>{el.content ?? 'Button'}</span>
                </div>
              </div>
            )
          }
          // text
          const isHeadline = el.id.includes('headline') || (el.fontSize ?? 0) >= 36
          return (
            <div key={el.id} style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: isHeadline ? '"Barlow Condensed",sans-serif' : 'Barlow,sans-serif', fontWeight: isHeadline ? 900 : 400, fontSize: Math.max(7, Math.round((el.fontSize ?? 12) * 0.68)), color: el.color ?? (isFooter ? '#fff' : '#0d0d0d'), lineHeight: 1.15, whiteSpace: 'pre-line', letterSpacing: isHeadline ? '-0.5px' : '0' }}>{el.content || el.label}</p>
            </div>
          )
        })}

        {/* Category list preview for categories section */}
        {section.id === 'mobile_categories' && (
          <div style={{ marginTop: 8 }}>
            {categoryItems.filter(c => c.visible).map((cat, i) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e5', padding: '6px 0' }}>
                <span style={{ fontSize: 7, color: '#ccc', fontFamily: 'Barlow,sans-serif' }}>[{String(i + 1).padStart(2, '0')}]</span>
                <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: Math.max(9, Math.round((cat.fontSize ?? 32) * 0.22)), color: i === 0 ? (cat.color ?? '#0d0d0d') : '#ccc', textTransform: 'lowercase', flex: 1, textAlign: 'right', paddingRight: 6 }}>{cat.name}</span>
                <span style={{ fontSize: 7, color: '#ccc', fontFamily: 'Barlow,sans-serif' }}>({cat.count})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobilePhoneFrame>
  )
}

// ─────────────────────────────────────────────────────────────
//  MOBILE ELEMENT PROPERTY PANEL
// ─────────────────────────────────────────────────────────────
function MobileElEditor({ el, onUpdate, onUpload, uploading }: {
  el: MobileElement
  onUpdate: (patch: Partial<MobileElement>) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  uploading: boolean
}) {
  return (
    <div style={{ padding: '14px 14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f0ee' }}>
        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, fontFamily: 'Barlow,sans-serif' }}>{el.label}</p>
        <button onClick={() => onUpdate({ visible: !el.visible })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: el.visible ? '#0d0d0d' : '#ccc' }}>
          {el.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {el.hint && <p style={{ fontSize: 11, color: '#888', marginBottom: 14, lineHeight: 1.5, fontStyle: 'italic' }}>{el.hint}</p>}

      {el.type === 'image' && (
        <>
          <PropRow label="Image">
            {el.imageUrl ? (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img src={el.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => onUpdate({ imageUrl: '' })} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0de', borderRadius: 8, padding: '16px 12px', cursor: 'pointer', gap: 6, marginBottom: 8 }}>
                <ImageIcon size={20} color="#ccc" />
                <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploading ? 'Uploading…' : 'Click to upload'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onUpload(e, el.id)} disabled={uploading} />
              </label>
            )}
          </PropRow>
          <PropRow label="Placeholder Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={el.color ?? '#dddddd'} onChange={e => onUpdate({ color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={el.color ?? '#dddddd'} onChange={e => onUpdate({ color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
        </>
      )}

      {(el.type === 'text' || el.type === 'button') && (
        <>
          {el.content !== undefined && (
            <PropRow label="Content">
              <textarea value={el.content} onChange={e => onUpdate({ content: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'Barlow,sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            </PropRow>
          )}
          {el.fontSize !== undefined && (
            <PropRow label={`Font Size: ${el.fontSize}px`}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="range" min={7} max={80} value={el.fontSize} onChange={e => onUpdate({ fontSize: +e.target.value })} style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: '#666', width: 32, textAlign: 'right' }}>{el.fontSize}</span>
              </div>
            </PropRow>
          )}
          <PropRow label="Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={el.color ?? '#0d0d0d'} onChange={e => onUpdate({ color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={el.color ?? '#0d0d0d'} onChange={e => onUpdate({ color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MOBILE PAGE CANVAS — renders accurate mobile section previews
//  matching the actual live mobile layouts built in the components
// ─────────────────────────────────────────────────────────────

const CLIP_PATH = 'polygon(0% 0%, 80% 5%, 95% 35%, 100% 100%, 20% 95%, 5% 65%)'
const S_SHAPE   = 'polygon(4% 0%,82% 0%,96% 34%,96% 100%,18% 100%,4% 64%)'
const ARROW_CUT = 'polygon(100% 0%,100% 100%,0% 100%,40% 75%,0% 50%,40% 25%,0% 0%)'
const FEAT_POLY = 'polygon(5% 5%,80% 5%,95% 35%,95% 95%,20% 95%,5% 65%)'

// Phone shell wrapper (260px wide screen inside)
// Wraps a preview element — clicking selects it in the right panel
function ElWrap({ id, selectedId, onSelect, children, style }: {
  id: string; selectedId?: string | null; onSelect?: (id: string) => void
  children: React.ReactNode; style?: React.CSSProperties
}) {
  const isSelected = selectedId === id
  return (
    <div
      onClick={e => { e.stopPropagation(); onSelect?.(id) }}
      style={{
        ...style,
        outline: isSelected ? '2px solid #f04e0f' : '2px solid transparent',
        outlineOffset: 1,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'outline 0.1s',
        position: 'relative',
      }}
      title={id}
    >
      {children}
      {isSelected && (
        <div style={{ position: 'absolute', top: -16, left: 0, background: '#f04e0f', color: '#fff', fontSize: 7, padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap', zIndex: 50, pointerEvents: 'none', fontFamily: 'Barlow,sans-serif', letterSpacing: '0.5px' }}>
          {id}
        </div>
      )}
    </div>
  )
}

function PhoneShell({ children, bgColor }: { children: React.ReactNode; bgColor: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 260, flexShrink: 0, background: '#1a1a1a', borderRadius: 34, padding: '12px 9px', boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        {/* Status bar */}
        <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', marginBottom: 2 }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, fontFamily: 'Barlow,sans-serif' }}>9:41</span>
          <div style={{ width: 52, height: 12, background: '#1a1a1a', borderRadius: 6, border: '1.5px solid rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ width: 12, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
            <div style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
          </div>
        </div>
        {/* Screen */}
        <div style={{ background: bgColor, borderRadius: 22, overflow: 'hidden', maxHeight: 520, overflowY: 'auto' }}>
          {/* Navbar mock */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${bgColor === '#0d0d0d' ? 'rgba(255,255,255,0.08)' : '#e8e8e5'}`, background: bgColor, position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: 18 }}>
              <div style={{ height: 1.5, background: bgColor === '#0d0d0d' ? '#fff' : '#0d0d0d', borderRadius: 1 }} />
              <div style={{ height: 1.5, background: bgColor === '#0d0d0d' ? '#fff' : '#0d0d0d', borderRadius: 1 }} />
            </div>
            <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '3px', color: bgColor === '#0d0d0d' ? '#fff' : '#0d0d0d' }}>CALVAC</span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${bgColor === '#0d0d0d' ? 'rgba(255,255,255,0.3)' : '#0d0d0d'}` }} />
          </div>
          {children}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 64, height: 3, background: 'rgba(255,255,255,0.25)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

// Reusable placeholder image box
function ImgBox({ src, color, h, clip, label }: { src?: string; color: string; h: number; clip?: string; label?: string }) {
  return (
    <div style={{ width: '100%', height: h, background: src ? 'transparent' : color, clipPath: clip, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        : <div style={{ width: '100%', height: '100%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={14} color="rgba(255,255,255,0.3)" /></div>}
    </div>
  )
}

// ── Per-section preview renderers ──

function MobileHeroPreview({ cfg, accentColor, selectedId, onSelect }: { cfg: PageConfig; accentColor: string; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false
  const imgEl = el('model_image') as any
  const imgSrc = imgEl?.imageUrl ?? ''
  const bgColor = cfg.bgColor

  return (
    <PhoneShell bgColor={bgColor}>
      <div style={{ padding: '10px 12px 0' }}>
        {v('tag_left') && <ElWrap id="tag_left" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: el('tag_left')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif', margin: '0 0 8px' }}>{el('tag_left')?.content ?? '//FASHION · SS 2026'}</p></ElWrap>}
        {(v('headline_left') || v('headline_right')) && (
          <ElWrap id="headline_left" selectedId={selectedId} onSelect={onSelect}>
            <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 36, lineHeight: 0.88, textTransform: 'lowercase', color: el('headline_left')?.color ?? '#0d0d0d', whiteSpace: 'pre-line', margin: '0 0 10px' }}>
              {`${el('headline_left')?.content ?? 'where\n- style'}\n${el('headline_right')?.content ?? 'lives\n- now'}`}
            </h2>
          </ElWrap>
        )}
      </div>
      <ElWrap id="model_image" selectedId={selectedId} onSelect={onSelect} style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', background: imgEl?.color ?? '#e2e2de', flexShrink: 0 }}>
        {imgSrc ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgEl?.objectPosition ?? 'top center', pointerEvents: 'none' }} /> : null}
        {v('stat') && <ElWrap id="stat" selectedId={selectedId} onSelect={onSelect} style={{ position: 'absolute', right: 10, bottom: 8 }}><p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontSize: 28, lineHeight: 0.85, fontWeight: 900, margin: 0, color: el('stat')?.color ?? '#0d0d0d' }}>{el('stat')?.content ?? '280K'}</p>{v('stat_label') && <p style={{ margin: '3px 0 0', fontSize: 6, letterSpacing: '2px', textTransform: 'uppercase', color: el('stat_label')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif', textAlign: 'right' }}>{el('stat_label')?.content ?? 'PEOPLE WE INSPIRE'}</p>}</ElWrap>}
        {v('orange_star') && <ElWrap id="orange_star" selectedId={selectedId} onSelect={onSelect} style={{ position: 'absolute', left: 10, bottom: '18%', color: el('orange_star')?.color ?? accentColor, fontSize: 18, lineHeight: 1 }}>✦</ElWrap>}
        {v('tag_right') && <ElWrap id="tag_right" selectedId={selectedId} onSelect={onSelect} style={{ position: 'absolute', right: 10, top: 6 }}><p style={{ fontSize: 9, lineHeight: 1.1, color: el('tag_right')?.color ?? '#aaa', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: '"Barlow Condensed",sans-serif', margin: 0, maxWidth: 60, textAlign: 'right' }}>{el('tag_right')?.content ?? 'Styled For Life.'}</p></ElWrap>}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(to bottom,transparent,${bgColor})`, pointerEvents: 'none' }} />
      </ElWrap>
      <div style={{ padding: '8px 12px 16px' }}>
        {v('description') && <ElWrap id="description" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 9, lineHeight: 1.8, color: el('description')?.color ?? '#555', fontFamily: 'Barlow,sans-serif', margin: '0 0 10px' }}>{el('description')?.content ?? ''}</p></ElWrap>}
        {v('new_drop') && <ElWrap id="new_drop" selectedId={selectedId} onSelect={onSelect} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #0d0d0d', borderRadius: 20, padding: '5px 12px' }}><span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>Shop Now →</span></ElWrap>}
      </div>
    </PhoneShell>
  )
}

function MobileFeaturedPreview({ cfg, accentColor, selectedId, onSelect }: { cfg: PageConfig; accentColor: string; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false

  return (
    <PhoneShell bgColor={cfg.bgColor}>
      <div style={{ padding: '10px 12px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '10%', top: '-4%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 160, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>S</div>
        {v('headline') && <ElWrap id="headline" selectedId={selectedId} onSelect={onSelect}><h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 28, lineHeight: 0.91, color: el('headline')?.color ?? '#0d0d0d', margin: '0 0 8px', whiteSpace: 'pre-line' }}>{el('headline')?.content ?? 'All - about
moments ©26'}</h2></ElWrap>}
        {v('main_image') && <ElWrap id="main_image" selectedId={selectedId} onSelect={onSelect} style={{ width: '100%', height: 130, overflow: 'hidden', clipPath: S_SHAPE, background: el('main_image')?.color ?? '#c8b890', marginBottom: 6, position: 'relative' }}>
          {el('main_image')?.imageUrl ? <img src={(el('main_image') as any).imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} /> : null}
          <div style={{ position: 'absolute', top: '69%', left: 0, right: 0, height: 4, background: cfg.bgColor, zIndex: 3 }} />
        </ElWrap>}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
          {v('caption1') && <ElWrap id="caption1" selectedId={selectedId} onSelect={onSelect} style={{ flex: 1, paddingRight: 8 }}><p style={{ fontSize: 7, color: el('caption1')?.color ?? '#aaa', fontStyle: 'italic', margin: 0, fontFamily: 'Barlow,sans-serif' }}>{el('caption1')?.content ?? ''}</p></ElWrap>}
          {v('price1') && <ElWrap id="price1" selectedId={selectedId} onSelect={onSelect}><p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: el('price1')?.color ?? '#0d0d0d' }}>{el('price1')?.content ?? '($120)'}</p></ElWrap>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
          {v('star') && <ElWrap id="star" selectedId={selectedId} onSelect={onSelect}><span style={{ color: el('star')?.color ?? accentColor, fontSize: 13, display: 'block', paddingTop: 1 }}>✦</span></ElWrap>}
          {v('description') && <ElWrap id="description" selectedId={selectedId} onSelect={onSelect} style={{ flex: 1 }}><p style={{ fontSize: 8, lineHeight: 1.7, color: el('description')?.color ?? '#777', fontFamily: 'Barlow,sans-serif', margin: 0 }}>{el('description')?.content ?? ''}</p></ElWrap>}
          {v('thumb_image') && <ElWrap id="thumb_image" selectedId={selectedId} onSelect={onSelect} style={{ width: 38, height: 46, overflow: 'hidden', background: el('thumb_image')?.color ?? '#c8c0b8', flexShrink: 0, clipPath: S_SHAPE }}>
            {el('thumb_image')?.imageUrl ? <img src={(el('thumb_image') as any).imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} /> : null}
          </ElWrap>}
        </div>
        <div style={{ height: 1, background: '#e0e0dd', margin: '6px 0 8px' }} />
        {v('product2_img') && <ElWrap id="product2_img" selectedId={selectedId} onSelect={onSelect} style={{ width: '76%', height: 80, overflow: 'hidden', clipPath: 'polygon(2% 2%,82% 2%,96% 44%,96% 96%,15% 96%,2% 52%)', background: el('product2_img')?.color ?? '#5a5050', marginBottom: 6, position: 'relative' }}>
          {el('product2_img')?.imageUrl ? <img src={(el('product2_img') as any).imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} /> : null}
        </ElWrap>}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
          {v('caption2') && <ElWrap id="caption2" selectedId={selectedId} onSelect={onSelect} style={{ flex: 1, paddingRight: 8 }}><p style={{ fontSize: 7, color: el('caption2')?.color ?? '#aaa', fontStyle: 'italic', margin: 0, fontFamily: 'Barlow,sans-serif' }}>{el('caption2')?.content ?? ''}</p></ElWrap>}
          {v('price2') && <ElWrap id="price2" selectedId={selectedId} onSelect={onSelect}><p style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: el('price2')?.color ?? '#0d0d0d' }}>{el('price2')?.content ?? '(45%)'}</p></ElWrap>}
        </div>
        {v('learn_more') && <ElWrap id="learn_more" selectedId={selectedId} onSelect={onSelect} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor }} /><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ddd' }} /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #0d0d0d', borderRadius: 20, padding: '4px 10px' }}><span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>{el('learn_more')?.content ?? 'LEARN MORE'} →</span></div>
        </ElWrap>}
      </div>
    </PhoneShell>
  )
}

function MobileCategoriesPreview({ cfg, categoryItems, selectedId, onSelect }: { cfg: PageConfig; categoryItems: CategoryItem[]; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false
  const modelImgSrc = el('model_image')?.imageUrl ?? ''
  const visibleCats = categoryItems.filter(c => c.visible !== false).slice(0, 5)
  const [activeCat, setActiveCat] = React.useState(0)
  const activeImg = visibleCats[activeCat]?.imageUrl || modelImgSrc

  return (
    <PhoneShell bgColor={cfg.bgColor}>
      <div style={{ padding: '8px 0 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-8%', top: '-2%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 160, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none' }}>C</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 10 }}>
          <ElWrap id="label" selectedId={selectedId} onSelect={onSelect}><span style={{ fontSize: 7, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{el('label')?.content ?? '[CATEGORIES]'}</span></ElWrap>
          <div style={{ flex: 1, maxWidth: 60, borderTop: '1px dashed #ccc' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '42fr 58fr', gap: 0, alignItems: 'start' }}>
          <ElWrap id="model_image" selectedId={selectedId} onSelect={onSelect} style={{ position: 'relative', height: 130, overflow: 'hidden', background: el('model_image')?.color ?? '#e2e0dc' }}>
            {activeImg
              ? <img key={activeImg} src={activeImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transition: 'opacity 0.3s', pointerEvents: 'none' }} />
              : <div style={{ width: '100%', height: '100%', background: el('model_image')?.color ?? '#e2e0dc' }} />}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '28%', background: cfg.bgColor, clipPath: ARROW_CUT, zIndex: 2, pointerEvents: 'none' }} />
          </ElWrap>
          <div style={{ paddingRight: 12, paddingTop: 2 }}>
            {visibleCats.map((cat, i) => (
              <div key={cat.id} onClick={() => setActiveCat(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e5', padding: `${i === activeCat ? 4 : 2}px 0`, cursor: 'pointer' }}>
                <span style={{ fontSize: 6, fontWeight: 600, color: i === activeCat ? '#0d0d0d' : '#ccc', fontFamily: 'Barlow,sans-serif', width: 16, flexShrink: 0 }}>[{String(i+1).padStart(2,'0')}]</span>
                <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: i === activeCat ? 18 : 11, lineHeight: 1, color: i === activeCat ? (cat.color ?? '#0d0d0d') : '#ccc', textTransform: 'lowercase', flex: 1, textAlign: 'right', paddingRight: 4, transition: 'font-size 0.25s' }}>{cat.name}</span>
                <span style={{ fontSize: 6, color: i === activeCat ? '#888' : '#ccc', fontFamily: 'Barlow,sans-serif', width: 22, textAlign: 'right' }}>({cat.count})</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 12px 0' }}>
          {v('description') && <ElWrap id="description" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 8, lineHeight: 1.8, color: el('description')?.color ?? '#666', fontFamily: 'Barlow,sans-serif', margin: '0 0 8px' }}>{el('description')?.content ?? ''}</p></ElWrap>}
          {v('see_product') && <ElWrap id="see_product" selectedId={selectedId} onSelect={onSelect} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1.5px solid ${el('see_product')?.color ?? '#0d0d0d'}`, borderRadius: 20, padding: '4px 10px' }}><span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: el('see_product')?.color ?? '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>{el('see_product')?.content ?? 'SEE PRODUCT'} →</span></ElWrap>}
        </div>
      </div>
    </PhoneShell>
  )
}

function MobileCarouselPreview({ cfg, accentColor, selectedId, onSelect }: { cfg: PageConfig; accentColor: string; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false
  const cardIds = ['card1','card2','card3','card4','card5','card6']
  const [activeCard, setActiveCard] = React.useState(2)

  return (
    <PhoneShell bgColor={cfg.bgColor}>
      <div style={{ padding: '10px 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0 12px', marginBottom: 14 }}>
          <div>
            {v('title') && <ElWrap id="title" selectedId={selectedId} onSelect={onSelect}><p style={{ fontFamily: 'Barlow,sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '2px', color: el('title')?.color ?? '#0d0d0d', margin: '0 0 2px' }}>{el('title')?.content ?? 'SHOP THE COLLECTIONS'}</p></ElWrap>}
            <div style={{ display: 'flex', gap: 6 }}>
              {v('year') && <ElWrap id="year" selectedId={selectedId} onSelect={onSelect}><span style={{ fontSize: 9, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{el('year')?.content ?? '2026'}</span></ElWrap>}
              {v('other') && <ElWrap id="other" selectedId={selectedId} onSelect={onSelect}><span style={{ fontSize: 9, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{el('other')?.content ?? '[Other]'}</span></ElWrap>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => setActiveCard(c => Math.max(0,c-1))} style={{ width: 24, height: 24, border: '1.5px solid #0d0d0d', borderRadius: '50%', background: 'none', cursor: 'pointer', fontSize: 10, color: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <button onClick={() => setActiveCard(c => Math.min(5,c+1))} style={{ width: 24, height: 24, border: '1.5px solid #0d0d0d', borderRadius: '50%', background: 'none', cursor: 'pointer', fontSize: 10, color: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
          </div>
        </div>
        {/* Cards track */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, paddingLeft: 12, overflowX: 'hidden', paddingBottom: 18 }}>
          {cardIds.map((cardId, i) => {
            const cardEl = el(cardId) as any
            const isActive = i === activeCard
            const w = isActive ? 88 : 62
            const h = isActive ? 128 : 96
            const bg = cardEl?.color ?? '#c8b890'
            const src = cardEl?.imageUrl ?? ''
            const dist = Math.abs(i - activeCard)
            return (
              <ElWrap key={cardId} id={cardId} selectedId={selectedId} onSelect={onSelect} style={{ flexShrink: 0, width: w, height: h, overflow: 'hidden', background: bg, clipPath: CLIP_PATH, cursor: 'pointer', transform: `translateY(${isActive ? -14 : 0}px)`, opacity: dist === 0 ? 1 : dist === 1 ? 0.9 : 0.6, transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', position: 'relative' }} onClick={() => setActiveCard(i)}>
                {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} /> : <div style={{ width: '100%', height: '100%', background: bg }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.28))', pointerEvents: 'none' }} />
                {isActive && v('wear') && <ElWrap id="wear" selectedId={selectedId} onSelect={onSelect} style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center' }}><span style={{ fontSize: 6, color: el('wear')?.color ?? 'rgba(255,255,255,0.9)', fontFamily: 'Barlow,sans-serif' }}>{el('wear')?.content ?? '[Wear the Moment]'}</span></ElWrap>}
              </ElWrap>
            )
          })}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: -12 }}>
          {cardIds.map((_,i) => <div key={i} onClick={() => setActiveCard(i)} style={{ width: i === activeCard ? 16 : 5, height: 3, borderRadius: 2, background: i === activeCard ? '#0d0d0d' : '#ccc', cursor: 'pointer', transition: 'width 0.3s' }} />)}
        </div>
      </div>
    </PhoneShell>
  )
}

function MobileCollectionsPreview({ cfg, accentColor, selectedId, onSelect }: { cfg: PageConfig; accentColor: string; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false
  const modelSrc = el('model_image')?.imageUrl ?? ''
  const featSrc  = el('featured_img')?.imageUrl ?? ''

  return (
    <PhoneShell bgColor={cfg.bgColor}>
      <div style={{ padding: '10px 12px 16px' }}>
        {v('intro') && <ElWrap id="intro" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 8, lineHeight: 1.8, color: el('intro')?.color ?? '#777', fontFamily: 'Barlow,sans-serif', margin: '0 0 10px', textAlign: 'center' }}>{el('intro')?.content ?? ''}</p></ElWrap>}
        {v('model_image') && (
          <ElWrap id="model_image" selectedId={selectedId} onSelect={onSelect} style={{ marginBottom: 10 }}>
            <div style={{ clipPath: 'polygon(20% 0%,100% 0%,100% 20%,75% 20%,100% 45%,100% 80%,70% 100%,20% 100%,0% 80%,30% 65%,0% 45%,0% 20%)', position: 'relative', height: 120, overflow: 'hidden', background: el('model_image')?.color ?? '#d8d4cc' }}>
              <div style={{ position: 'absolute', left: '5%', top: '2%', width: '92%', height: '96%', background: '#e4e1db', clipPath: 'polygon(0% 100%,0% 0%,25% 0%,50% 40%,75% 0%,100% 0%,100% 100%,80% 100%,80% 30%,50% 70%,20% 30%,20% 100%)', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
                {modelSrc ? <img src={modelSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', pointerEvents: 'none' }} /> : null}
                <div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: 6, background: cfg.bgColor, zIndex: 3 }} />
              </div>
            </div>
            {v('caption') && <ElWrap id="caption" selectedId={selectedId} onSelect={onSelect}><p style={{ margin: '6px 0 0', fontSize: 7, color: el('caption')?.color ?? '#aaa', fontFamily: 'Barlow,sans-serif', fontStyle: 'italic' }}>{el('caption')?.content ?? ''}</p></ElWrap>}
          </ElWrap>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px', gap: 10, alignItems: 'start', paddingBottom: 10, borderBottom: '1px solid #e8e8e5', marginBottom: 4 }}>
          <div>
            {v('feat_title') && <ElWrap id="feat_title" selectedId={selectedId} onSelect={onSelect}><h3 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 18, lineHeight: 0.98, color: el('feat_title')?.color ?? '#0d0d0d', margin: '0 0 5px' }}>{el('feat_title')?.content ?? 'Statement Pieces 2025'}</h3></ElWrap>}
            {v('feat_desc') && <ElWrap id="feat_desc" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 8, lineHeight: 1.7, color: el('feat_desc')?.color ?? '#888', fontFamily: 'Barlow,sans-serif', margin: '0 0 8px' }}>{el('feat_desc')?.content ?? ''}</p></ElWrap>}
            {v('feat_btn') && <ElWrap id="feat_btn" selectedId={selectedId} onSelect={onSelect} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1.5px solid #0d0d0d', borderRadius: 20, padding: '3px 9px' }}><span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0d0d0d', fontFamily: 'Barlow,sans-serif' }}>{el('feat_btn')?.content ?? 'GET STARTED'} →</span></ElWrap>}
          </div>
          <ElWrap id="featured_img" selectedId={selectedId} onSelect={onSelect} style={{ width: 56, height: 56, overflow: 'hidden', background: el('featured_img')?.color ?? '#b8c8b8', clipPath: FEAT_POLY }}>
            {featSrc ? <img src={featSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none' }} /> : null}
          </ElWrap>
        </div>
        {['col1','col2','col3'].map(id => v(id) ? (
          <ElWrap key={id} id={id} selectedId={selectedId} onSelect={onSelect} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8e8e5' }}>
            <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 14, color: el(id)?.color ?? '#555' }}>{el(id)?.content ?? id}</span>
            <div style={{ width: 22, height: 22, border: '1.5px solid #ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 9, color: '#bbb' }}>→</span></div>
          </ElWrap>
        ) : null)}
      </div>
    </PhoneShell>
  )
}

function MobileFooterPreview({ cfg, selectedId, onSelect }: { cfg: PageConfig; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const el = (id: string) => cfg.elements.find(e => e.id === id)
  const v  = (id: string) => el(id)?.visible !== false
  const isFooter = true

  return (
    <PhoneShell bgColor={cfg.bgColor}>
      <div style={{ padding: '14px 12px 20px' }}>
        {v('headline') && <ElWrap id="headline" selectedId={selectedId} onSelect={onSelect}><h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 20, lineHeight: 1.05, color: el('headline')?.color ?? '#fff', margin: '0 0 12px', whiteSpace: 'pre-line' }}>{el('headline')?.content ?? ''}</h2></ElWrap>}
        <ElWrap id="email_row" selectedId={selectedId} onSelect={onSelect} style={{ display: 'flex', gap: 0, marginBottom: 14, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '6px 8px', fontSize: 8, color: el('email_row')?.color ?? '#555', fontFamily: 'Barlow,sans-serif' }}>{el('email_row')?.content ?? 'Send email to us'}</div>
          <div style={{ background: '#f04e0f', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: '#fff' }}>→</span></div>
        </ElWrap>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['location','📍'],['email','✉'],['phone','📞'],['hours','🕐']].map(([id, icon]) => v(id) ? (
            <ElWrap key={id} id={id} selectedId={selectedId} onSelect={onSelect}>
              <p style={{ fontSize: 7, color: el(id)?.color ?? '#888', fontFamily: 'Barlow,sans-serif', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{icon} {el(id)?.content ?? ''}</p>
            </ElWrap>
          ) : null)}
        </div>
        {v('copyright') && <ElWrap id="copyright" selectedId={selectedId} onSelect={onSelect}><p style={{ fontSize: 7, color: el('copyright')?.color ?? '#444', fontFamily: 'Barlow,sans-serif', margin: '14px 0 0', textAlign: 'center' }}>{el('copyright')?.content ?? ''}</p></ElWrap>}
      </div>
    </PhoneShell>
  )
}

// ── Mobile Element Property Panel (for mobileConfigs PageElement) ──
function MobileElementPanel({
  pageId, selected, uploading,
  onUpdate, onUpload, onResetPos, accentColor,
}: {
  pageId: PageId
  selected?: PageElement
  uploading: boolean
  accentColor: string
  onUpdate: (id: string, patch: Partial<PageElement>) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  onResetPos: (id: string) => void
}) {
  if (!selected) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 48, color: '#ccc' }}>
        <Layers size={24} style={{ margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 11, lineHeight: 1.6, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>Click an element<br/>in the list to edit</p>
      </div>
    )
  }

  return (
    <>
      {/* Header: label + visibility toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f0ee' }}>
        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, fontFamily: 'Barlow,sans-serif' }}>{selected.label}</p>
        <button onClick={() => onUpdate(selected.id, { visible: !selected.visible })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selected.visible ? '#0d0d0d' : '#ccc' }}>
          {selected.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {/* Position X/Y — same as desktop */}
      <PropRow label="Position X (%)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min={0} max={92} value={selected.x} onChange={e => onUpdate(selected.id, { x: +e.target.value })} style={{ flex: 1 }} />
          <input type="number" value={selected.x} onChange={e => onUpdate(selected.id, { x: +e.target.value })} style={{ width: 42, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 5px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
        </div>
      </PropRow>
      <PropRow label="Position Y (%)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min={0} max={92} value={selected.y} onChange={e => onUpdate(selected.id, { y: +e.target.value })} style={{ flex: 1 }} />
          <input type="number" value={selected.y} onChange={e => onUpdate(selected.id, { y: +e.target.value })} style={{ width: 42, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 5px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
        </div>
      </PropRow>

      {selected.isImage ? (
        <>
          <PropRow label="Image">
            {selected.imageUrl ? (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img src={selected.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => onUpdate(selected.id, { imageUrl: '' })} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0de', borderRadius: 8, padding: '16px 12px', cursor: 'pointer', gap: 5, marginBottom: 8 }}>
                <ImageIcon size={20} color="#ccc" />
                <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploading ? 'Uploading…' : 'Click to upload'}</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onUpload(e, selected.id)} disabled={uploading} />
              </label>
            )}
          </PropRow>
          <PropRow label="Width (% of page)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={5} max={95} value={selected.width ?? 20} onChange={e => onUpdate(selected.id, { width: +e.target.value })} style={{ flex: 1 }} />
              <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selected.width ?? 20}%</span>
            </div>
          </PropRow>
          <PropRow label="Height (% of canvas)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={5} max={100} value={selected.height ?? 30} onChange={e => onUpdate(selected.id, { height: +e.target.value })} style={{ flex: 1 }} />
              <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selected.height ?? 30}%</span>
            </div>
          </PropRow>
          <PropRow label={`Zoom: ${Math.round((selected.zoom ?? 1) * 100)}%`}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={50} max={200} step={1} value={Math.round((selected.zoom ?? 1) * 100)} onChange={e => onUpdate(selected.id, { zoom: +e.target.value / 100 })} style={{ flex: 1 }} />
              <button onClick={() => onUpdate(selected.id, { zoom: 1 })} style={{ fontSize: 10, color: '#aaa', background: 'none', border: '1px solid #e8e8e5', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Reset</button>
            </div>
          </PropRow>
          <PropRow label="Image Focus">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 5 }}>
              {[['Top','top center'],['Center','center center'],['Bottom','bottom center'],['Left','center left'],['Right','center right'],['Top L','top left']].map(([lbl,val]) => (
                <button key={val} onClick={() => onUpdate(selected.id, { objectPosition: val })} style={{ padding: '4px', fontSize: 9, borderRadius: 5, border: `1px solid ${(selected.objectPosition ?? 'top center') === val ? accentColor : '#e8e8e5'}`, background: (selected.objectPosition ?? 'top center') === val ? '#fff4f0' : '#fff', cursor: 'pointer', color: (selected.objectPosition ?? 'top center') === val ? accentColor : '#666', fontFamily: 'Barlow,sans-serif' }}>{lbl}</button>
              ))}
            </div>
            <input type="text" value={selected.objectPosition ?? 'top center'} onChange={e => onUpdate(selected.id, { objectPosition: e.target.value })} placeholder="e.g. 50% 20%" style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const }} />
          </PropRow>
          <PropRow label="Placeholder Color">
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="color" value={selected.color ?? '#dddddd'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ width: 32, height: 32, border: '1px solid #e8e8e5', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={selected.color ?? '#dddddd'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 7px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
        </>
      ) : (
        <>
          {selected.content !== undefined && (
            <PropRow label="Content">
              <textarea value={selected.content} onChange={e => onUpdate(selected.id, { content: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '7px 9px', fontSize: 11, fontFamily: 'Barlow,sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' as const }} />
            </PropRow>
          )}
          {selected.fontSize !== undefined && (
            <PropRow label={`Font Size: ${selected.fontSize}px`}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="range" min={7} max={120} value={selected.fontSize} onChange={e => onUpdate(selected.id, { fontSize: +e.target.value })} style={{ flex: 1 }} />
                <input type="number" value={selected.fontSize} onChange={e => onUpdate(selected.id, { fontSize: +e.target.value })} style={{ width: 42, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 5px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
              </div>
            </PropRow>
          )}
          <PropRow label="Text Color">
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="color" value={selected.color ?? '#000000'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ width: 32, height: 32, border: '1px solid #e8e8e5', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
              <input type="text" value={selected.color ?? '#000000'} onChange={e => onUpdate(selected.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 7px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </PropRow>
        </>
      )}

      {/* Reset position — same as desktop */}
      <button onClick={() => onResetPos(selected.id)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', color: '#666', marginTop: 10 }}>
        ↺ Reset Position
      </button>
    </>
  )
}

// ── Main Mobile Page Editor ──
function MobilePageEditor({
  pages, configs, activePage, selectedEl, uploading, categoryItems,
  onActivePage, onSelectedEl, onUpdateEl, onResetPage, onUpload, onColorChange, sideBtn,
}: {
  pages: PageId[]
  configs: Record<PageId, PageConfig>
  activePage: PageId
  selectedEl: string | null
  uploading: boolean
  categoryItems: CategoryItem[]
  onActivePage: (page: PageId) => void
  onSelectedEl: (id: string | null) => void
  onUpdateEl: (id: string, patch: Partial<PageElement>) => void
  onResetPage: () => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  onColorChange: (key: 'bgColor' | 'accentColor', value: string) => void
  sideBtn: (active: boolean) => React.CSSProperties
}) {
  const cfg    = configs[activePage]
  const selEl  = cfg.elements.find(e => e.id === selectedEl)

  // Section-specific preview — passes onSelect so elements are clickable
  const renderPreview = () => {
    const selectProps = { selectedId: selectedEl, onSelect: onSelectedEl }
    switch (activePage) {
      case 'hero':             return <MobileHeroPreview cfg={cfg} accentColor={cfg.accentColor} {...selectProps} />
      case 'featured_moments': return <MobileFeaturedPreview cfg={cfg} accentColor={cfg.accentColor} {...selectProps} />
      case 'categories':       return <MobileCategoriesPreview cfg={cfg} categoryItems={categoryItems} {...selectProps} />
      case 'carousel':         return <MobileCarouselPreview cfg={cfg} accentColor={cfg.accentColor} {...selectProps} />
      case 'collections':      return <MobileCollectionsPreview cfg={cfg} accentColor={cfg.accentColor} {...selectProps} />
      case 'footer':           return <MobileFooterPreview cfg={cfg} {...selectProps} />
      default:                 return null
    }
  }

  return (
    <>
      {/* ── Left sidebar: section list ── */}
      <div style={{ width: 164, background: '#fff', borderRight: '1px solid #e8e8e5', overflowY: 'auto', flexShrink: 0, padding: '10px 6px' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', padding: '4px 8px 10px', fontFamily: 'Barlow,sans-serif' }}>SECTIONS</p>
        {pages.map(pid => {
          const c = configs[pid]
          return (
            <button key={pid} onClick={() => { onActivePage(pid); onSelectedEl(null) }} style={sideBtn(activePage === pid)}>
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: activePage === pid ? '#0d0d0d' : '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</p>
                <p style={{ fontSize: 9, color: '#aaa', margin: 0 }}>{c.elements.length} elements</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Center: phone preview + controls ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#e8e7e4', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Info banner */}
        <div style={{ background: '#eef4ff', border: '1px solid #c7d7f8', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Smartphone size={13} color="#4b72e8" />
          <span style={{ fontSize: 11, color: '#2a4db8', fontFamily: 'Barlow,sans-serif', lineHeight: 1.5, flex: 1 }}>
            <strong>Mobile editor</strong> — live preview matches actual mobile layout. Click elements in the right panel to edit. Changes only affect mobile screens.
          </span>
          <button onClick={() => { onResetPage(); onSelectedEl(null) }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 10, fontFamily: 'Barlow,sans-serif', color: '#666', flexShrink: 0 }}>
            <RotateCcw size={10} /> Reset
          </button>
        </div>

        {/* Visibility chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {cfg.elements.map(e => (
            <button key={e.id} onClick={() => { onUpdateEl(e.id, { visible: !e.visible }); onSelectedEl(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 16, border: 'none', cursor: 'pointer', background: e.visible ? '#0d0d0d' : '#e0e0de', color: e.visible ? '#fff' : '#888', fontSize: 9, fontFamily: 'Barlow,sans-serif', transition: 'all 0.12s' }}>
              {e.visible ? <Eye size={8} /> : <EyeOff size={8} />}{e.label}
            </button>
          ))}
        </div>

        {/* Phone preview */}
        {renderPreview()}

        {/* Page background color */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {([['Section Background', 'bgColor'], ['Accent Color', 'accentColor']] as const).map(([lbTxt, key]) => (
            <div key={key}>
              <label style={{ ...lbl10, marginBottom: 6, fontSize: 9 }}>{lbTxt}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <input type="color" value={key === 'bgColor' ? cfg.bgColor : cfg.accentColor} onChange={e => onColorChange(key, e.target.value)} style={{ width: 30, height: 30, border: '1px solid #e8e8e5', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                <code style={{ fontSize: 10, color: '#666' }}>{key === 'bgColor' ? cfg.bgColor : cfg.accentColor}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: element list + property editor ── */}
      <div style={{ width: 248, borderLeft: '1px solid #e8e8e5', background: '#fff', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Element list header */}
        <div style={{ padding: '11px 14px 10px', borderBottom: '1px solid #f0f0ee', background: '#fafaf9', flexShrink: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, margin: 0, fontFamily: 'Barlow,sans-serif' }}>{cfg.label} — Elements</p>
          <p style={{ fontSize: 9, color: '#aaa', margin: '2px 0 0', fontFamily: 'Barlow,sans-serif' }}>Click to select · edit properties below</p>
        </div>

        {/* Scrollable list */}
        <div style={{ overflowY: 'auto', borderBottom: '1px solid #f0f0ee' }}>
          {cfg.elements.map((e, i) => (
            <button key={e.id} onClick={() => onSelectedEl(selectedEl === e.id ? null : e.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', border: 'none', cursor: 'pointer', background: selectedEl === e.id ? '#fff8f6' : '#fff', borderLeft: `3px solid ${selectedEl === e.id ? '#f04e0f' : 'transparent'}`, marginBottom: 0, textAlign: 'left', transition: 'background 0.1s', opacity: e.visible ? 1 : 0.4 }}
              onMouseEnter={ev => { if (selectedEl !== e.id) ev.currentTarget.style.background = '#f5f5f3' }}
              onMouseLeave={ev => { if (selectedEl !== e.id) ev.currentTarget.style.background = '#fff' }}
            >
              {/* Type badge */}
              <div style={{ width: 26, height: 26, borderRadius: 6, background: e.isImage ? '#e8f0fe' : e.type === 'product_card' ? '#fff4f0' : e.type === 'avatars' ? '#f0fff4' : '#f0efed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {e.isImage ? <ImageIcon size={12} color="#4b72e8" /> : <span style={{ fontSize: 9, fontWeight: 700, color: '#666' }}>T</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, margin: 0, fontFamily: 'Barlow,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selectedEl === e.id ? '#f04e0f' : '#0d0d0d' }}>{e.label}</p>
                <p style={{ fontSize: 9, color: '#aaa', margin: 0, fontFamily: 'Barlow,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.isImage ? (e.imageUrl ? '● Image set' : '○ No image') : (e.content ?? '—').replace(/\n/g,' ').slice(0,26)}
                </p>
              </div>
              <span style={{ fontSize: 9, color: '#ccc', fontFamily: 'Barlow,sans-serif', flexShrink: 0 }}>#{i+1}</span>
            </button>
          ))}
        </div>

        {/* Property editor below list */}
        <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>
          <MobileElementPanel
            pageId={activePage}
            selected={selEl}
            uploading={uploading}
            accentColor={cfg.accentColor}
            onUpdate={onUpdateEl}
            onUpload={onUpload}
            onResetPos={(id) => {
              const mobileDefaults = buildDeviceDefaults('mobile')
              const d = mobileDefaults[activePage]?.elements.find((x: any) => x.id === id)
              if (d) onUpdateEl(id, { x: d.x, y: d.y })
            }}
          />
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [tab,        setTab]        = useState<Tab>('desktop')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  // ── Desktop editor state ──
  const [activePage,    setActivePage]    = useState<PageId>('hero')
  const [configs,       setConfigs]       = useState<Record<PageId, PageConfig>>({ ...DESKTOP_DEFAULTS })
  const [selectedEl,    setSelectedEl]    = useState<string | null>(null)
  const [uploadingImg,  setUploadingImg]  = useState(false)
  const [uploadingCatImg, setUploadingCatImg] = useState<string | null>(null)
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(DEFAULT_CAT_ITEMS)

  // ── Tablet/mobile canvas editor state ──
  const [activeTabletPage, setActiveTabletPage] = useState<PageId>('hero')
  const [tabletConfigs, setTabletConfigs] = useState<Record<PageId, PageConfig>>(buildDeviceDefaults('tablet'))
  const [selectedTabletEl, setSelectedTabletEl] = useState<string | null>(null)
  const [uploadingTabletImg, setUploadingTabletImg] = useState(false)

  const [activeMobileCanvasPage, setActiveMobileCanvasPage] = useState<PageId>('hero')
  const [mobileConfigs, setMobileConfigs] = useState<Record<PageId, PageConfig>>(buildDeviceDefaults('mobile'))
  const [selectedMobileCanvasEl, setSelectedMobileCanvasEl] = useState<string | null>(null)
  const [uploadingMobileCanvasImg, setUploadingMobileCanvasImg] = useState(false)

  // ── Mobile editor state ──
  const [activeMobilePage, setActiveMobilePage] = useState<MobilePageId>('mobile_hero')
  const [mobileSections,   setMobileSections]   = useState<Record<MobilePageId, MobileSectionConfig>>({ ...MOBILE_SECTION_DEFAULTS })
  const [selectedMobileEl, setSelectedMobileEl] = useState<string | null>(null)
  const [uploadingMobileImg, setUploadingMobileImg] = useState(false)

  // ── Store settings ──
  const [brandName,    setBrandName]    = useState('CALVAC')
  const [whatsapp,     setWhatsapp]     = useState('')
  const [announcement, setAnnouncement] = useState('Free Shipping on Orders Above ₹2000 · New Drop Every Friday')
  const [instagram,    setInstagram]    = useState('')

  // ── Load from Supabase ──
  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => {
      if (!data) return
      setBrandName(data.brand_name ?? 'CALVAC')
      setWhatsapp(data.whatsapp_number ?? '')
      setAnnouncement(data.announcement_text ?? '')
      setInstagram(data.instagram_url ?? '')
      if (data.page_configs) {
        try {
          const pc = JSON.parse(data.page_configs)
          setConfigs(prev => ({ ...prev, ...pc }))
          if (pc?._tabletConfigs) setTabletConfigs(prev => ({ ...prev, ...pc._tabletConfigs }))
          if (pc?._mobileConfigs) setMobileConfigs(prev => ({ ...prev, ...pc._mobileConfigs }))
          if (pc?._categoryItems)   setCategoryItems(pc._categoryItems)
          if (pc?._mobileSections)  setMobileSections(prev => ({ ...prev, ...pc._mobileSections }))
        } catch {}
      }
    })
  }, [])

  // ── Desktop helpers ──
  const cfg   = configs[activePage]
  const selEl = cfg.elements.find(e => e.id === selectedEl)

  const updateEl = (id: string, patch: Partial<PageElement>) =>
    setConfigs(c => ({ ...c, [activePage]: { ...c[activePage], elements: c[activePage].elements.map(e => e.id === id ? { ...e, ...patch } : e) } }))

  const updateTabletEl = (id: string, patch: Partial<PageElement>) =>
    setTabletConfigs(c => ({ ...c, [activeTabletPage]: { ...c[activeTabletPage], elements: c[activeTabletPage].elements.map(e => e.id === id ? { ...e, ...patch } : e) } }))

  const updateMobileCanvasEl = (id: string, patch: Partial<PageElement>) =>
    setMobileConfigs(c => ({ ...c, [activeMobileCanvasPage]: { ...c[activeMobileCanvasPage], elements: c[activeMobileCanvasPage].elements.map(e => e.id === id ? { ...e, ...patch } : e) } }))

  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, elId: string) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingImg(true)
    try {
      const path = `page-editor/${activePage}/${elId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      updateEl(elId, { imageUrl: data.publicUrl })
    } catch { alert('Upload failed. Check Supabase storage.') }
    finally { setUploadingImg(false) }
  }

  const handleDeviceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    elId: string,
    device: 'tablet' | 'mobile',
  ) => {
    const file = e.target.files?.[0]; if (!file) return
    const setUploading = device === 'tablet' ? setUploadingTabletImg : setUploadingMobileCanvasImg
    const pageId = device === 'tablet' ? activeTabletPage : activeMobileCanvasPage
    const update = device === 'tablet' ? updateTabletEl : updateMobileCanvasEl
    setUploading(true)
    try {
      const path = `page-editor/${device}/${pageId}/${elId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      update(elId, { imageUrl: data.publicUrl })
    } catch { alert('Upload failed. Check Supabase storage.') }
    finally { setUploading(false) }
  }

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingCatImg(catId)
    try {
      const path = `page-editor/categories/${catId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setCategoryItems(items => items.map(c => c.id === catId ? { ...c, imageUrl: data.publicUrl } : c))
    } catch { alert('Upload failed.') }
    finally { setUploadingCatImg(null) }
  }

  const updateCatItem  = (id: string, patch: Partial<CategoryItem>) => setCategoryItems(items => items.map(c => c.id === id ? { ...c, ...patch } : c))
  const addCatItem     = () => { const id = `cat_${Date.now()}`; setCategoryItems(items => [...items, { id, name: 'new category', visible: true, imageUrl: '', count: 0, fontSize: 22, color: '#cccccc' }]); setSelectedCatId(id) }
  const removeCatItem  = (id: string) => { setCategoryItems(items => items.filter(c => c.id !== id)); if (selectedCatId === id) setSelectedCatId(null) }
  const moveCatItem    = (id: string, dir: -1 | 1) => setCategoryItems(items => {
    const idx = items.findIndex(c => c.id === id); if (idx < 0) return items
    const next = idx + dir; if (next < 0 || next >= items.length) return items
    const arr = [...items]; [arr[idx], arr[next]] = [arr[next], arr[idx]]; return arr
  })

  // ── Mobile helpers ──
  const activeMobileSection = mobileSections[activeMobilePage]
  const selMobileEl = activeMobileSection.elements.find(e => e.id === selectedMobileEl)

  const updateMobileEl = (elId: string, patch: Partial<MobileElement>) =>
    setMobileSections(s => ({ ...s, [activeMobilePage]: { ...s[activeMobilePage], elements: s[activeMobilePage].elements.map(e => e.id === elId ? { ...e, ...patch } : e) } }))

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, elId: string) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingMobileImg(true)
    try {
      const path = `page-editor/mobile/${activeMobilePage}/${elId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      updateMobileEl(elId, { imageUrl: data.publicUrl })
    } catch { alert('Upload failed.') }
    finally { setUploadingMobileImg(false) }
  }

  // ── Save ──
  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: row } = await supabase.from('site_settings').select('id').single()
      if (!row?.id) throw new Error('No settings row')
      await supabase.from('site_settings').update({
        brand_name: brandName, whatsapp_number: whatsapp,
        announcement_text: announcement, instagram_url: instagram,
        hero_config: JSON.stringify(configs.hero),
        page_configs: JSON.stringify({ ...configs, _tabletConfigs: tabletConfigs, _mobileConfigs: mobileConfigs, _categoryItems: categoryItems, _mobileSections: mobileSections }),
        updated_at: new Date().toISOString(),
      }).eq('id', row.id)

      // Sync categories to DB
      if (categoryItems.length > 0) {
        const { data: existingCats } = await supabase.from('categories').select('id, slug')
        const existingSlugs = new Set((existingCats ?? []).map((c: any) => c.slug))
        for (const item of categoryItems) {
          const slug = item.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (!slug) continue
          if (existingSlugs.has(slug)) {
            await supabase.from('categories').update({ name: item.name.charAt(0).toUpperCase() + item.name.slice(1) }).eq('slug', slug)
          } else {
            await supabase.from('categories').insert({ name: item.name.charAt(0).toUpperCase() + item.name.slice(1), slug, description: null })
          }
        }
        const activeSlugs = categoryItems.map(c => c.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).filter(Boolean)
        const toRemove = (existingCats ?? []).filter((c: any) => !activeSlugs.includes(c.slug))
        for (const cat of toRemove) {
          const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', cat.id)
          if (!count || count === 0) await supabase.from('categories').delete().eq('id', cat.id)
        }
      }

      await fetch('/api/revalidate', { method: 'POST' }).catch(() => null)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  const desktopPages: PageId[] = ['hero', 'featured_moments', 'categories', 'carousel', 'collections', 'footer']
  const mobilePages: MobilePageId[] = ['mobile_hero', 'mobile_featured', 'mobile_categories', 'mobile_carousel', 'mobile_collections', 'mobile_footer']

  // ── Shared sidebar button style ──
  const sideBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 10px', border: 'none', cursor: 'pointer', borderRadius: 10,
    background: active ? '#f0efed' : 'transparent',
    borderLeft: active ? '3px solid #f04e0f' : '3px solid transparent',
    fontFamily: 'Barlow,sans-serif', textAlign: 'left', marginBottom: 2,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Barlow,sans-serif', background: '#f0efed' }}>

      {/* ── Top Bar ── */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e8e8e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 22, margin: 0 }}>Landing Page Editor</h1>
          <p style={{ fontSize: 11, color: '#aaa', margin: '1px 0 0' }}>Edit every section of your storefront</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 3, background: '#f0efed', padding: 3, borderRadius: 12, flexShrink: 0 }}>
          {([
            ['desktop',      'Desktop',      Monitor],
            ['tablet',       'Tablet',       Tablet],
            ['mobile',       'Mobile',       Smartphone],
            ['store',        'Store Info',   Settings],
            ['announcement', 'Announcement', Bell],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id as Tab)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: 'none', background: tab === id ? '#fff' : 'transparent', color: tab === id ? '#0d0d0d' : '#888', fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 40, border: 'none', background: saved ? '#16a34a' : '#0d0d0d', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', transition: 'background 0.2s', flexShrink: 0 }}>
          <Save size={14} />{saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save All'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ════════════════════════════════════════
            DESKTOP EDITOR TAB
        ════════════════════════════════════════ */}
        {tab === 'desktop' && (
          <>
            {/* Left sidebar — page list */}
            <div style={{ width: 170, background: '#fff', borderRight: '1px solid #e8e8e5', overflowY: 'auto', flexShrink: 0, padding: '10px 6px' }}>
              <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', padding: '4px 8px 10px', fontFamily: 'Barlow,sans-serif' }}>PAGES</p>
              {desktopPages.map(pid => {
                const c = configs[pid]
                return (
                  <button key={pid} onClick={() => { setActivePage(pid); setSelectedEl(null) }} style={sideBtn(activePage === pid)}>
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: activePage === pid ? '#0d0d0d' : '#666', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{c.elements.length} elements</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Center canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#e8e7e4' }}>
              <div style={{ background: '#fffbe6', border: '1px solid #f0d060', borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>💡</span>
                <span style={{ fontSize: 11, color: '#7a6000', fontFamily: 'Barlow,sans-serif', lineHeight: 1.5 }}>
                  <strong>Desktop editor</strong> — drag elements to reposition. Images fall back to product DB images if not uploaded here.
                </span>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Move size={12} color="#888" />
                  <span style={{ fontSize: 11, color: '#888', fontFamily: 'Barlow,sans-serif' }}>Drag to reposition · Click to select · Edit in panel →</span>
                </div>
                <button onClick={() => { setConfigs(c => ({ ...c, [activePage]: { ...DESKTOP_DEFAULTS[activePage] } })); setSelectedEl(null) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow,sans-serif', color: '#666' }}>
                  <RotateCcw size={11} /> Reset Page
                </button>
              </div>

              {/* Visibility chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {cfg.elements.map(e => (
                  <button key={e.id} onClick={() => updateEl(e.id, { visible: !e.visible })} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: e.visible ? '#0d0d0d' : '#e0e0de', color: e.visible ? '#fff' : '#888', fontSize: 10, fontFamily: 'Barlow,sans-serif', transition: 'all 0.15s' }}>
                    {e.visible ? <Eye size={9} /> : <EyeOff size={9} />}{e.label}
                  </button>
                ))}
              </div>

              <DesktopPageCanvas
                config={activePage === 'categories' ? { ...cfg, _items: categoryItems } as any : cfg}
                selectedId={selectedEl}
                onSelect={setSelectedEl}
                onDrag={(id, x, y) => updateEl(id, { x, y })}
              />

              {/* Page colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, background: '#fff', borderRadius: 12, padding: 14 }}>
                {([['Page Background', 'bgColor'], ['Accent Color', 'accentColor']] as const).map(([label, key]) => (
                  <div key={key}>
                    <label style={{ ...lbl10, marginBottom: 8 }}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={key === 'bgColor' ? cfg.bgColor : cfg.accentColor} onChange={e => setConfigs(c => ({ ...c, [activePage]: { ...c[activePage], [key]: e.target.value } }))} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      <code style={{ fontSize: 11, color: '#666' }}>{key === 'bgColor' ? cfg.bgColor : cfg.accentColor}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — desktop properties panel */}
            <div style={{ width: 230, borderLeft: '1px solid #e8e8e5', background: '#fff', overflowY: 'auto', padding: 14, flexShrink: 0 }}>
              {activePage === 'categories' ? (
                /* Category Items manager */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f0ee' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Category Items</p>
                    <button onClick={addCatItem} style={{ background: '#f04e0f', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', fontWeight: 600 }}>+ Add</button>
                  </div>
                  {categoryItems.map((cat) => (
                    <div key={cat.id} style={{ border: `1.5px solid ${selectedCatId === cat.id ? '#f04e0f' : '#e8e8e5'}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden', opacity: cat.visible ? 1 : 0.45 }}>
                      <div onClick={() => setSelectedCatId(cat.id === selectedCatId ? null : cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: selectedCatId === cat.id ? '#fff8f6' : '#fff', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); moveCatItem(cat.id, -1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 9, color: '#ccc', lineHeight: 1 }}>▲</button>
                          <button onClick={e => { e.stopPropagation(); moveCatItem(cat.id, 1) }}  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 9, color: '#ccc', lineHeight: 1 }}>▼</button>
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 4, background: cat.imageUrl ? `url(${cat.imageUrl}) center/cover` : '#e8e8e5', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!cat.imageUrl && <ImageIcon size={12} color="#ccc" />}
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'Barlow,sans-serif', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                        <button onClick={e => { e.stopPropagation(); updateCatItem(cat.id, { visible: !cat.visible }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                          {cat.visible ? <Eye size={14} color="#0d0d0d" /> : <EyeOff size={14} color="#ccc" />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); if (confirm('Remove?')) removeCatItem(cat.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, color: '#ccc', flexShrink: 0, lineHeight: 1 }}>×</button>
                      </div>
                      {selectedCatId === cat.id && (
                        <div onClick={e => e.stopPropagation()} style={{ padding: '10px 10px 12px', borderTop: '1px solid #f0f0ee', background: '#fafaf9' }}>
                          {[['Name', 'text', cat.name, (v: string) => updateCatItem(cat.id, { name: v })], ['Count', 'number', String(cat.count), (v: string) => updateCatItem(cat.id, { count: +v })]].map(([lbStr, type, val, cb]: any) => (
                            <div key={lbStr} style={{ marginBottom: 10 }}>
                              <label style={{ ...lbl10, fontSize: 9, marginBottom: 5 }}>{lbStr}</label>
                              <input type={type} value={val} onChange={e => cb(e.target.value)} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }} />
                            </div>
                          ))}
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ ...lbl10, fontSize: 9, marginBottom: 5 }}>Font Size: {cat.fontSize}px</label>
                            <input type="range" min={16} max={120} value={cat.fontSize} onChange={e => updateCatItem(cat.id, { fontSize: +e.target.value })} style={{ width: '100%' }} />
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ ...lbl10, fontSize: 9, marginBottom: 5 }}>Color</label>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={cat.color} onChange={e => updateCatItem(cat.id, { color: e.target.value })} style={{ width: 30, height: 30, border: '1px solid #e8e8e5', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                              <input type="text" value={cat.color} onChange={e => updateCatItem(cat.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 7px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...lbl10, fontSize: 9, marginBottom: 5 }}>Category Image</label>
                            {cat.imageUrl ? (
                              <div style={{ position: 'relative' }}>
                                <img src={cat.imageUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                                <button onClick={() => updateCatItem(cat.id, { imageUrl: '' })} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}>×</button>
                              </div>
                            ) : (
                              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px dashed #e0e0de', borderRadius: 6, padding: '12px 8px', cursor: 'pointer', gap: 4 }}>
                                <ImageIcon size={16} color="#ccc" />
                                <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploadingCatImg === cat.id ? 'Uploading…' : 'Upload image'}</span>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleCatImageUpload(e, cat.id)} disabled={uploadingCatImg !== null} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <p style={{ fontSize: 10, color: '#aaa', marginTop: 12, lineHeight: 1.6, fontFamily: 'Barlow,sans-serif' }}>▲▼ reorder · 👁 show/hide · × delete</p>
                </div>
              ) : !selEl ? (
                <div style={{ textAlign: 'center', paddingTop: 60, color: '#ccc' }}>
                  <Layers size={26} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>Click an element<br/>on the canvas to edit</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0ee' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{selEl.label}</p>
                    <button onClick={() => updateEl(selEl.id, { visible: !selEl.visible })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selEl.visible ? '#0d0d0d' : '#ccc' }}>
                      {selEl.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <PropRow label="Position X (%)">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" min={0} max={92} value={selEl.x} onChange={e => updateEl(selEl.id, { x: +e.target.value })} style={{ flex: 1 }} />
                      <input type="number" value={selEl.x} onChange={e => updateEl(selEl.id, { x: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                    </div>
                  </PropRow>
                  <PropRow label="Position Y (%)">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" min={0} max={92} value={selEl.y} onChange={e => updateEl(selEl.id, { y: +e.target.value })} style={{ flex: 1 }} />
                      <input type="number" value={selEl.y} onChange={e => updateEl(selEl.id, { y: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                    </div>
                  </PropRow>
                  {selEl.isImage ? (
                    <>
                      <PropRow label="Image">
                        {selEl.imageUrl ? (
                          <div style={{ position: 'relative', marginBottom: 8 }}>
                            <img src={selEl.imageUrl} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} />
                            <button onClick={() => updateEl(selEl.id, { imageUrl: '' })} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0de', borderRadius: 8, padding: '18px 12px', cursor: 'pointer', gap: 6, marginBottom: 8 }}>
                            <ImageIcon size={20} color="#ccc" />
                            <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploadingImg ? 'Uploading…' : 'Click to upload'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleDesktopImageUpload(e, selEl.id)} disabled={uploadingImg} />
                          </label>
                        )}
                      </PropRow>
                      <PropRow label="Width (% of page)">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={5} max={60} value={selEl.width ?? 20} onChange={e => updateEl(selEl.id, { width: +e.target.value })} style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selEl.width ?? 20}%</span>
                        </div>
                      </PropRow>
                      <PropRow label="Height (% of canvas)">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={5} max={100} value={selEl.height ?? 30} onChange={e => updateEl(selEl.id, { height: +e.target.value })} style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selEl.height ?? 30}%</span>
                        </div>
                      </PropRow>
                      <PropRow label={`Zoom: ${Math.round((selEl.zoom ?? 1) * 100)}%`}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={50} max={200} step={1} value={Math.round((selEl.zoom ?? 1) * 100)} onChange={e => updateEl(selEl.id, { zoom: +e.target.value / 100 })} style={{ flex: 1 }} />
                          <button onClick={() => updateEl(selEl.id, { zoom: 1 })} style={{ fontSize: 10, color: '#aaa', background: 'none', border: '1px solid #e8e8e5', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Reset</button>
                        </div>
                      </PropRow>
                      <PropRow label="Image Focus">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
                          {[{ label: 'Top', val: 'top center' }, { label: 'Center', val: 'center center' }, { label: 'Bottom', val: 'bottom center' }, { label: 'Left', val: 'center left' }, { label: 'Right', val: 'center right' }, { label: 'Top L', val: 'top left' }].map(opt => (
                            <button key={opt.val} onClick={() => updateEl(selEl.id, { objectPosition: opt.val })} style={{ padding: '5px 4px', fontSize: 10, borderRadius: 5, border: `1px solid ${(selEl.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#e8e8e5'}`, background: (selEl.objectPosition ?? 'top center') === opt.val ? '#fff4f0' : '#fff', cursor: 'pointer', color: (selEl.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#666', fontFamily: 'Barlow,sans-serif' }}>{opt.label}</button>
                          ))}
                        </div>
                        <input type="text" value={selEl.objectPosition ?? 'top center'} onChange={e => updateEl(selEl.id, { objectPosition: e.target.value })} placeholder="e.g. 50% 20%" style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const }} />
                      </PropRow>
                      <PropRow label="Placeholder Color">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={selEl.color ?? '#dddddd'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input type="text" value={selEl.color ?? '#dddddd'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      </PropRow>
                    </>
                  ) : (
                    <>
                      {selEl.fontSize !== undefined && (
                        <PropRow label="Font Size (px)">
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="range" min={7} max={120} value={selEl.fontSize} onChange={e => updateEl(selEl.id, { fontSize: +e.target.value })} style={{ flex: 1 }} />
                            <input type="number" value={selEl.fontSize} onChange={e => updateEl(selEl.id, { fontSize: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                          </div>
                        </PropRow>
                      )}
                      <PropRow label="Text Color">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={selEl.color ?? '#000000'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input type="text" value={selEl.color ?? '#000000'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      </PropRow>
                      {selEl.content !== undefined && (
                        <PropRow label="Content">
                          <textarea value={selEl.content} onChange={e => updateEl(selEl.id, { content: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'Barlow,sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' as const }} />
                        </PropRow>
                      )}
                    </>
                  )}
                  <button onClick={() => { const d = DESKTOP_DEFAULTS[activePage].elements.find(x => x.id === selEl.id); if (d) updateEl(selEl.id, { x: d.x, y: d.y }) }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', color: '#666', marginTop: 6 }}>
                    ↺ Reset Position
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            MOBILE EDITOR TAB
        ════════════════════════════════════════ */}
        {tab === 'tablet' && (
          <DeviceCanvasEditor
            device="tablet"
            pages={desktopPages}
            configs={tabletConfigs}
            activePage={activeTabletPage}
            selectedEl={selectedTabletEl}
            uploading={uploadingTabletImg}
            categoryItems={categoryItems}
            onActivePage={setActiveTabletPage}
            onSelectedEl={setSelectedTabletEl}
            onUpdateEl={updateTabletEl}
            onResetPage={() => { setTabletConfigs(c => ({ ...c, [activeTabletPage]: { ...buildDeviceDefaults('tablet')[activeTabletPage] } })); setSelectedTabletEl(null) }}
            onUpload={(e, id) => handleDeviceImageUpload(e, id, 'tablet')}
            onColorChange={(key, value) => setTabletConfigs(c => ({ ...c, [activeTabletPage]: { ...c[activeTabletPage], [key]: value } }))}
            sideBtn={sideBtn}
          />
        )}

        {tab === 'mobile' && (
          <MobilePageEditor
            pages={desktopPages}
            configs={mobileConfigs}
            activePage={activeMobileCanvasPage}
            selectedEl={selectedMobileCanvasEl}
            uploading={uploadingMobileCanvasImg}
            categoryItems={categoryItems}
            onActivePage={setActiveMobileCanvasPage}
            onSelectedEl={setSelectedMobileCanvasEl}
            onUpdateEl={updateMobileCanvasEl}
            onResetPage={() => { setMobileConfigs(c => ({ ...c, [activeMobileCanvasPage]: { ...buildDeviceDefaults('mobile')[activeMobileCanvasPage] } })); setSelectedMobileCanvasEl(null) }}
            onUpload={(e, id) => handleDeviceImageUpload(e, id, 'mobile')}
            onColorChange={(key, value) => setMobileConfigs(c => ({ ...c, [activeMobileCanvasPage]: { ...c[activeMobileCanvasPage], [key]: value } }))}
            sideBtn={sideBtn}
          />
        )}

        {false && tab === 'mobile' && (
          <>
            {/* Left sidebar — mobile section list */}
            <div style={{ width: 170, background: '#fff', borderRight: '1px solid #e8e8e5', overflowY: 'auto', flexShrink: 0, padding: '10px 6px' }}>
              <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', padding: '4px 8px 10px', fontFamily: 'Barlow,sans-serif' }}>SECTIONS</p>
              {mobilePages.map(pid => {
                const s = mobileSections[pid]
                return (
                  <button key={pid} onClick={() => { setActiveMobilePage(pid); setSelectedMobileEl(null) }} style={sideBtn(activeMobilePage === pid)}>
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: activeMobilePage === pid ? '#0d0d0d' : '#666', margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{s.elements.length} elements</p>
                    </div>
                  </button>
                )
              })}

              {/* Reset current section */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0ee' }}>
                <button onClick={() => { setMobileSections(s => ({ ...s, [activeMobilePage]: { ...MOBILE_SECTION_DEFAULTS[activeMobilePage] } })); setSelectedMobileEl(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow,sans-serif', color: '#888' }}>
                  <RotateCcw size={11} /> Reset Section
                </button>
              </div>
            </div>

            {/* Center — phone preview */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', background: '#e8e7e4', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Info banner */}
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d7f8', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={14} color="#4b72e8" />
                <span style={{ fontSize: 11, color: '#2a4db8', fontFamily: 'Barlow,sans-serif', lineHeight: 1.5 }}>
                  <strong>Mobile editor</strong> — elements are stacked vertically. Click an element in the right panel list to edit it. Changes save alongside desktop settings.
                </span>
              </div>

              {/* Visibility row for quick toggle */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8, fontFamily: 'Barlow,sans-serif' }}>Quick Visibility</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {activeMobileSection.elements.map(e => (
                    <button key={e.id} onClick={() => updateMobileEl(e.id, { visible: !e.visible })} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: e.visible ? '#0d0d0d' : '#e0e0de', color: e.visible ? '#fff' : '#888', fontSize: 10, fontFamily: 'Barlow,sans-serif', transition: 'all 0.15s' }}>
                      {e.visible ? <Eye size={9} /> : <EyeOff size={9} />}{e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone frame preview */}
              <MobileSectionPreview section={activeMobileSection} categoryItems={categoryItems} />

              {/* Page bg color */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 14 }}>
                <label style={{ ...lbl10, marginBottom: 10 }}>Section Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={activeMobileSection.bgColor} onChange={e => setMobileSections(s => ({ ...s, [activeMobilePage]: { ...s[activeMobilePage], bgColor: e.target.value } }))} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                  <code style={{ fontSize: 11, color: '#666' }}>{activeMobileSection.bgColor}</code>
                </div>
              </div>
            </div>

            {/* Right — element list + editor */}
            <div style={{ width: 260, borderLeft: '1px solid #e8e8e5', background: '#fff', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

              {/* Element list header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0ee', background: '#fafaf9' }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0, fontFamily: 'Barlow,sans-serif' }}>
                  {activeMobileSection.label} — Elements
                </p>
                <p style={{ fontSize: 10, color: '#aaa', margin: '2px 0 0', fontFamily: 'Barlow,sans-serif' }}>
                  Click to edit · stacked top→bottom
                </p>
              </div>

              {/* Scrollable element list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {!selectedMobileEl ? (
                  /* Element list view */
                  <div style={{ padding: '8px 8px' }}>
                    {activeMobileSection.elements.map((el, i) => (
                      <button key={el.id} onClick={() => setSelectedMobileEl(el.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fff', marginBottom: 3, textAlign: 'left', transition: 'background 0.12s', opacity: el.visible ? 1 : 0.4 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f3' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                      >
                        {/* Type icon */}
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: el.type === 'image' ? '#e8f0fe' : el.type === 'button' ? '#fff4f0' : '#f0efed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {el.type === 'image'  && <ImageIcon size={13} color="#4b72e8" />}
                          {el.type === 'button' && <span style={{ fontSize: 9, fontWeight: 700, color: '#f04e0f', letterSpacing: '0.5px' }}>BTN</span>}
                          {el.type === 'text'   && <span style={{ fontSize: 10, fontWeight: 700, color: '#666' }}>T</span>}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, margin: 0, fontFamily: 'Barlow,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.label}</p>
                          <p style={{ fontSize: 10, color: '#aaa', margin: 0, fontFamily: 'Barlow,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {el.type === 'image' ? (el.imageUrl ? '● Image set' : '○ No image') : (el.content ?? '—').replace(/\n/g, ' ').slice(0, 28)}
                          </p>
                        </div>

                        {/* Row number */}
                        <span style={{ fontSize: 10, color: '#ccc', fontFamily: 'Barlow,sans-serif', flexShrink: 0 }}>#{i + 1}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Element editor view */
                  <div>
                    {/* Back button */}
                    <button onClick={() => setSelectedMobileEl(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', border: 'none', background: '#fafaf9', cursor: 'pointer', borderBottom: '1px solid #f0f0ee', width: '100%', textAlign: 'left', fontFamily: 'Barlow,sans-serif', fontSize: 12, color: '#666' }}>
                      <ChevronLeft size={14} /> Back to elements
                    </button>

                    {selMobileEl && (
                      <MobileElEditor
                        el={selMobileEl!}
                        onUpdate={patch => updateMobileEl(selMobileEl!.id, patch)}
                        onUpload={handleMobileImageUpload}
                        uploading={uploadingMobileImg}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            STORE INFO TAB
        ════════════════════════════════════════ */}
        {tab === 'store' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 520, background: '#fff', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 28 }}>Store Details</h2>
              <Field label="Brand Name"       value={brandName} onChange={setBrandName} />
              <Field label="WhatsApp Number"  value={whatsapp}  onChange={setWhatsapp} placeholder="919876543210" hint="Country code + number, no + sign" />
              <Field label="Instagram URL"    value={instagram} onChange={setInstagram} placeholder="https://instagram.com/calvac" />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ANNOUNCEMENT TAB
        ════════════════════════════════════════ */}
        {tab === 'announcement' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 520, background: '#fff', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Announcement Bar</h2>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>Shown at the top of every page. Leave blank to hide.</p>
              <Field label="Announcement Text" value={announcement} onChange={setAnnouncement} multiline placeholder="Free shipping on orders above ₹2000 · New drop every Friday" />
              {announcement && (
                <div style={{ marginTop: 16, background: '#0d0d0d', borderRadius: 8, padding: '10px 16px', textAlign: 'center', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', fontWeight: 600, fontFamily: 'Barlow,sans-serif' }}>
                  {announcement}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
