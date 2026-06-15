import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Category, PolicyPageContent, SiteSettings } from '@/types'

interface Props {
  settings: SiteSettings | null
  categories: Category[]
  policy: PolicyPageContent
  eyebrow: string
}

export default function PolicyPageView({ settings, categories, policy, eyebrow }: Props) {
  const paragraphs = policy.body
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean)

  return (
    <>
      <Navbar settings={settings} />
      <main style={{ minHeight: '100vh', background: '#f5f5f3', paddingTop: 100, fontFamily: 'Barlow, sans-serif' }}>
        <section style={{ borderBottom: '1px solid #e8e8e5', padding: '56px clamp(20px,5vw,52px) 48px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: '#aaa', fontWeight: 700, margin: '0 0 18px' }}>
              {eyebrow}
            </p>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 'clamp(58px,11vw,128px)', lineHeight: 0.88, letterSpacing: '-0.5px', textTransform: 'lowercase', margin: 0, color: '#0d0d0d' }}>
              {policy.title}
            </h1>
            {policy.lastUpdated && (
              <p style={{ margin: '22px 0 0', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>
                {policy.lastUpdated}
              </p>
            )}
          </div>
        </section>

        <section style={{ padding: '44px clamp(20px,5vw,52px) 72px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {paragraphs.map((paragraph, index) => (
              <p key={index} style={{ fontSize: 15, lineHeight: 1.9, color: '#555', margin: index === 0 ? '0 0 22px' : '22px 0' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </main>
      <Footer settings={settings} categories={categories} />
    </>
  )
}
