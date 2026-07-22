import * as z from 'zod'
import type { CompetitionType } from '../types/registrationTypes'

export const registrasiTeamFormSchema = z.object({
  name: z.string().trim().min(3, 'Nama tim minimal 3 karakter.'),
  phone: z.string().trim().min(10, 'Nomor telepon minimal 10 digit.').max(20),
  institution_name: z.string().trim().min(3, 'Nama institusi minimal 3 karakter.'),
  province: z.string().trim().min(2, 'Provinsi wajib diisi.').max(100),
  city: z.string().trim().min(2, 'Kota atau kabupaten wajib diisi.').max(100),
  address: z.string().trim().min(5, 'Alamat lengkap minimal 5 karakter.').max(1000),
})

export const createRegistrasiTeamFormSchema = (
  competitionType: CompetitionType,
) =>
  registrasiTeamFormSchema.superRefine((values, context) => {
    const message = validateInstitution(
      values.institution_name,
      competitionType,
    )

    if (message) {
      context.addIssue({
        code: 'custom',
        path: ['institution_name'],
        message,
      })
    }
  })

export function validateInstitution(
  institutionName: string,
  competitionType: CompetitionType,
): string | null {
  const institution = institutionName.toLowerCase()
  const higherEducationKeywords = [
    'universitas',
    'university',
    'institut',
    'politeknik',
    'akademi',
    'sekolah tinggi',
    'college',
  ]
  const isHigherEducation = higherEducationKeywords.some((keyword) =>
    institution.includes(keyword),
  )
  const isHighSchool =
    /\b(sma|sman|smk|smkn|ma|man|mas)\b/u.test(institution) ||
    institution.includes('madrasah aliyah')

  if (competitionType === 'BUSINESS_IT_CASE' && !isHigherEducation) {
    return 'Business IT Case hanya diperuntukkan bagi mahasiswa.'
  }

  if (
    ['OLIMPIADE', 'BUSINESS_PLAN'].includes(competitionType) &&
    !isHighSchool
  ) {
    return 'Olimpiade dan Business Plan hanya diperuntukkan bagi siswa SMA, SMK, atau MA.'
  }

  return null
}

export type RegisterTeamFormInput = z.infer<
  typeof registrasiTeamFormSchema
>
