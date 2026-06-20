import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminApi'
import { sameOriginGuard } from '@/lib/security'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const originError = sameOriginGuard(req)
  if (originError) return originError

  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  revalidateTag('storefront')
  revalidateTag('products')
  revalidateTag('categories')
  revalidateTag('site-settings')
  revalidateTag('search')

  revalidatePath('/', 'layout')
  revalidatePath('/shop')
  revalidatePath('/product/[slug]', 'page')
  revalidatePath('/privacy-policy')
  revalidatePath('/return-policy')
  revalidatePath('/shipping-policy')
  return NextResponse.json({ revalidated: true, timestamp: Date.now() })
}
