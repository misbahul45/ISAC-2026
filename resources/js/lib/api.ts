import type { ApiFieldErrors } from '@/types/api'

type ApiErrorBody = {
  message?: string
  errors?: ApiFieldErrors
  error?: {
    code?: string
    fields?: ApiFieldErrors
  }
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code?: string
  readonly fields: ApiFieldErrors
  readonly retryAfter?: number

  constructor(
    message: string,
    status: number,
    code?: string,
    fields: ApiFieldErrors = {},
    retryAfter?: number,
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.fields = fields
    this.retryAfter = retryAfter
  }
}

export function getCsrfToken(): string {
  return (
    document
      .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.getAttribute('content') ?? ''
  )
}

export async function requestJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const csrfToken = getCsrfToken()
  if (csrfToken) {
    headers.set('X-CSRF-TOKEN', csrfToken)
  }

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers,
  })

  if (response.redirected) {
    const target = new URL(response.url)
    return {
      status: 'success',
      message: 'Permintaan berhasil diproses.',
      data: {
        redirectTo: `${target.pathname}${target.search}${target.hash}`,
      },
      metadata: {},
      error: null,
    } as T
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null
    const fields = errorBody?.error?.fields ?? errorBody?.errors ?? {}
    const firstFieldMessage = Object.values(fields).flat()[0]
    const retryAfterValue = response.headers.get('Retry-After')
    const retryAfter = retryAfterValue ? Number(retryAfterValue) : undefined

    const fallbackMessage = response.status === 429 && retryAfter
      ? `Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik.`
      : 'Permintaan gagal diproses.'

    throw new ApiClientError(
      firstFieldMessage ?? errorBody?.message ?? fallbackMessage,
      response.status,
      errorBody?.error?.code,
      fields,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    )
  }

  return body as T
}

export const fetchJson = requestJson

export function getJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  return requestJson<T>(url, { ...options, method: 'GET' })
}

export function postJson<T>(
  url: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(url, {
    ...options,
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function putJson<T>(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function patchJson<T>(
  url: string,
  body: unknown,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  return requestJson<T>(url, { ...options, method: 'DELETE' })
}

export function toSearchParams(
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  const params = new URLSearchParams()

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}
