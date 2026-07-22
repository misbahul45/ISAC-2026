import { getJson, postJson } from '@/lib/api'
import type { ImageKitAuthResponse, RegisterFilePayload, RegisterFileResponse } from '../types/fileTypes'

export const fileApi = {
  imageKitAuth: () => getJson<ImageKitAuthResponse>('/api/imagekit-auth'),
  register: (payload: RegisterFilePayload) => postJson<RegisterFileResponse>('/api/files', payload),
}
