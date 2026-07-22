import { z } from 'zod'
import type { ParticipantCategory } from '../types/registrationTypes'

export const createMemberSchema = (participantCategory: ParticipantCategory) => {
  const isUniversity = participantCategory === 'UNIVERSITY_STUDENT'
  const identityLabel = isUniversity ? 'NIM' : 'NISN'
  const identitySchema = z
    .string()
    .trim()
    .min(3, `${identityLabel} minimal 3 karakter`)
    .max(50, `${identityLabel} maksimal 50 karakter`)

  return z.object({
    name: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
    email: z.string().trim().min(1, 'Email peserta wajib diisi').email('Format email tidak valid'),
    major: isUniversity
      ? z.string().trim().min(2, 'Jurusan wajib diisi untuk mahasiswa')
      : z.string().trim(),
    faculty: isUniversity
      ? z.string().trim().min(2, 'Fakultas wajib diisi untuk mahasiswa')
      : z.string().trim(),
    student_id: identitySchema,
    photo_file_id: z.string().nullable(),
  })
}

export type MemberFormData = z.infer<ReturnType<typeof createMemberSchema>>
