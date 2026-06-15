import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { getSiteSettings } from '@/lib/db'

function whatsappHref(number?: string | null) {
  const digits = (number ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : '#'
}

function instagramHref(url?: string | null) {
  const value = (url ?? '').trim()
  if (!value) return '#'
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://instagram.com/${value.replace(/^@/, '')}`
}

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null)
  const whatsAppUrl = whatsappHref(settings?.whatsapp_number)
  const instagramUrl = instagramHref(settings?.instagram_url)
  const hasWhatsApp = whatsAppUrl !== '#'
  const hasInstagram = instagramUrl !== '#'

  return (
    <>
      <Navbar settings={settings} />

      <main className="pt-[72px] md:pt-[76px] min-h-screen bg-[#f5f5f3]">
        <section className="px-4 md:px-12 py-12 md:py-20 border-b border-[var(--gray-light)]">
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] md:text-[11px] tracking-[4px] uppercase text-[var(--gray-mid)] font-600 mb-4">
              Contact CALVAC
            </p>
            <h1 className="font-condensed font-900 text-[clamp(56px,11vw,128px)] leading-[0.88] tracking-tight lowercase max-w-4xl">
              speak with us<br />where style begins
            </h1>
          </div>
        </section>

        <section className="px-4 md:px-12 py-10 md:py-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6">
            <a
              href={whatsAppUrl}
              target={hasWhatsApp ? '_blank' : undefined}
              rel={hasWhatsApp ? 'noreferrer' : undefined}
              aria-disabled={!hasWhatsApp}
              className={`block bg-[#0d0d0d] text-white p-6 md:p-8 min-h-[260px] transition-transform ${hasWhatsApp ? 'hover:-translate-y-1' : 'opacity-60 pointer-events-none'}`}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-[3px] uppercase text-white/35 font-700 mb-5">WhatsApp</p>
                  <h2 className="font-condensed font-900 text-4xl md:text-6xl leading-none lowercase mb-4">quick sizing<br />and orders</h2>
                  <p className="text-sm text-white/55 leading-relaxed max-w-sm">
                    Chat with CALVAC for product questions, sizing help, order support, and drop updates.
                  </p>
                </div>
                <div className="mt-8 inline-flex w-fit items-center gap-3 border border-white/35 px-5 py-3 text-[10px] font-700 tracking-[3px] uppercase">
                  Chat on WhatsApp <span>→</span>
                </div>
              </div>
            </a>

            <a
              href={instagramUrl}
              target={hasInstagram ? '_blank' : undefined}
              rel={hasInstagram ? 'noreferrer' : undefined}
              aria-disabled={!hasInstagram}
              className={`block bg-[var(--orange)] text-white p-6 md:p-8 min-h-[260px] transition-transform ${hasInstagram ? 'hover:-translate-y-1' : 'opacity-60 pointer-events-none'}`}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-[3px] uppercase text-white/50 font-700 mb-5">Instagram</p>
                  <h2 className="font-condensed font-900 text-4xl md:text-6xl leading-none lowercase mb-4">follow the<br />next drop</h2>
                  <p className="text-sm text-white/75 leading-relaxed max-w-sm">
                    Find campaign moments, new arrivals, styling cues, and release previews.
                  </p>
                </div>
                <div className="mt-8 inline-flex w-fit items-center gap-3 border border-white/45 px-5 py-3 text-[10px] font-700 tracking-[3px] uppercase">
                  Follow us on Instagram <span>→</span>
                </div>
              </div>
            </a>
          </div>

          <div className="max-w-6xl mx-auto mt-8">
            <Link href="/shop" className="inline-flex items-center gap-3 border border-black px-6 py-3 rounded-full text-[10px] font-700 tracking-[3px] uppercase hover:bg-black hover:text-white transition-colors">
              Continue shopping <span>→</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
