import { router, usePage } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useAuthSession } from '../context/AuthProvider'

type UserDashboardRouteMiddlewareProps = {
  children: ReactNode
}

export function UserDashboardRouteMiddleware({
  children,
}: UserDashboardRouteMiddlewareProps) {
  const { url } = usePage()
  const { principal, isAuthenticated, isLoading } = useAuthSession()
  const isUserDashboard = url.split('?')[0] === '/dashboard'

  const redirectTo = !isAuthenticated
    ? '/auth/login'
    : principal?.principalType === 'ADMIN'
      ? '/admin/dashboard'
      : principal?.principalType === 'TEAM' &&
          principal.team.nextRedirect !== '/dashboard'
        ? principal.team.nextRedirect
        : null

  useEffect(() => {
    if (isUserDashboard && !isLoading && redirectTo) {
      router.visit(redirectTo, { replace: true })
    }
  }, [isLoading, isUserDashboard, redirectTo])

  if (!isUserDashboard) return children

  if (isLoading || redirectTo) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-primary"
        role="status"
        aria-live="polite"
        aria-label="Memeriksa progres registrasi"
      >
        <Loader2 className="size-7 animate-spin" />
      </div>
    )
  }

  return children
}
