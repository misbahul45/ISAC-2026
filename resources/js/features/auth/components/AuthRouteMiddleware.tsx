import { router, usePage } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useAuthSession } from '../context/AuthProvider'

type AuthRouteMiddlewareProps = {
  children: ReactNode
}

export function AuthRouteMiddleware({ children }: AuthRouteMiddlewareProps) {
  const { url } = usePage()
  const { principal, isAuthenticated, isLoading } = useAuthSession()
  const pathname = url.split('?')[0]
  const isAuthRoute = pathname.startsWith('/auth/')
  const isUnverifiedTeam =
    principal?.principalType === 'TEAM' && principal.team.emailVerifiedAt === null
  const canAccessEmailVerification =
    pathname === '/auth/verify-email' && isUnverifiedTeam
  const shouldRedirect =
    isAuthRoute && isAuthenticated && !canAccessEmailVerification

  const redirectTo =
    principal?.principalType === 'ADMIN'
      ? '/admin/dashboard'
      : isUnverifiedTeam
        ? '/auth/verify-email'
        : principal?.principalType === 'TEAM'
          ? principal.team.nextRedirect || '/dashboard'
          : '/'

  useEffect(() => {
    if (!isLoading && shouldRedirect) {
      router.visit(redirectTo, { replace: true })
    }
  }, [isLoading, redirectTo, shouldRedirect])

  if (!isAuthRoute) {
    return children
  }

  if (isLoading || shouldRedirect) {
    return (
      <div
        className='flex min-h-screen items-center justify-center text-primary'
        role='status'
        aria-live='polite'
        aria-label='Memeriksa sesi akun'
      >
        <Loader2 className='size-7 animate-spin' />
      </div>
    )
  }

  return children
}
