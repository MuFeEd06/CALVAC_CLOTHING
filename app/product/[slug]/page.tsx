import {
  CATALOG_REVALIDATE_SECONDS,
  getCachedProductBySlug,
  getCachedSiteSettings,
} from '@/lib/cachedDb'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SimilarProducts from '@/components/shop/SimilarProducts'
import ProductDetailClient from './ProductDetailClient'
import ProductGallery from './ProductGallery'

interface PageProps {
  params: { slug: string }
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

export default async function ProductDetailPage({ params }: PageProps) {
  const [product, settings] = await Promise.all([
    getCachedProductBySlug(params.slug).catch(() => null),
    getCachedSiteSettings().catch(() => null),
  ])

  if (!product) notFound()

  return (
    <>
      <Navbar settings={settings} />

      <div className="pt-[72px] md:pt-[76px]">
        {/* ── Product Detail ── */}
        <div className="px-4 md:px-12 py-8 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 max-w-6xl mx-auto">

            <ProductGallery images={product.images} productName={product.name} />

            {/* Info + Actions (client component) */}
            <div className="md:sticky md:top-[100px] md:self-start">
              <ProductDetailClient product={product} />
            </div>
          </div>
        </div>

        {/* ── Similar Products (server component, random 12) ── */}
        <SimilarProducts currentProductId={product.id} />
      </div>
    </>
  )
}
