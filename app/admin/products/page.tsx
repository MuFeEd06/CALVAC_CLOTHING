import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getProducts, getCategories } from '@/lib/db'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts({ active: undefined }),
    getCategories(),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed font-900 text-4xl tracking-tight">Products</h1>
          <p className="text-[var(--gray-mid)] text-sm mt-1">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-600 text-sm hover:bg-[var(--orange)] transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link href="/admin/products" className="flex-shrink-0 px-4 py-1.5 rounded-full bg-black text-white text-xs font-600 tracking-wide">
          All ({products.length})
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/admin/products?category=${cat.slug}`}
            className="flex-shrink-0 px-4 py-1.5 rounded-full border border-[var(--gray-light)] text-xs font-600 tracking-wide hover:border-black transition-colors"
          >
            {cat.name} ({products.filter(p => p.category_id === cat.id).length})
          </Link>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--gray-light)]">
              <th className="text-left px-6 py-4 text-xs font-600 tracking-widest uppercase text-[var(--gray-mid)]">Product</th>
              <th className="text-left px-4 py-4 text-xs font-600 tracking-widest uppercase text-[var(--gray-mid)] hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-4 text-xs font-600 tracking-widest uppercase text-[var(--gray-mid)]">Price</th>
              <th className="text-left px-4 py-4 text-xs font-600 tracking-widest uppercase text-[var(--gray-mid)] hidden lg:table-cell">Stock</th>
              <th className="text-left px-4 py-4 text-xs font-600 tracking-widest uppercase text-[var(--gray-mid)] hidden lg:table-cell">Status</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-[var(--gray-mid)] text-sm">
                  No products yet.{' '}
                  <Link href="/admin/products/new" className="text-[var(--orange)] underline">Add your first product</Link>
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="border-b border-[var(--gray-light)] last:border-0 hover:bg-[#fafaf8] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-[var(--gray-light)] flex-shrink-0 overflow-hidden rounded">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--gray-mid)] text-[10px]">IMG</div>
                      )}
                    </div>
                    <div>
                      <p className="font-600 text-sm">{product.name}</p>
                      <p className="text-xs text-[var(--gray-mid)] mt-0.5">{product.sizes.join(', ')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-xs bg-[var(--gray-light)] px-2 py-1 rounded-full">
                    {product.category?.name ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-condensed font-700 text-base">₹{product.price.toLocaleString('en-IN')}</p>
                    {product.compare_price && (
                      <p className="text-xs text-[var(--gray-mid)] line-through">₹{product.compare_price.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className={`text-sm font-600 ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className={`text-[10px] font-600 px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.is_active ? 'Active' : 'Draft'}
                  </span>
                  {product.is_featured && (
                    <span className="ml-1.5 text-[10px] font-600 px-2.5 py-1 rounded-full uppercase tracking-wide bg-orange-100 text-orange-600">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="w-8 h-8 flex items-center justify-center border border-[var(--gray-light)] rounded-lg hover:border-black transition-colors"
                    >
                      <Pencil size={13} />
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
