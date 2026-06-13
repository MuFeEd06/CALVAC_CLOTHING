import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { isAdminUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabaseConfig = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey)

  if (!hasSupabaseConfig) redirect('/admin/login')

  const supabaseUrl = configuredSupabaseUrl ?? 'http://127.0.0.1:54321'
  const supabaseAnonKey = configuredSupabaseAnonKey ?? 'supabase-anon-key-placeholder'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  if (!isAdminUser(user)) redirect('/admin/login')

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
      <style>{`
        .admin-shell {
          display: flex;
          height: 100vh;
          background: #f0efed;
          overflow: hidden;
        }

        .admin-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }

        @media (max-width: 767px) {
          .admin-shell {
            display: block;
            min-height: 100dvh;
            height: auto;
            overflow: visible;
            padding-top: 56px;
          }

          .admin-main {
            min-height: calc(100dvh - 56px);
            overflow: visible;
          }
        }
      `}</style>
    </div>
  )
}
