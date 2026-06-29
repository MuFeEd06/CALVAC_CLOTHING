import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { sameOriginGuard } from '@/lib/security'
import { createSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_EDITOR_IMAGE_BYTES = 3 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function safeStoragePath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''
  const path = value.trim()
  if (!path.startsWith('page-editor/')) return ''
  if (path.includes('..') || path.includes('\\') || path.startsWith('/')) return ''
  if (!/^[a-zA-Z0-9/_.,-]+$/.test(path)) return ''
  return path
}

async function hasValidImageSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const startsWith = (bytes: number[]) => bytes.every((byte, index) => header[index] === byte)

  if (file.type === 'image/jpeg') return startsWith([0xff, 0xd8, 0xff])
  if (file.type === 'image/png') return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (file.type === 'image/gif') {
    return startsWith([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
      startsWith([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  }
  if (file.type === 'image/webp') {
    return startsWith([0x52, 0x49, 0x46, 0x46]) &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50
  }

  return false
}

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file')
  const path = safeStoragePath(formData.get('path'))

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }
  if (!path) {
    return NextResponse.json({ error: 'Invalid storage path' }, { status: 400 })
  }
  if (file.size > MAX_EDITOR_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image file is too large' }, { status: 400 })
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || !(await hasValidImageSignature(file))) {
    return NextResponse.json({ error: 'Unsupported image file' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 400 })
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
