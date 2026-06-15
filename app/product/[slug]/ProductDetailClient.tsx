'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getProductRatingSeed } from '@/lib/productRating'
import type { Product, ProductColor } from '@/types'

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0] ?? { name: 'Default', hex: '#000' })
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  const currentPrice = selectedColor.price ?? product.price
  const rating = getProductRatingSeed(product.id || product.slug)
  const specifications = Object.entries(product.specifications ?? {}).filter(([, value]) => value)

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--gray-mid)] mb-8 hover:text-black transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <p className="text-[11px] text-[var(--gray-mid)] tracking-widest uppercase mb-2">
        {product.category?.name}
      </p>
      <h1 className="font-condensed font-900 text-4xl md:text-5xl leading-none mb-4">
        {product.name.toUpperCase()}
      </h1>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-[var(--orange)] text-sm tracking-[1px]">★★★★★</span>
        <span className="text-xs font-600 tracking-widest uppercase text-[var(--gray-dark)]">
          {rating.rating.toFixed(1)}
        </span>
        <span className="text-xs text-[var(--gray-mid)]">
          ({rating.reviewCount.toLocaleString('en-IN')} reviews)
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-condensed font-700 text-4xl">
          ₹{currentPrice.toLocaleString('en-IN')}
        </span>
        {product.compare_price && (
          <span className="text-lg text-[var(--gray-mid)] line-through">
            ₹{product.compare_price.toLocaleString('en-IN')}
          </span>
        )}
        {product.compare_price && (
          <span className="text-sm font-600 text-[var(--orange)]">
            {Math.round(((product.compare_price - currentPrice) / product.compare_price) * 100)}% OFF
          </span>
        )}
      </div>

      {product.colors.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-600 tracking-widest uppercase mb-2">
            Color: <span className="text-[var(--gray-mid)] font-400 normal-case tracking-normal">{selectedColor.name}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map(color => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                title={color.name}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor.name === color.name ? 'border-black scale-110' : 'border-black/20'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-600 tracking-widest uppercase mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[44px] h-11 px-3 border text-sm font-500 transition-all ${
                selectedSize === size
                  ? 'bg-black text-white border-black'
                  : 'border-[var(--gray-light)] hover:border-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-600 tracking-widest uppercase mb-2">Quantity</p>
        <div className="flex items-center border border-[var(--gray-light)] w-fit rounded-full">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white rounded-full transition-colors text-lg"
          >
            −
          </button>
          <span className="w-10 text-center font-500">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white rounded-full transition-colors text-lg"
          >
            +
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-3 w-full py-4 font-condensed font-700 text-lg tracking-widest uppercase rounded-full transition-all ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-black text-white hover:bg-[var(--orange)]'
          }`}
        >
          <ShoppingBag size={20} />
          {added ? 'Added to Bag ✓' : 'Add to Bag'}
        </button>

        <button
          onClick={() => {
            if (!selectedSize) { alert('Please select a size'); return }
            addItem(product, selectedSize, selectedColor, quantity)
            router.push('/checkout')
          }}
          className="flex items-center justify-center gap-3 w-full py-4 font-condensed font-700 text-lg tracking-widest uppercase rounded-full border-2 border-black hover:bg-black hover:text-white transition-all"
        >
          Buy Now
        </button>
      </div>

      {specifications.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[var(--gray-light)]">
          <h3 className="text-xs font-600 tracking-widest uppercase mb-4">Specifications</h3>
          <div className="divide-y divide-[var(--gray-light)] border border-[var(--gray-light)]">
            {specifications.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[42%_1fr]">
                <div className="px-4 py-3 bg-[var(--gray-light)]/45 text-xs font-600 tracking-widest uppercase text-[var(--gray-dark)]">
                  {key}
                </div>
                <div className="px-4 py-3 text-sm text-[var(--gray-dark)]">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {product.description && (
        <div className="mt-8 pt-8 border-t border-[var(--gray-light)]">
          <h3 className="text-xs font-600 tracking-widest uppercase mb-3">Description</h3>
          <p className="text-sm text-[var(--gray-dark)] leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  )
}
