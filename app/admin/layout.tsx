import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { getUser, isAdminUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

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
