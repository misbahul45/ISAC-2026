import type { ApiResponse } from '@/types/api'

export type FileReference = {
  id: string
  fileId: string
  url: string
  name?: string
}

export type ImageKitAuth = {
  token: string
  expire: number
  signature: string
}

export type RegisterFilePayload = {
  fileId: string
  url: string
}

export type RegisterFileResponse = ApiResponse<FileReference>
