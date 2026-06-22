'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { signOutCurrentUser } from '@/lib/clientAuth'
import { manageStorePath } from '@/lib/routes'

const navItems = [
  { href: manageStorePath(), label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: manageStorePath('/products'), label: 'Products', icon: Package },
  { href: manageStorePath('/orders'), label: 'Orders', icon: ShoppingBag },
  { href: manageStorePath('/settings'), label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  const handleLogout = async () => {
    setOpen(false)
    setSignOutError('')
    try {
      await signOutCurrentUser()
      router.replace('/')
      router.refresh()
    } catch {
      setSignOutError('Unable to sign out. Please try again.')
    }
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--black)] flex items-center justify-between px-4">
        <div>
          <span className="font-condensed font-900 text-lg tracking-[4px] text-white">CALVAC</span>
          <p className="text-[9px] text-white/30 tracking-widest uppercase -mt-0.5">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white"
          aria-label="Open admin navigation"
        >
          <Menu size={18} />
        </button>
      </header>

      <button
        type="button"
        className={`md:hidden fixed inset-0 z-40 bg-black/45 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-label="Close admin navigation"
        aria-hidden={!open}
      />

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-56 bg-[var(--black)] flex flex-col py-6 flex-shrink-0 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Logo */}
      <div className="px-5 mb-8 flex items-start justify-between gap-4">
        <div>
          <span className="font-condensed font-900 text-xl tracking-[4px] text-white">CALVAC</span>
          <p className="text-[10px] text-white/30 tracking-widest uppercase mt-0.5">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-white/70"
          aria-label="Close admin navigation"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              {item.label}
              {item.href === manageStorePath('/orders') && (
                <span className="ml-auto w-5 h-5 bg-[var(--orange)] rounded-full text-[10px] font-700 flex items-center justify-center text-white">!</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 space-y-1 mt-4">
        <Link
          href="/"
          target="_blank"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={16} />
          View Site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        {signOutError && (
          <p className="px-3 text-xs text-red-300 leading-snug">{signOutError}</p>
        )}
      </div>
      </aside>
    </>
  )
}
