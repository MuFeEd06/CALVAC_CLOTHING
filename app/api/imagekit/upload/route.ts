import { NextResponse } from 'next/server'
import { getUser, isAdminUser } from '@/lib/auth'
import { MAX_PRODUCT_IMAGE_BYTES } from '@/lib/productImages'
import { sameOriginGuard } from '@/lib/security'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function sanitizeFileName(name: string) {
  const fallback = `product-${Date.now()}`
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || fallback
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const startsWith = (signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte)

  if (file.type === 'image/jpeg') return startsWith([0xff, 0xd8, 0xff])
  if (file.type === 'image/png') return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (file.type === 'image/gif') {
    return startsWith([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
      startsWith([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  }
  if (file.type === 'image/webp') {
    const riff = startsWith([0x52, 0x49, 0x46, 0x46])
    const webp =
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    return riff && webp
  }

  return false
}

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const user = await getUser()
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  if (!endpoint || !privateKey) {
    return NextResponse.json({ error: 'ImageKit is not configured' }, { status: 503 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const productId = String(formData.get('productId') ?? 'product')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Product images must be 250 KB or smaller.' }, { status: 413 })
  }
  if (!(await hasValidImageSignature(file))) {
    return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
  }

  const uploadForm = new FormData()
  uploadForm.append('file', file)
  uploadForm.append('fileName', sanitizeFileName(file.name))
  uploadForm.append('folder', `/calvac/products/${productId.replace(/[^a-zA-Z0-9_-]/g, '-')}`)
  uploadForm.append('useUniqueFileName', 'true')

  const res = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
    },
    body: uploadForm,
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Image upload failed' },
      { status: res.status },
    )
  }

  return NextResponse.json({
    url: payload.url,
    fileId: payload.fileId,
  })
}
