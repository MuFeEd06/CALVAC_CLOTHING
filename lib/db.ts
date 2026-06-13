import { hasSupabaseConfig, supabase } from './supabase'
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

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
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

  const { error } = await supabase
    .from('site_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', settings.id)
  if (error) throw error
}

// ─── STORAGE ────────────────────────────────────────────────
export function getImageUrl(path: string) {
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProductImage(file: File, productId: string) {
  if (!hasSupabaseConfig) throw new Error('Supabase is not configured')

  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return getImageUrl(path)
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
