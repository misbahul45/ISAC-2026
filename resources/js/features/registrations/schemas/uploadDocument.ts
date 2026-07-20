import { z } from 'zod'

export const documentSchema = z.object({
  documentUrl: z
    .string()
    .min(1, 'Link Google Drive kelengkapan pendaftaran wajib diisi')
    .regex(
      /^https:\/\/drive\.google\.com\/.*$/,
      'Link harus berupa URL Google Drive yang valid'
    ),
  twibbonUrl: z
    .string()
    .min(1, 'Link Google Drive twibbon peserta wajib diisi')
    .regex(
      /^https:\/\/drive\.google\.com\/.*$/,
      'Link harus berupa URL Google Drive yang valid'
    ),
})

export type DocumentFormData = z.infer<typeof documentSchema>
