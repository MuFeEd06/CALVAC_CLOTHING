'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/db'
import type { Product, Category, ProductColor, SiteSettings } from '@/types'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  settings?: SiteSettings | null
}

// Same slug logic as CollectionsSection + ShopFilters — must stay in sync
const toTagSlug = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default function ProductForm({ product, categories, settings }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    compare_price: product?.compare_price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    stock: product?.stock?.toString() ?? '0',
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    carousel_slot: (product as any)?.carousel_slot?.toString() ?? '',
    featured_moment_slot: (product as any)?.featured_moment_slot?.toString() ?? '',
    collection_tag: (product as any)?.collection_tag ?? '',
  })

  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? [])
  const [sizeInput, setSizeInput] = useState('')
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? [])
  const [colorForm, setColorForm] = useState({ name: '', hex: '#000000', price: '' })

  // ── Read collection tag names dynamically from settings ──
  // Falls back to hardcoded defaults if settings not loaded yet
  const collectionTagOptions: { slug: string; name: string }[] = (() => {
    try {
      const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
      const els: any[] = Array.isArray(pc?.collections?.elements) ? pc.collections.elements : []
      const defaults: Record<string, string> = {
        col1: 'Everyday Essentials 2026',
        col2: 'Timeless Classics 2026',
        col3: 'Seasonal Collections 2025',
      }
      return ['col1', 'col2', 'col3']
        .map(id => {
          const el = els.find((e: any) => e.id === id)
          const name = el?.content || defaults[id]
          const visible = el ? el.visible !== false : true
          return visible ? { slug: toTagSlug(name), name } : null
        })
        .filter(Boolean) as { slug: string; name: string }[]
    } catch {}
    return [
      { slug: toTagSlug('Everyday Essentials 2026'),  name: 'Everyday Essentials 2026' },
      { slug: toTagSlug('Timeless Classics 2026'),    name: 'Timeless Classics 2026' },
      { slug: toTagSlug('Seasonal Collections 2025'), name: 'Seasonal Collections 2025' },
    ]
  })()

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: product ? f.slug : generateSlug(name) }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const productId = product?.id ?? `temp-${Date.now()}`
      const urls = await Promise.all(files.map(f => uploadProductImage(f, productId)))
      setImages(prev => [...prev, ...urls])
    } catch (err) {
      alert('Image upload failed. Check Supabase storage settings.')
    } finally {
      setUploading(false)
    }
  }

  const addSize = () => {
    const s = sizeInput.trim().toUpperCase()
    if (s && !sizes.includes(s)) { setSizes(prev => [...prev, s]); setSizeInput('') }
  }

  const addColor = () => {
    if (!colorForm.name) return
    setColors(prev => [...prev, { name: colorForm.name, hex: colorForm.hex, price: colorForm.price ? Number(colorForm.price) : undefined }])
    setColorForm({ name: '', hex: '#000000', price: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        category_id: form.category_id || null,
        stock: Number(form.stock),
        is_featured: form.is_featured,
        is_active: form.is_active,
        carousel_slot: form.carousel_slot ? Number(form.carousel_slot) : null,
        featured_moment_slot: form.featured_moment_slot ? Number(form.featured_moment_slot) : null,
        collection_tag: form.collection_tag || null,
        images,
        sizes,
        colors,
        updated_at: new Date().toISOString(),
      }

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      alert(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <div className="grid md:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="md:col-span-2 space-y-5">

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Product Info</h2>
            <div>
              <label className="label">Product Name *</label>
              <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} required className="input" placeholder="e.g. Oversized Cargo Jacket" />
            </div>
            <div>
              <label className="label">URL Slug *</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required className="input font-mono text-sm" placeholder="oversized-cargo-jacket" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="input resize-none" placeholder="Describe the product..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" className="input" placeholder="2999" />
              </div>
              <div>
                <label className="label">Compare Price (₹)</label>
                <input type="number" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} min="0" className="input" placeholder="3999" />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Sizes</h2>
            <div className="flex gap-2">
              <input type="text" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} className="input flex-1" placeholder="e.g. S, M, L, XL, UK8..." />
              <button type="button" onClick={addSize} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-600">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['XS','S','M','L','XL','XXL'].map(s => (
                <button key={s} type="button" onClick={() => !sizes.includes(s) && setSizes(prev => [...prev, s])} className={`px-3 py-1 text-xs border rounded-full transition-colors ${sizes.includes(s) ? 'bg-black text-white border-black' : 'border-[var(--gray-light)] hover:border-black'}`}>{s}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <span key={s} className="flex items-center gap-1 bg-[var(--gray-light)] px-3 py-1 rounded-full text-sm font-500">
                  {s}<button type="button" onClick={() => setSizes(prev => prev.filter(x => x !== s))}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Colors</h2>
            <div className="flex gap-2 flex-wrap items-end">
              <div><label className="label">Name</label><input type="text" value={colorForm.name} onChange={e => setColorForm(f => ({ ...f, name: e.target.value }))} className="input w-32" placeholder="White" /></div>
              <div><label className="label">Color</label><input type="color" value={colorForm.hex} onChange={e => setColorForm(f => ({ ...f, hex: e.target.value }))} className="h-10 w-16 border border-[var(--gray-light)] rounded cursor-pointer" /></div>
              <div><label className="label">Price override (₹)</label><input type="number" value={colorForm.price} onChange={e => setColorForm(f => ({ ...f, price: e.target.value }))} className="input w-28" placeholder="Optional" /></div>
              <button type="button" onClick={addColor} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-600 mb-0.5">Add Color</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--gray-light)] px-3 py-2 rounded-xl">
                  <div className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                  <span className="text-sm font-500">{c.name}</span>
                  {c.price && <span className="text-xs text-[var(--gray-mid)]">₹{c.price}</span>}
                  <button type="button" onClick={() => setColors(prev => prev.filter((_, j) => j !== i))}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Images */}
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Images</h2>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-[var(--gray-light)] rounded-xl p-6 cursor-pointer hover:border-black transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={20} className="text-[var(--gray-mid)] mb-2" />
              <span className="text-xs text-[var(--gray-mid)] text-center">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square bg-[var(--gray-light)] rounded-lg overflow-hidden group">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-600">MAIN</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <h2 className="font-condensed font-800 text-lg">Organization</h2>
            <div>
              <label className="label">Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input">
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" className="input" />
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-black' : 'bg-[var(--gray-light)]'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-500">Active (visible on site)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))} className={`w-10 h-6 rounded-full transition-colors relative ${form.is_featured ? 'bg-[var(--orange)]' : 'bg-[var(--gray-light)]'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-500">Featured on homepage</span>
              </label>
            </div>
          </div>

          {/* Collection Carousel */}
          <div className="bg-white rounded-2xl p-5 space-y-3">
            <div>
              <h2 className="font-condensed font-800 text-lg">Collection Carousel</h2>
              <p className="text-xs text-[var(--gray-mid)] mt-1">Assign this product to a fixed slot in the homepage carousel.</p>
            </div>
            <div>
              <label className="label">Carousel Card Slot</label>
              <div className="grid grid-cols-4 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, carousel_slot: '' }))} className={`py-2 rounded-lg border text-xs font-600 transition-colors ${form.carousel_slot === '' ? 'bg-black text-white border-black' : 'border-[var(--gray-light)] hover:border-black text-[var(--gray-mid)]'}`}>None</button>
                {[1,2,3,4,5,6].map(slot => (
                  <button key={slot} type="button" onClick={() => setForm(f => ({ ...f, carousel_slot: String(slot), is_featured: true }))} className={`py-2 rounded-lg border text-xs font-600 transition-colors ${form.carousel_slot === String(slot) ? 'bg-[var(--orange)] text-white border-[var(--orange)]' : 'border-[var(--gray-light)] hover:border-[var(--orange)] hover:text-[var(--orange)]'}`}>Card {slot}</button>
                ))}
              </div>
              {form.carousel_slot && <p className="text-xs text-[var(--orange)] mt-2 font-500">✓ Assigned to Card {form.carousel_slot} · Featured automatically enabled</p>}
            </div>
          </div>

          {/* Featured Moments */}
          <div className="bg-white rounded-2xl p-5 space-y-3">
            <div>
              <h2 className="font-condensed font-800 text-lg">Featured Moments</h2>
              <p className="text-xs text-[var(--gray-mid)] mt-1">Assign this product to one of the 3 image slots in the Featured Moments section.</p>
            </div>
            <div>
              <label className="label">Image Slot</label>
              <div className="grid grid-cols-4 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, featured_moment_slot: '' }))} className={`py-2 rounded-lg border text-xs font-600 transition-colors ${form.featured_moment_slot === '' ? 'bg-black text-white border-black' : 'border-[var(--gray-light)] hover:border-black text-[var(--gray-mid)]'}`}>None</button>
                {[
                  { slot: '1', label: 'Main',  hint: 'Large left' },
                  { slot: '2', label: 'Thumb', hint: 'Small top' },
                  { slot: '3', label: 'Img 2', hint: 'Large btm' },
                ].map(({ slot, label, hint }) => (
                  <button key={slot} type="button" onClick={() => setForm(f => ({ ...f, featured_moment_slot: slot, is_featured: true }))} className={`py-2 rounded-lg border text-xs font-600 transition-colors flex flex-col items-center ${form.featured_moment_slot === slot ? 'bg-[var(--orange)] text-white border-[var(--orange)]' : 'border-[var(--gray-light)] hover:border-[var(--orange)] hover:text-[var(--orange)]'}`}>
                    <span>{label}</span><span className="text-[9px] font-400 opacity-70">{hint}</span>
                  </button>
                ))}
              </div>
              {form.featured_moment_slot && <p className="text-xs text-[var(--orange)] mt-2 font-500">✓ Assigned to slot {form.featured_moment_slot} · Featured automatically enabled</p>}
            </div>
          </div>

          {/* Collection Tag — names read from settings (admin page editor) */}
          <div className="bg-white rounded-2xl p-5 space-y-3">
            <div>
              <h2 className="font-condensed font-800 text-lg">Collection Tag</h2>
              <p className="text-xs text-[var(--gray-mid)] mt-1">Tag this product to a collection. Names stay in sync with the admin page editor → Collections section.</p>
            </div>
            <div>
              <label className="label">Assign to Collection</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, collection_tag: '' }))} className={`py-2 rounded-lg border text-xs font-600 transition-colors ${form.collection_tag === '' ? 'bg-black text-white border-black' : 'border-[var(--gray-light)] hover:border-black text-[var(--gray-mid)]'}`}>None</button>
                {collectionTagOptions.map(({ slug, name }) => (
                  <button key={slug} type="button" onClick={() => setForm(f => ({ ...f, collection_tag: slug }))} className={`py-2 px-2 rounded-lg border text-xs font-600 transition-colors text-left leading-tight ${form.collection_tag === slug ? 'bg-[var(--orange)] text-white border-[var(--orange)]' : 'border-[var(--gray-light)] hover:border-[var(--orange)] hover:text-[var(--orange)]'}`}>
                    {name}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--gray-mid)] mt-2 leading-relaxed">⚠ If you rename a collection in the page editor, re-tag your products so they still appear correctly.</p>
              {form.collection_tag && <p className="text-xs text-[var(--orange)] mt-1 font-500">✓ Tagged as: {form.collection_tag}</p>}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3.5 rounded-full font-condensed font-700 text-lg tracking-widest uppercase hover:bg-[var(--orange)] transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .label { @apply text-xs font-600 tracking-widest uppercase text-[var(--gray-dark)] block mb-1.5; }
        .input { @apply w-full border border-[var(--gray-light)] px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-transparent rounded-lg; }
      `}</style>
    </form>
  )
}
