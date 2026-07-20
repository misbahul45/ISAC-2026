import { z } from 'zod'

const googleDriveUrl = z
  .string()
  .trim()
  .min(1, 'Link Google Drive wajib diisi')
  .url('URL tidak valid')
  .refine((value) => {
    try {
      return new URL(value).hostname === 'drive.google.com'
    } catch {
      return false
    }
  }, 'Link harus berasal dari Google Drive')

export const documentSchema = z.object({
  document_url: googleDriveUrl,
  twibbon_url: googleDriveUrl,
})

export type DocumentFormData = z.infer<typeof documentSchema>
