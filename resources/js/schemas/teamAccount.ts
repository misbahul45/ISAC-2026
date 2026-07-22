import { z } from 'zod'

export const competitionTypeSchema = z.enum([
  'OLIMPIADE',
  'BUSINESS_PLAN',
  'BUSINESS_IT_CASE',
])

export type CompetitionType = z.infer<typeof competitionTypeSchema>

export const teamDetailSchema = z.object({
  name: z.string().min(1, 'Nama tim wajib diisi'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  institution_name: z.string().min(1, 'Nama institusi wajib diisi'),
})

export type TeamDetailInput = z.infer<typeof teamDetailSchema>

export const memberDetailSchema = z.object({
  id: z.number(),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Email tidak valid'),
  nomorIdentitas: z.string().min(1, 'NISN atau NIM wajib diisi'),
  jurusan: z.string().nullable(),
  fakultas: z.string().nullable(),
})

export type MemberDetailInput = z.infer<typeof memberDetailSchema>

export const teamAccountSchema = z.object({
  team: teamDetailSchema,
  members: z.array(memberDetailSchema).min(1),
  approvedAt: z.string().nullable(),
})

export type TeamAccountData = z.infer<typeof teamAccountSchema>
