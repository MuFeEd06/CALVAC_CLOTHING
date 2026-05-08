import Link from 'next/link'
import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface Props { products: Product[] }

export default function FeaturedProducts({ products }: Props) {
  if (products.length === 0) return null
  return (
    <section className="px-6 md:px-12 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-[var(--gray-mid)] mb-2">//NEW ARRIVALS</p>
          <h2 className="font-condensed font-900 text-[clamp(40px,6vw,80px)] leading-none tracking-tight lowercase">
            All - about<br/>moments ©26
          </h2>
        </div>
        <Link href="/shop" className="hidden md:flex items-center gap-2 border border-black rounded-full px-6 py-3 text-xs font-600 tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link href="/shop" className="border border-black rounded-full px-8 py-3 text-xs font-600 tracking-widest uppercase hover:bg-black hover:text-white transition-colors inline-block">
          View All Products →
        </Link>
      </div>
    </section>
  )
}
