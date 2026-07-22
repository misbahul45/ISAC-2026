import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { getAuthToken, subscribeToAuthSession } from '../authStorage'
import type { AuthPrincipal } from '../types/authTypes'

type AuthContextValue = {
  principal: AuthPrincipal | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeToAuthSession, getAuthToken, () => null)
  const query = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => authApi.me(),
    enabled: Boolean(token),
    staleTime: 60_000,
  })

  return (
    <AuthContext.Provider
      value={{
        principal: query.data?.data ?? null,
        isAuthenticated: Boolean(token && query.data),
        isLoading: Boolean(token) && query.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthSession(): AuthContextValue {
  const value = useContext(AuthContext)
  if (value === null) {
    throw new Error('useAuthSession must be used inside AuthProvider')
  }

  return value
}
