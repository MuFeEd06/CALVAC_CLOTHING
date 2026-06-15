import type { Metadata } from 'next'
import PolicyPageView from '@/components/layout/PolicyPageView'
import { CATALOG_REVALIDATE_SECONDS, getCachedCategories, getCachedSiteSettings } from '@/lib/cachedDb'
import { getPolicyContent } from '@/lib/siteSettings'

export const metadata: Metadata = { title: 'Return Policy - CALVAC' }
export const revalidate = CATALOG_REVALIDATE_SECONDS

export default async function ReturnPolicyPage() {
  const [settings, categories] = await Promise.all([
    getCachedSiteSettings().catch(() => null),
    getCachedCategories().catch(() => []),
  ])

  return (
    <PolicyPageView
      settings={settings}
      categories={categories}
      policy={getPolicyContent(settings, 'return')}
      eyebrow="CALVAC Policy"
    />
  )
}
