import * as z from 'zod'

export const competitionTypeSchema = z.enum([
  'OLIMPIADE',
  'BUSINESS_PLAN',
  'BUSINESS_IT_CASE',
])

export const addressSchema = z.object({
  province: z
    .string()
    .trim()
    .min(1, { message: 'Provinsi wajib diisi' }),

  city: z
    .string()
    .trim()
    .min(1, { message: 'Kota/Kabupaten wajib diisi' }),

  address: z
    .string()
    .trim()
    .min(3, { message: 'Alamat lengkap wajib diisi' }),
})

export const registrasiTeamFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: 'Nama tim minimal 3 karakter.' }),

    school_name: z
      .string()
      .trim()
      .min(3, { message: 'Nama institusi minimal 3 karakter.' }),

    competition_type: competitionTypeSchema,

    province: addressSchema.shape.province,

    city: addressSchema.shape.city,

    address: addressSchema.shape.address,
  })
  .superRefine((data, ctx) => {
    validateInstitution(data.school_name, data.competition_type, ctx)
  })

export const registrasiTeamSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: 'Nama tim minimal 3 karakter.' }),

    school_name: z
      .string()
      .trim()
      .min(3, { message: 'Nama institusi minimal 3 karakter.' }),

    competition_type: competitionTypeSchema,

    school_address: z
      .string()
      .min(1, { message: 'Alamat institusi wajib diisi.' }),
  })
  .superRefine((data, ctx) => {
    try {
      const parsed = JSON.parse(data.school_address)
      addressSchema.parse(parsed)
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['school_address'],
        message: 'Format alamat institusi tidak valid.',
      })
    }

    validateInstitution(data.school_name, data.competition_type, ctx)
  })

function validateInstitution(
  schoolName: string,
  competitionType: z.infer<typeof competitionTypeSchema>,
  ctx: z.RefinementCtx,
) {
  const school = schoolName.toLowerCase()

  const higherEducationKeywords = [
    'universitas',
    'university',
    'univ',
    'institut',
    'politeknik',
    'poltek',
    'akademi',
    'vokasi',
    'd3',
    'd4',
    's1',
  ]

  const highSchoolKeywords = [
    'sma',
    'smk',
    'ma',
    'madrasah aliyah',
  ]

  const isHigherEducation = higherEducationKeywords.some((keyword) =>
    school.includes(keyword),
  )

  const isHighSchool = highSchoolKeywords.some((keyword) =>
    school.includes(keyword),
  )

  if (
    competitionType === 'BUSINESS_IT_CASE' &&
    !isHigherEducation
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['school_name'],
      message:
        'Business IT Case hanya diperuntukkan bagi mahasiswa Universitas, Institut, Politeknik, Akademi, D3, D4, atau S1.',
    })
  }

  if (
    ['OLIMPIADE', 'BUSINESS_PLAN'].includes(competitionType) &&
    !isHighSchool
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['school_name'],
      message:
        'Olimpiade dan Business Plan hanya diperuntukkan bagi siswa SMA, SMK, atau MA.',
    })
  }
}

export type RegisterTeamFormInput = z.infer<
  typeof registrasiTeamFormSchema
>

export type RegisterInput = z.infer<
  typeof registrasiTeamSchema
>

export type AddressInput = z.infer<typeof addressSchema>