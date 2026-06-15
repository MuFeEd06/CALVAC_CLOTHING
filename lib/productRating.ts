export interface ProductRating {
  rating: number
  reviewCount: number
}

function hashSeed(seed: string) {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getProductRatingSeed(seed: string | null | undefined): ProductRating {
  const value = hashSeed(seed || 'calvac-product')
  const rating = 4 + ((value % 81) / 100)
  const reviewCount = 120 + (Math.floor(value / 97) % 2681)

  return {
    rating: Number(rating.toFixed(1)),
    reviewCount,
  }
}
