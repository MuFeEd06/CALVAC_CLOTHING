import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  // Revalidate the homepage and all pages that use site_settings
  revalidatePath('/', 'layout')
  revalidatePath('/shop')
  return NextResponse.json({ revalidated: true, timestamp: Date.now() })
}
