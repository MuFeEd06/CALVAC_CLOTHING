import { getCategories, getSiteSettings } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings().catch(() => null),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-[var(--gray-mid)] hover:text-black transition-colors">
          <ChevronLeft size={16} /> Products
        </Link>
        <span className="text-[var(--gray-light)]">/</span>
        <h1 className="font-condensed font-900 text-4xl tracking-tight">New Product</h1>
      </div>
      <ProductForm categories={categories} settings={settings} />
    </div>
  )
}
