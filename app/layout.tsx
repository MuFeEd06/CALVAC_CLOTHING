import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import { CartProvider } from '@/hooks/useCart'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-barlow-condensed',
})

export const metadata: Metadata = {
  title: 'CALVAC — Where Style Lives Now',
  description: 'Curated streetwear collections, exclusive drops and everyday essentials.',
  openGraph: {
    title: 'CALVAC',
    description: 'Curated streetwear collections, exclusive drops and everyday essentials.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
