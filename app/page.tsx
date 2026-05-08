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
import { getCategories, getFeaturedProducts, getSiteSettings, getCarouselProducts, getFeaturedMomentProducts } from '@/lib/db'

export const revalidate = 10 // fallback revalidation — API route triggers instant revalidation on save

export default async function HomePage() {
  const [settings, categories, featured, carouselProducts, fmProducts] = await Promise.all([
    getSiteSettings().catch(() => null),
    getCategories().catch(() => []),
    getFeaturedProducts(8).catch(() => []),
    getCarouselProducts().catch(() => []),
    getFeaturedMomentProducts().catch(() => []),
  ])

  return (
    <>
      <Navbar settings={settings} />
      <ScrollBlurTransition />
      <main>
        <HeroSection settings={settings} />
        <TickerBar />
        <FeaturedMoments products={fmProducts} settings={settings} />
        <TickerBar reverse />
        <CategoryList categories={categories} settings={settings} />
        <CollectionCarousel products={carouselProducts} settings={settings} />
        <CollectionsSection products={featured.slice(2, 5)} settings={settings} />
        <FeaturedProducts products={featured} />
        <Footer settings={settings} />
      </main>
    </>
  )
}
