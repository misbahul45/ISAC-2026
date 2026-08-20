import type { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import Header from './Header'
import Footer from './Footer'
import { IMAGES } from '@/constants/general'
import { Toaster } from '../ui/sonner'
import { AuthRouteMiddleware } from '@/features/auth/components/AuthRouteMiddleware'
import { UserDashboardRouteMiddleware } from '@/features/auth/components/UserDashboardRouteMiddleware'
import { AdminRouteMiddleware } from '@/features/auth/components/AdminRouteMiddleware'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { url } = usePage()
  const isAdminRoute = url.split('?')[0].startsWith('/admin/')
  const isDashboard=url.split('?')[0].startsWith('/dashboard')

  return (
    <div className="relative flex flex-col">
      {(!isAdminRoute || !isDashboard) && <Header />}
     <div className={isAdminRoute ? 'relative' : 'relative overflow-y-hidden'}>
      <div className="flex-1 min-h-0">
        <Toaster position='top-right' />
          <AuthRouteMiddleware>
            <UserDashboardRouteMiddleware>
              <AdminRouteMiddleware>{children}</AdminRouteMiddleware>
            </UserDashboardRouteMiddleware>
          </AuthRouteMiddleware>
        </div>
      </div>
      {(!isAdminRoute || !isDashboard) && <Footer />}
    </div>
  )
}
