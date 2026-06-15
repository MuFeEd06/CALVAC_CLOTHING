'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getOptimizedProductImageUrl } from '@/lib/productImages'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const safeImages = images.length > 0 ? images : []
  const selectedImage = safeImages[selected] ?? safeImages[0]

  if (!selectedImage) {
    return (
      <div className="relative w-full aspect-[3/4] bg-[var(--gray-light)] flex items-center justify-center">
        <span className="text-[var(--gray-mid)] text-sm tracking-widest uppercase">No Image</span>
      </div>
    )
  }

  return (
    <div>
      <div className="hidden md:grid grid-cols-[76px_minmax(0,1fr)] gap-4">
        <div className="flex flex-col gap-3">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative aspect-[3/4] overflow-hidden bg-[var(--gray-light)] border transition-colors ${
                selected === i ? 'border-black' : 'border-transparent hover:border-[var(--gray-mid)]'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={getOptimizedProductImageUrl(img, { width: 160 })} alt={`${productName} thumbnail ${i + 1}`} fill sizes="76px" className="object-cover object-top" />
            </button>
          ))}
        </div>

        <div className="relative w-full aspect-[3/4] bg-[var(--gray-light)] overflow-hidden">
          <Image
            src={getOptimizedProductImageUrl(selectedImage, { width: 1200 })}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 45vw, 560px"
            className="object-contain object-top"
          />
        </div>
      </div>

      <div
        className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {safeImages.map((img, i) => (
          <div key={`${img}-${i}`} className="relative w-[86vw] max-w-[420px] flex-shrink-0 aspect-[3/4] bg-[var(--gray-light)] overflow-hidden snap-center">
            <Image
              src={getOptimizedProductImageUrl(img, { width: 900 })}
              alt={`${productName} image ${i + 1}`}
              fill
              priority={i === 0}
              sizes="86vw"
              className="object-contain object-top"
            />
          </div>
        ))}
      </div>

      {safeImages.length > 1 && (
        <div className="md:hidden flex justify-center gap-1.5 mt-1">
          {safeImages.map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-black/20" />
          ))}
        </div>
      )}
    </div>
  )
}
