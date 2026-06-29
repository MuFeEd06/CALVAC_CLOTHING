import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map(item => text(item, 500))
    .filter(Boolean)
    .slice(0, 24)
}

function cleanProductPayload(body: Record<string, unknown>, creating: boolean) {
  const name = text(body.name, 180)
  const slug = text(body.slug, 180)
  const price = numberOrNull(body.price)

  if (creating && (!name || !slug || price === null)) {
    throw new Error('Product name, slug, and price are required')
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (name) payload.name = name
  if (slug) payload.slug = slug
  payload.description = text(body.description, 8000) || null
  if (price !== null) payload.price = price
  payload.compare_price = numberOrNull(body.compare_price)
  payload.category_id = text(body.category_id, 80) || null
  payload.stock = numberOrNull(body.stock) ?? 0
  payload.is_featured = booleanValue(body.is_featured, false)
  payload.is_active = booleanValue(body.is_active, true)
  payload.carousel_slot = numberOrNull(body.carousel_slot)
  payload.featured_moment_slot = numberOrNull(body.featured_moment_slot)
  payload.collection_tag = text(body.collection_tag, 120) || null
  payload.images = stringArray(body.images)
  payload.sizes = stringArray(body.sizes)
  payload.colors = Array.isArray(body.colors) ? body.colors.slice(0, 24) : []
  payload.specifications = isRecord(body.specifications) ? body.specifications : {}

  return payload
}

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const body = await readJsonBody(req, 256 * 1024)
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 })
    }

    const payload = {
      ...cleanProductPayload(body, true),
      created_at: new Date().toISOString(),
    }

    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: typeof err?.message === 'string' ? err.message : 'Unable to create product' },
      { status: 400 },
    )
  }
}
