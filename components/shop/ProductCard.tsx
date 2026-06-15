'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getOptimizedProductImageUrl } from '@/lib/productImages'
import { getProductRatingSeed } from '@/lib/productRating'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null
  const rating = getProductRatingSeed(product.id || product.slug)

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group block ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--gray-light)] aspect-[3/4]">
        {product.images[0] ? (
          <Image
            src={getOptimizedProductImageUrl(product.images[0], { width: 720 })}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--gray-mid)] text-[10px] tracking-widest uppercase">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-[var(--orange)] text-white text-[9px] md:text-[10px] font-700 px-1.5 md:px-2 py-0.5 tracking-wider">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-black text-white text-[9px] md:text-[10px] font-700 px-1.5 md:px-2 py-0.5 tracking-wider">
              FEATURED
            </span>
          )}
        </div>

        {/* View overlay — desktop only hover, always visible tap cue on mobile */}
        <div className="product-card-overlay absolute bottom-0 left-0 right-0 flex items-end justify-center pb-3 md:pb-4">
          <span className="text-white text-[10px] md:text-xs font-600 tracking-widest uppercase border border-white px-4 md:px-6 py-1.5 md:py-2 bg-black/20 backdrop-blur-sm">
            View Product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 md:mt-3 px-0.5">
        <p className="text-[10px] md:text-[11px] text-[var(--gray-mid)] tracking-widest uppercase mb-0.5 md:mb-1 truncate">
          {product.category?.name}
        </p>
        <h3 className="font-500 text-[13px] md:text-sm leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[var(--orange)] text-[10px] leading-none">★★★★★</span>
          <span className="text-[10px] text-[var(--gray-mid)] font-600">
            {rating.rating.toFixed(1)} ({rating.reviewCount.toLocaleString('en-IN')})
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-1 md:mt-1.5">
          <span className="font-condensed font-700 text-base md:text-lg">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.compare_price && (
            <span className="text-[11px] md:text-xs text-[var(--gray-mid)] line-through">
              ₹{product.compare_price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="flex gap-1 md:gap-1.5 mt-1.5 md:mt-2">
            {product.colors.slice(0, 4).map(color => (
              <div
                key={color.name}
                title={color.name}
                className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] md:text-[10px] text-[var(--gray-mid)] self-center">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
