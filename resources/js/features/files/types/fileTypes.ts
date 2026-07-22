import type { ApiResponse } from '@/types/api'

export type FilePurpose = 'PAYMENT_PROOF' | 'MEMBER_PHOTO' | 'BATCH_MODULE' | 'SUBMISSION'
export type FileReference = { id: string; fileId: string; url: string; purpose?: FilePurpose; name?: string }
export type ImageKitAuth = { token: string; expire: number; signature: string }
export type RegisterFilePayload = { file_id: string; url: string; purpose: FilePurpose }
export type ImageKitAuthResponse = ApiResponse<ImageKitAuth>
export type RegisterFileResponse = ApiResponse<FileReference>
