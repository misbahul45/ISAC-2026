import { router, usePage } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useAuthSession } from '../context/AuthProvider'

export function AdminRouteMiddleware({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const { principal, isAuthenticated, isLoading } = useAuthSession()
  const isAdminRoute = url.split('?')[0].startsWith('/admin/')
  const redirectTo = !isAuthenticated
    ? '/auth/login'
    : principal?.principalType !== 'ADMIN'
      ? '/dashboard'
      : null

  useEffect(() => {
    if (isAdminRoute && !isLoading && redirectTo) {
      router.visit(redirectTo, { replace: true })
    }
  }, [isAdminRoute, isLoading, redirectTo])

  if (!isAdminRoute) return children

  if (isLoading || redirectTo) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary" role="status" aria-live="polite" aria-label="Memeriksa sesi admin">
        <Loader2 className="size-7 animate-spin" />
      </div>
    )
  }

  return children
}
