import { hasSupabaseConfig, supabase } from './supabase'
import { formatProductImageLimit, MAX_PRODUCT_IMAGE_BYTES } from './productImages'
import type { Product, Category, Order, SiteSettings } from '@/types'

// ─── PRODUCTS ───────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string
  tag?: string
  featured?: boolean
  active?: boolean
  limit?: number
}) {
  if (!hasSupabaseConfig) return [] as Product[]

  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .order('created_at', { ascending: false })

  if (options?.active !== false) query = query.eq('is_active', true)
  if (options?.featured) query = query.eq('is_featured', true)
  if (options?.category) query = query.eq('categories.slug', options.category)
  if (options?.tag) query = query.eq('collection_tag', options.tag)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) throw error
  return data as Product
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit })
}

// ─── CATEGORIES ─────────────────────────────────────────────
export async function getCategories() {
  if (!hasSupabaseConfig) return [] as Category[]

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

// ─── ORDERS ─────────────────────────────────────────────────
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function getOrders() {
  if (!hasSupabaseConfig) return [] as Order[]

  const res = await fetch('/api/admin/orders', { cache: 'no-store' })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error ?? 'Unable to load orders')
  return (payload.orders ?? []) as Order[]
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error ?? 'Unable to update order')
}

// ─── SITE SETTINGS ──────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single()
  if (error) throw error
  return data as SiteSettings
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(payload.error ?? 'Unable to update settings')
}

// ─── STORAGE ────────────────────────────────────────────────
export function getImageUrl(path: string) {
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProductImage(file: File, productId: string) {
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error(`Product images must be ${formatProductImageLimit()} or smaller.`)
  }

  const body = new FormData()
  body.append('file', file)
  body.append('productId', productId)

  const res = await fetch('/api/imagekit/upload', { method: 'POST', body })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok || !payload.url) {
    throw new Error(payload.error ?? 'Image upload failed')
  }
  return payload.url as string
}

export async function deleteProductImage(path: string) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const parts = path.split('/product-images/')
  if (parts.length < 2) return
  const { error } = await supabase.storage
    .from('product-images')
    .remove([parts[1]])
  if (error) throw error
}

export async function getCarouselProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig) return [] as Product[]

  const { data: slotted } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .not('carousel_slot', 'is', null)
    .eq('is_active', true)
    .order('carousel_slot', { ascending: true })
    .limit(6)

  if (slotted && slotted.length > 0) return slotted as Product[]

  return getFeaturedProducts(6)
}

export async function getFeaturedMomentProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig) return [] as Product[]

  const { data: slotted } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .not('featured_moment_slot', 'is', null)
    .eq('is_active', true)
    .order('featured_moment_slot', { ascending: true })
    .limit(3)

  if (slotted && slotted.length > 0) return slotted as Product[]

  return getFeaturedProducts(2)
}
