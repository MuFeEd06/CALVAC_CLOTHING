import { getProducts } from '@/lib/db'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/types'

interface Props {
  currentProductId: string
}

export default async function SimilarProducts({ currentProductId }: Props) {
  let allProducts: Product[] = []
  try {
    allProducts = await getProducts({ active: true })
  } catch {
    return null
  }

  const filtered = allProducts.filter(p => p.id !== currentProductId)
  if (filtered.length === 0) return null

  // Deterministic shuffle per product so each product detail shows a different set
  const seed = currentProductId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const shuffled = [...filtered]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 2654435761 * (i + 1)) % (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 3 rows × 4 cols = 12 on desktop, same 12 in 2-col on mobile
  const similar = shuffled.slice(0, 12)

  return (
    <section className="px-4 md:px-12 py-10 md:py-16 border-t border-[var(--gray-light)]">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 md:mb-10">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-[var(--gray-mid)] mb-2 font-600">
            // DISCOVER MORE
          </p>
          <h2 className="font-condensed font-900 text-[clamp(28px,4.5vw,60px)] leading-none tracking-tight lowercase">
            You may also like
          </h2>
        </div>
      </div>

      {/* Grid: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {similar.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
