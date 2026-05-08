'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { Product, ProductColor } from '@/types'

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0] ?? { name: 'Default', hex: '#000' })
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  const currentPrice = selectedColor.price ?? product.price

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
    <div className="min-h-screen bg-[var(--white)] pt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--gray-mid)] mb-8 hover:text-black transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-[3/4] bg-[var(--gray-light)] overflow-hidden">
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center rounded-full"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(product.images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center rounded-full"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-20 bg-[var(--gray-light)] overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt="" width={64} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <p className="text-[11px] text-[var(--gray-mid)] tracking-widest uppercase mb-2">
              {product.category?.name}
            </p>
            <h1 className="font-condensed font-900 text-4xl md:text-5xl leading-none mb-4">
              {product.name.toUpperCase()}
            </h1>

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

            {/* Colors */}
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

            {/* Sizes */}
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

            {/* Quantity */}
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

            {/* Add to cart + Buy Now */}
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

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-[var(--gray-light)]">
                <h3 className="text-xs font-600 tracking-widest uppercase mb-3">Description</h3>
                <p className="text-sm text-[var(--gray-dark)] leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
