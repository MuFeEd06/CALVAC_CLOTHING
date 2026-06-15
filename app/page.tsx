import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/layout/HeroSection'
import ScrollBlurTransition from '@/components/layout/ScrollBlurTransition'
import TickerBar from '@/components/ui/TickerBar'
import FeaturedMoments from '@/components/layout/FeaturedMoments'
import CategoryList from '@/components/shop/CategoryList'
import CollectionCarousel from '@/components/shop/CollectionCarousel'
import CollectionsSection from '@/components/layout/CollectionsSection'
import FeaturedProducts from '@/components/shop/FeaturedProducts'
import Footer from '@/components/layout/Footer'
import {
  CATALOG_REVALIDATE_SECONDS,
  getCachedCarouselProducts,
  getCachedCategories,
  getCachedFeaturedMomentProducts,
  getCachedFeaturedProducts,
  getCachedSiteSettings,
} from '@/lib/cachedDb'

export const revalidate = CATALOG_REVALIDATE_SECONDS

export default async function HomePage() {
  const [settings, categories, featured, carouselProducts, fmProducts] = await Promise.all([
    getCachedSiteSettings().catch(() => null),
    getCachedCategories().catch(() => []),
    getCachedFeaturedProducts(8).catch(() => []),
    getCachedCarouselProducts().catch(() => []),
    getCachedFeaturedMomentProducts().catch(() => []),
  ])

  return (
    <>
      <Navbar settings={settings} />
      <ScrollBlurTransition />
      <main>
        <HeroSection settings={settings} categories={categories} />
        <TickerBar />
        <FeaturedMoments products={fmProducts} settings={settings} />
        <TickerBar reverse />
        <CategoryList categories={categories} settings={settings} />
        <CollectionCarousel products={carouselProducts} settings={settings} />
        <CollectionsSection products={featured.slice(2, 5)} settings={settings} />
        <FeaturedProducts products={featured} />
        <Footer settings={settings} categories={categories} />
      </main>
    </>
  )
}
