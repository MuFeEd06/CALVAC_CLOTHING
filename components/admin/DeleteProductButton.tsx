'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) { alert('Failed to delete'); setLoading(false); return }
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} disabled={loading} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-600">
          {loading ? '...' : 'Yes'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-[10px] border px-2 py-1 rounded font-600">No</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-8 h-8 flex items-center justify-center border border-[var(--gray-light)] rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={13} />
    </button>
  )
}
