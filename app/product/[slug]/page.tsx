import { getProductBySlug, getSiteSettings } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import SimilarProducts from '@/components/shop/SimilarProducts'
import ProductDetailClient from './ProductDetailClient'

interface PageProps {
  params: { slug: string }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  if (!product) notFound()

  return (
    <>
      <Navbar settings={settings} />

      <div className="pt-[72px] md:pt-[76px]">
        {/* ── Product Detail ── */}
        <div className="px-4 md:px-12 py-8 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 max-w-6xl mx-auto">

            {/* Images */}
            <div className="space-y-3">
              {product.images.length > 0 ? (
                product.images.map((img, i) => (
                  <div key={i} className="relative w-full aspect-[3/4] bg-[var(--gray-light)] overflow-hidden">
                    <Image
                      src={img}
                      alt={`${product.name} - image ${i + 1}`}
                      fill
                      priority={i === 0}
                      className="object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="relative w-full aspect-[3/4] bg-[var(--gray-light)] flex items-center justify-center">
                  <span className="text-[var(--gray-mid)] text-sm tracking-widest uppercase">No Image</span>
                </div>
              )}
            </div>

            {/* Info + Actions (client component) */}
            <div className="md:sticky md:top-[100px] md:self-start">
              <ProductDetailClient product={product} settings={settings} />
            </div>
          </div>
        </div>

        {/* ── Similar Products (server component, random 12) ── */}
        <SimilarProducts currentProductId={product.id} />
      </div>
    </>
  )
}
