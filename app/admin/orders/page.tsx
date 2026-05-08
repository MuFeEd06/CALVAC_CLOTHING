'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { getOrders, updateOrderStatus } from '@/lib/db'
import { buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp'
import type { Order } from '@/types'

const STATUS_OPTIONS: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getOrders().then(setOrders).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const handleWhatsApp = (order: Order) => {
    const items = order.items.map(i => ({
      product: { id: i.product_id, name: i.product_name, price: i.price, images: [i.product_image], colors: [], sizes: [] } as any,
      size: i.size,
      color: { name: i.color, hex: '#000' },
      quantity: i.quantity,
    }))
    const msg = buildWhatsAppMessage(items, order.customer_name, order.customer_phone, order.customer_address ?? '')
    openWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '', msg)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-condensed font-900 text-4xl tracking-tight">Orders</h1>
        <p className="text-[var(--gray-mid)] text-sm mt-1">{orders.length} total · {orders.filter(o => o.status === 'pending').length} pending</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', ...STATUS_OPTIONS] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-600 tracking-wide capitalize transition-colors ${
              filter === s ? 'bg-black text-white' : 'border border-[var(--gray-light)] hover:border-black'
            }`}
          >
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[var(--gray-mid)]">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--gray-mid)]">No orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#fafaf8] transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-condensed font-700 text-base">{order.order_number}</span>
                    <span className={`text-[10px] font-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    {(order as any).payment_method && (
                      <span className="text-[10px] font-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-gray-100 text-gray-600">
                        {(order as any).payment_method === 'whatsapp' ? '💬 WhatsApp' : (order as any).payment_method === 'cod' ? '📦 COD' : '💳 Online'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--gray-mid)] mt-0.5">
                    {order.customer_name} · {order.customer_phone} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-condensed font-700 text-xl">₹{order.subtotal.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-[var(--gray-mid)]">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[var(--gray-mid)] transition-transform flex-shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Expanded order details */}
              {expanded === order.id && (
                <div className="px-6 pb-5 border-t border-[var(--gray-light)]">
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Items */}
                    <div>
                      <h3 className="text-xs font-600 tracking-widest uppercase mb-3 text-[var(--gray-mid)]">Order Items</h3>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-[var(--gray-light)] flex-shrink-0 rounded overflow-hidden">
                              {item.product_image && (
                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-500 truncate">{item.product_name}</p>
                              <p className="text-xs text-[var(--gray-mid)]">{item.color} · {item.size} × {item.quantity}</p>
                            </div>
                            <p className="font-condensed font-700 text-base flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer + actions */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-600 tracking-widest uppercase mb-2 text-[var(--gray-mid)]">Customer</h3>
                        <p className="text-sm font-500">{order.customer_name}</p>
                        <p className="text-sm text-[var(--gray-mid)]">{order.customer_phone}</p>
                        {order.customer_address && <p className="text-sm text-[var(--gray-mid)] mt-1">{order.customer_address}</p>}
                      </div>

                      <div>
                        <h3 className="text-xs font-600 tracking-widest uppercase mb-2 text-[var(--gray-mid)]">Update Status</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              className={`px-3 py-1 rounded-full text-xs font-600 capitalize transition-colors ${
                                order.status === s ? 'bg-black text-white' : 'border border-[var(--gray-light)] hover:border-black'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleWhatsApp(order)}
                        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-600 hover:bg-[#1ebe59] transition-colors"
                      >
                        <MessageCircle size={15} />
                        Message Customer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
