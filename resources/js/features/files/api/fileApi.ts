import { getJson, postJson } from '@/lib/api'
import type {
  ImageKitAuth,
  RegisterFilePayload,
  RegisterFileResponse,
} from '../types/fileTypes'

export const fileApi = {
  imageKitAuth: () => getJson<ImageKitAuth>('/api/imagekit-auth'),
  register: (payload: RegisterFilePayload) =>
    postJson<RegisterFileResponse>('/api/files', payload),
}
