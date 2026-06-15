import type { DeliveryAddress, OrderItem, ProductColor } from '@/types'

export type CheckoutCartItemInput = {
  productId?: unknown
  product_id?: unknown
  size?: unknown
  color?: unknown
  colorName?: unknown
  quantity?: unknown
}

type DbProduct = {
  id: string
  name: string
  price: number | string
  images: string[] | null
  sizes: string[] | null
  colors: ProductColor[] | null
  stock: number | null
  is_active: boolean
}

type NormalizedCartItem = {
  productId: string
  size: string
  colorName: string
  quantity: number
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function numberValue(value: unknown) {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(n) ? n : 0
}

function getColorName(input: CheckoutCartItemInput) {
  if (typeof input.colorName === 'string') return input.colorName.trim()
  if (typeof input.color === 'string') return input.color.trim()
  if (input.color && typeof input.color === 'object' && 'name' in input.color) {
    return text((input.color as { name?: unknown }).name)
  }
  return ''
}

export function normalizeDeliveryAddress(raw: unknown): DeliveryAddress {
  const address = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const normalized = {
    name: text(address.name),
    phone: text(address.phone),
    line1: text(address.line1),
    line2: text(address.line2),
    city: text(address.city),
    state: text(address.state),
    pincode: text(address.pincode),
  }

  if (!normalized.name) throw new Error('Name is required')
  if (!normalized.phone || normalized.phone.replace(/\D/g, '').length < 10) {
    throw new Error('Valid phone number required')
  }
  if (!normalized.line1) throw new Error('Address line 1 is required')
  if (!normalized.city) throw new Error('City is required')
  if (!normalized.state) throw new Error('State is required')
  if (!normalized.pincode || normalized.pincode.replace(/\D/g, '').length < 6) {
    throw new Error('Valid pincode required')
  }

  return normalized
}

export function formatDeliveryAddress(address: DeliveryAddress) {
  return [
    address.line1,
    address.line2,
    address.city,
    `${address.state} - ${address.pincode}`,
  ].filter(Boolean).join(', ')
}

export function generateServerOrderNumber() {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `CAL-${yy}${mm}${dd}-${rand}`
}

export async function validateCheckoutItems(
  supabase: any,
  rawItems: unknown,
): Promise<{ items: OrderItem[]; subtotal: number }> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Cart is empty')
  }

  const normalized = rawItems.map((raw): NormalizedCartItem => {
    const input = raw && typeof raw === 'object' ? raw as CheckoutCartItemInput : {}
    const productId = text(input.productId ?? input.product_id)
    const size = text(input.size)
    const colorName = getColorName(input)
    const quantity = Number(input.quantity)

    if (!productId) throw new Error('Invalid product in cart')
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('Invalid item quantity')
    }

    return {
      productId,
      size,
      colorName,
      quantity,
    }
  })

  const productIds = Array.from(new Set(normalized.map(item => item.productId)))
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images, sizes, colors, stock, is_active')
    .in('id', productIds)
    .eq('is_active', true)

  if (error) throw error

  const products = new Map<string, DbProduct>(
    ((data ?? []) as DbProduct[]).map(product => [product.id, product]),
  )

  const orderItems = normalized.map((item): OrderItem => {
    const product = products.get(item.productId)
    if (!product) throw new Error('A cart product is no longer available')

    const sizes = Array.isArray(product.sizes) ? product.sizes : []
    const size = item.size || sizes[0] || 'One Size'
    if (sizes.length > 0 && !sizes.includes(size)) {
      throw new Error(`${product.name} is not available in size ${size}`)
    }

    const colors = Array.isArray(product.colors) ? product.colors : []
    const color =
      colors.find(option => option.name === item.colorName) ??
      (colors.length === 0 ? { name: item.colorName || 'Default', hex: '#000000' } : null)

    if (!color) throw new Error(`${product.name} is not available in the selected color`)

    const stock = numberValue(product.stock)
    if (stock > 0 && item.quantity > stock) {
      throw new Error(`${product.name} has only ${stock} in stock`)
    }

    const price = numberValue(color.price ?? product.price)
    if (price <= 0) throw new Error(`${product.name} has an invalid price`)

    return {
      product_id: product.id,
      product_name: product.name,
      product_image: Array.isArray(product.images) ? product.images[0] ?? '' : '',
      size,
      color: color.name,
      price,
      quantity: Number(item.quantity),
    }
  })

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  if (subtotal <= 0) throw new Error('Cart total is invalid')

  return { items: orderItems, subtotal }
}
