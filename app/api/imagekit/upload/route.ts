import { NextResponse } from 'next/server'
import { getUser, isAdminUser } from '@/lib/auth'
import { MAX_PRODUCT_IMAGE_BYTES } from '@/lib/productImages'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

function sanitizeFileName(name: string) {
  const fallback = `product-${Date.now()}`
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || fallback
}

export async function POST(req: Request) {
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
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Product images must be 250 KB or smaller.' }, { status: 413 })
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
      { error: payload?.message ?? 'ImageKit upload failed' },
      { status: res.status },
    )
  }

  return NextResponse.json({
    url: payload.url,
    fileId: payload.fileId,
  })
}
