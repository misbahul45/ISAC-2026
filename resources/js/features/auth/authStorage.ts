const AUTH_TOKEN_KEY = 'isac.authToken'
const AUTH_SESSION_EVENT = 'isac:auth-session-changed'

export function getAuthToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

export function subscribeToAuthSession(listener: () => void): () => void {
  window.addEventListener(AUTH_SESSION_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
