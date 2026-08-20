import type { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from '../ui/sonner'
import { AuthRouteMiddleware } from '@/features/auth/components/AuthRouteMiddleware'
import { UserDashboardRouteMiddleware } from '@/features/auth/components/UserDashboardRouteMiddleware'
import { AdminRouteMiddleware } from '@/features/auth/components/AdminRouteMiddleware'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { url } = usePage()

  const pathname = url.split('?')[0]

  const isAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/')

  const isDashboardRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')

  const showPublicLayout =
    !isAdminRoute && !isDashboardRoute

  return (
    <div className="relative flex flex-col">
      {showPublicLayout && <Header />}

      <div
        className={
          isAdminRoute || isDashboardRoute
            ? 'relative'
            : 'relative overflow-y-hidden'
        }
      >
        <div className="flex-1 min-h-0">
          <Toaster position="top-right" />

          <AuthRouteMiddleware>
            <UserDashboardRouteMiddleware>
              <AdminRouteMiddleware>
                {children}
              </AdminRouteMiddleware>
            </UserDashboardRouteMiddleware>
          </AuthRouteMiddleware>
        </div>
      </div>

      {showPublicLayout && <Footer />}
    </div>
  )
}