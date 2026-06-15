import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
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
