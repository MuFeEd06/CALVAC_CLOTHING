import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCategories, getSiteSettings } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const [{ data: product }, categories, settings] = await Promise.all([
    supabase.from('products').select('*, category:categories(*)').eq('id', params.id).single(),
    getCategories(),
    getSiteSettings().catch(() => null),
  ])

  if (!product) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-[var(--gray-mid)] hover:text-black transition-colors">
          <ChevronLeft size={16} /> Products
        </Link>
        <span className="text-[var(--gray-light)]">/</span>
        <h1 className="font-condensed font-900 text-4xl tracking-tight">Edit: {product.name}</h1>
      </div>
      <ProductForm product={product} categories={categories} settings={settings} />
    </div>
  )
}
