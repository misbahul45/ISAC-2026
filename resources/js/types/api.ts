export type ApiStatus = 'success' | 'error'

export type ApiFieldErrors = Record<string, string[]>

export type ApiErrorDetail = {
  code: string
  fields?: ApiFieldErrors
}

export type ApiMetadata = Record<string, unknown>

export type ApiResponse<T> = {
  status: ApiStatus
  message: string
  data: T
  metadata?: ApiMetadata
  error?: ApiErrorDetail | null
}

export type PaginationLinks = {
  first: string | null
  last: string | null
  previous: string | null
  next: string | null
}

export type PaginationMeta = {
  currentPage: number
  from: number | null
  lastPage: number
  path: string
  perPage: number
  to: number | null
  total: number
}

export type PaginatedData<T> = {
  items: T[]
  links: PaginationLinks
  meta: PaginationMeta
}

export type PaginationQuery = {
  page?: number
  perPage?: number
  search?: string
}

export type RedirectData = {
  redirectTo: string
}

