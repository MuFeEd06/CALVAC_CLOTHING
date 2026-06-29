import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { isRecord, readJsonBody, sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SETTINGS_JSON_LIMIT_BYTES = 2 * 1024 * 1024
const SETTINGS_FIELDS = [
  'brand_name',
  'whatsapp_number',
  'announcement_text',
  'instagram_url',
  'contact_location',
  'contact_email',
  'contact_phone',
  'open_time',
] as const

function optionalText(value: unknown, max = 8000) {
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max)
}

function jsonText(value: unknown) {
  if (typeof value === 'string') return value
  if (value === undefined) return undefined
  return JSON.stringify(value)
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function titleize(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : ''
}

function categoryItemsFrom(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter(isRecord)
    .map(item => ({ name: optionalText(item.name, 160) ?? '' }))
    .filter(item => item.name.trim())
}

function buildSettingsPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  for (const key of SETTINGS_FIELDS) {
    if (key in body) payload[key] = optionalText(body[key], key === 'announcement_text' ? 2000 : 8000) ?? ''
  }

  if ('policies' in body) {
    payload.policies = isRecord(body.policies) ? body.policies : {}
  }

  const heroConfig = jsonText(body.hero_config)
  if (heroConfig !== undefined) payload.hero_config = heroConfig

  const pageConfigs = jsonText(body.page_configs)
  if (pageConfigs !== undefined) payload.page_configs = pageConfigs

  return payload
}

async function syncCategories(supabase: ReturnType<typeof createSupabaseAdmin>, categoryItems: unknown) {
  const items = categoryItemsFrom(categoryItems)
  if (items.length === 0) return

  const { data: existingCats, error: existingError } = await supabase
    .from('categories')
    .select('id, slug')
  if (existingError) throw existingError

  const existing = existingCats ?? []
  const existingSlugs = new Set(existing.map(cat => String(cat.slug)))

  for (const item of items) {
    const slug = slugify(item.name)
    if (!slug) continue

    const name = titleize(item.name)
    if (existingSlugs.has(slug)) {
      const { error } = await supabase.from('categories').update({ name }).eq('slug', slug)
      if (error) throw error
    } else {
      const { error } = await supabase.from('categories').insert({ name, slug, description: null })
      if (error) throw error
    }
  }

  const activeSlugs = items.map(item => slugify(item.name)).filter(Boolean)
  const toRemove = existing.filter(cat => !activeSlugs.includes(String(cat.slug)))

  for (const cat of toRemove) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', cat.id)
    if (countError) throw countError
    if (!count || count === 0) {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id)
      if (error) throw error
    }
  }
}

export async function PUT(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const body = await readJsonBody(req, SETTINGS_JSON_LIMIT_BYTES)
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const { data: row, error: rowError } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .single()
    if (rowError) throw rowError
    if (!row?.id) throw new Error('No settings row')

    const { error: updateError } = await supabase
      .from('site_settings')
      .update(buildSettingsPayload(body))
      .eq('id', row.id)
    if (updateError) throw updateError

    await syncCategories(supabase, body.categoryItems)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: typeof err?.message === 'string' ? err.message : 'Unable to update settings' },
      { status: 400 },
    )
  }
}
