import * as z from 'zod'

export const memberSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama minimal 3 karakter'),
  nomorTelepon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  jenjangPendidikan: z.string().min(2, 'Jenjang pendidikan wajib diisi'),
})

export type MemberFormData = z.infer<typeof memberSchema>