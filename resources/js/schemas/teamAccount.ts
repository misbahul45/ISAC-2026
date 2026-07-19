import { z } from 'zod'

export const competitionTypeSchema = z.enum([
  'OLIMPIADE',
  'BUSINESS_PLAN',
  'BUSINESS_IT_CASE',
])

export type CompetitionType = z.infer<typeof competitionTypeSchema>

export const teamDetailSchema = z.object({
  name: z.string().min(1, 'Nama tim wajib diisi'),
  school_name: z.string().min(1, 'Nama institusi wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  competition_type: competitionTypeSchema,
})

export type TeamDetailInput = z.infer<typeof teamDetailSchema>

export const memberDetailSchema = z.object({
  id: z.number(),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  nomorTelepon: z.string().min(1, 'Nomor telepon wajib diisi'),
  jenjangPendidikan: z.string().min(1, 'Jenjang pendidikan wajib diisi'),
})

export type MemberDetailInput = z.infer<typeof memberDetailSchema>

export const teamAccountSchema = z.object({
  team: teamDetailSchema,
  members: z.array(memberDetailSchema).min(1),
  approvedAt: z.string().nullable(),
})

export type TeamAccountData = z.infer<typeof teamAccountSchema>
