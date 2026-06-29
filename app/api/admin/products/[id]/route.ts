import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function text(value: unknown, max = 240) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length <= max ? trimmed : ''
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) throw new Error('Invalid numeric product field')
  return n
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map(item => text(item, 500))
    .filter(Boolean)
    .slice(0, 24)
}

function cleanProductPayload(body: Record<string, unknown>) {
  const name = text(body.name, 180)
  const slug = text(body.slug, 180)
  const price = numberOrNull(body.price)

  if (!name || !slug || price === null) {
    throw new Error('Product name, slug, and price are required')
  }

  return {
    name,
    slug,
    description: text(body.description, 8000) || null,
    price,
    compare_price: numberOrNull(body.compare_price),
    category_id: text(body.category_id, 80) || null,
    stock: numberOrNull(body.stock) ?? 0,
    is_featured: typeof body.is_featured === 'boolean' ? body.is_featured : false,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
    carousel_slot: numberOrNull(body.carousel_slot),
    featured_moment_slot: numberOrNull(body.featured_moment_slot),
    collection_tag: text(body.collection_tag, 120) || null,
    images: stringArray(body.images),
    sizes: stringArray(body.sizes),
    colors: Array.isArray(body.colors) ? body.colors.slice(0, 24) : [],
    specifications: isRecord(body.specifications) ? body.specifications : {},
    updated_at: new Date().toISOString(),
  }
}

async function requireAdmin() {
  const admin = await getAdminUser()
  return admin ? null : NextResponse.json({ error: 'Admin access required' }, { status: 403 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const adminError = await requireAdmin()
  if (adminError) return adminError

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  try {
    const body = await readJsonBody(req, 256 * 1024)
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('products')
      .update(cleanProductPayload(body))
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: typeof err?.message === 'string' ? err.message : 'Unable to update product' },
      { status: 400 },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const adminError = await requireAdmin()
  if (adminError) return adminError

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('products').delete().eq('id', params.id)
  if (error) {
    return NextResponse.json({ error: 'Unable to delete product' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
