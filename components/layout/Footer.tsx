import Link from 'next/link'
import type { SiteSettings } from '@/types'
import { mergeConfig, vis, txt, clr, fsize } from '@/lib/useMergedConfig'

interface Props { settings: SiteSettings | null }

const DEFAULTS = [
  { id: 'headline',  visible: true, x: 3,  y: 12, fontSize: 32, color: '#ffffff', content: 'Fast Selling Urban\n__Fashion Collection' },
  { id: 'email_row', visible: true, x: 3,  y: 46, fontSize: 9,  color: '#555555', content: 'Send email to us' },
  { id: 'socials',   visible: true, x: 3,  y: 60, fontSize: 9,  color: '#777777', content: 'f  in  𝕏  ▶' },
  { id: 'location',  visible: true, x: 35, y: 12, fontSize: 13, color: '#888888', content: 'Your Store Address\nCity, State' },
  { id: 'email',     visible: true, x: 35, y: 38, fontSize: 13, color: '#888888', content: 'hello@calvac.store' },
  { id: 'phone',     visible: true, x: 62, y: 12, fontSize: 13, color: '#888888', content: '+91 98765 43210' },
  { id: 'hours',     visible: true, x: 62, y: 34, fontSize: 13, color: '#888888', content: '08.00 - 11.00 pm' },
  { id: 'copyright', visible: true, x: 62, y: 90, fontSize: 11, color: '#444444', content: `© 2026 CALVAC. All rights reserved.` },
]

const labelStyle: React.CSSProperties = {
  fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)', marginBottom: 8,
}

export default function Footer({ settings }: Props) {
  const cfg       = mergeConfig(settings, 'footer', DEFAULTS)
  const accent    = cfg.accentColor
  const bg        = cfg.bgColor

  const headline  = txt(cfg, 'headline', 'Fast Selling Urban\n__Fashion Collection')
  const location  = txt(cfg, 'location',  'Your Store Address\nCity, State')
  const email     = txt(cfg, 'email',     'hello@calvac.store')
  const phone     = txt(cfg, 'phone',     '+91 98765 43210')
  const hours     = txt(cfg, 'hours',     '08.00 - 11.00 pm')
  const copyright = txt(cfg, 'copyright', `© 2026 ${settings?.brand_name ?? 'CALVAC'}. All rights reserved.`)

  return (
    <footer style={{ background: bg, color: '#fff', fontFamily: 'Barlow, sans-serif' }}>
      {/*
        Mobile  : single column, padding 36px 20px
        Tablet  : 2-column grid
        Desktop : 4-column grid, padding 56px 48px
      */}
      <div className="footer-grid" style={{ paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Col 1 — Brand + newsletter + socials */}
        {vis(cfg, 'headline') && (
          <div>
            <h3 style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
              fontSize: fsize(cfg, 'headline', 32),
              lineHeight: 1.1, marginBottom: 20,
              whiteSpace: 'pre-line', color: clr(cfg, 'headline', '#ffffff'),
            }}>
              {headline}
            </h3>

            {/* Email row */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 12, marginBottom: 16 }}>
              <input
                type="email"
                placeholder={txt(cfg, 'email_row', 'Send email to us')}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
              />
              <button style={{ width: 36, height: 36, background: accent, border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>→</button>
            </div>

            <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Follow Us</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ l: 'f', href: '#' }, { l: 'in', href: '#' }, { l: '𝕏', href: settings?.instagram_url ?? '#' }, { l: '▶', href: '#' }].map((s, i) => (
                <a key={i} href={s.href} style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{s.l}</a>
              ))}
            </div>
          </div>
        )}

        {/* Col 2 — Contact info */}
        <div>
          <p style={labelStyle}>Location</p>
          <p style={{ fontSize: fsize(cfg, 'location', 13), color: clr(cfg, 'location', 'rgba(255,255,255,0.65)'), lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-line' }}>{location}</p>
          <p style={labelStyle}>Email</p>
          <p style={{ fontSize: fsize(cfg, 'email', 13), color: clr(cfg, 'email', 'rgba(255,255,255,0.65)'), marginBottom: 20 }}>{email.split('\n').pop()}</p>
          <p style={labelStyle}>Call Us</p>
          <p style={{ fontSize: fsize(cfg, 'phone', 13), color: clr(cfg, 'phone', 'rgba(255,255,255,0.65)'), marginBottom: 20 }}>{phone.split('\n').pop()}</p>
          <p style={labelStyle}>Open Time</p>
          <p style={{ fontSize: fsize(cfg, 'hours', 13), color: clr(cfg, 'hours', 'rgba(255,255,255,0.65)') }}>{hours.split('\n').pop()}</p>
        </div>

        {/* Col 3 — Menu links */}
        <div>
          <p style={labelStyle}>Menu</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, label]) => (
              <li key={href}>
                <Link href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Shop links */}
        <div>
          <p style={labelStyle}>Shop</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Jackets', 'jackets'], ['Tees', 'tees'], ['Pants', 'pants'], ['Accessories', 'accessories']].map(([name, slug]) => (
              <li key={slug}>
                <Link href={`/shop?category=${slug}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
        <p style={{ fontSize: fsize(cfg, 'copyright', 11), color: clr(cfg, 'copyright', 'rgba(255,255,255,0.25)'), margin: 0 }}>{copyright}</p>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 36px 20px 36px;
        }
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px 20px 28px;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            padding: 44px 32px 44px;
            gap: 36px;
          }
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 20px 32px 32px;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 40px;
            padding: 56px 48px 48px;
          }
          .footer-bottom {
            padding: 24px 48px 36px;
          }
        }
      `}</style>
    </footer>
  )
}
