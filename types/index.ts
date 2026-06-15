export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  is_active?: boolean | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  category?: Category
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  stock: number
  is_featured: boolean
  is_active: boolean
  carousel_slot: number | null
  featured_moment_slot: number | null
  collection_tag: string | null
  specifications: Record<string, string> | null
  created_at: string
  updated_at: string
}

export type ProductColor = {
  name: string
  hex: string
  price?: number
}

export type CartItem = {
  product: Product
  size: string
  color: ProductColor
  quantity: number
}

export type OrderItem = {
  product_id: string
  product_name: string
  product_image: string
  size: string
  color: string
  price: number
  quantity: number
}

export type PaymentMethod = 'whatsapp' | 'razorpay' | 'cod'
export type PaymentMethodSettings = Record<PaymentMethod, boolean>
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cod_pending' | 'whatsapp_pending'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type CheckoutSettings = {
  paymentMethods?: Partial<PaymentMethodSettings>
}

export type VisualSettings = {
  parallaxSpeed?: number
}

export type PolicyPageContent = {
  title: string
  body: string
  lastUpdated?: string
}

export type PolicySettings = {
  privacy?: Partial<PolicyPageContent>
  return?: Partial<PolicyPageContent>
  shipping?: Partial<PolicyPageContent>
}

export type DeliveryAddress = {
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_address: string | null
  delivery_address: DeliveryAddress | null
  items: OrderItem[]
  subtotal: number
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  whatsapp_sent_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  full_name: string | null
  phone: string | null
  address: DeliveryAddress | null
  created_at: string
  updated_at: string
}

export type SiteSettings = {
  id: string
  brand_name: string
  whatsapp_number: string
  hero_headline: string
  hero_subheadline: string
  hero_description: string
  announcement_text: string | null
  instagram_url: string | null
  facebook_url: string | null
  contact_location?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  open_time?: string | null
  policies?: PolicySettings | string | null
  hero_config: string | null
  page_configs: string | null
  updated_at: string
}
