import { z } from 'zod'

export const memberSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter'),
  email: z.string().trim().email('Email tidak valid'),
  phone: z.string().trim().min(10, 'Nomor telepon minimal 10 digit'),
  education_level: z.string().trim().min(2, 'Jenjang pendidikan wajib diisi'),
  major: z.string().trim(),
  faculty: z.string().trim(),
  student_id: z.string().trim().min(3, 'NISN atau NIM wajib diisi'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  photo_file_id: z.string().nullable(),
})

export type MemberFormData = z.infer<typeof memberSchema>
