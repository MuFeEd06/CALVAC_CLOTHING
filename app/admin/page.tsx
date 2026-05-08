import { getProducts, getOrders, getCategories } from '@/lib/db'
import { Package, ShoppingBag, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [products, orders, categories] = await Promise.all([
    getProducts({ active: undefined }).catch(() => []),
    getOrders().catch(() => []),
    getCategories().catch(() => []),
  ])

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotal, 0)

  const recentOrders = orders.slice(0, 5)

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-orange-50 text-[var(--orange)]',
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: Tag,
      href: '/admin/products',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      href: '/admin/orders',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-condensed font-900 text-4xl tracking-tight">Dashboard</h1>
        <p className="text-[var(--gray-mid)] text-sm mt-1">Welcome back. Here's what's happening with CALVAC.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="font-condensed font-800 text-3xl">{stat.value}</div>
            <div className="text-xs text-[var(--gray-mid)] mt-0.5 tracking-wide">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-condensed font-800 text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--orange)] font-600 tracking-wide hover:underline">
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[var(--gray-mid)] text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-[var(--gray-light)] last:border-0">
                  <div>
                    <p className="font-600 text-sm">{order.order_number}</p>
                    <p className="text-xs text-[var(--gray-mid)]">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-condensed font-700 text-base">₹{order.subtotal.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-condensed font-800 text-xl mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--gray-light)] hover:border-black transition-colors group"
            >
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--orange)] transition-colors">
                <Package size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-600">Add New Product</p>
                <p className="text-xs text-[var(--gray-mid)]">Upload photos & details</p>
              </div>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--gray-light)] hover:border-black transition-colors group"
            >
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--orange)] transition-colors">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-600">Manage Orders</p>
                <p className="text-xs text-[var(--gray-mid)]">{orders.filter(o => o.status === 'pending').length} pending</p>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--gray-light)] hover:border-black transition-colors group"
            >
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--orange)] transition-colors">
                <Tag size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-600">Site Settings</p>
                <p className="text-xs text-[var(--gray-mid)]">WhatsApp, hero, branding</p>
              </div>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--gray-light)] hover:border-black transition-colors group"
            >
              <div className="w-9 h-9 bg-[var(--orange)] rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-600">View Live Site</p>
                <p className="text-xs text-[var(--gray-mid)]">Opens in new tab</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
