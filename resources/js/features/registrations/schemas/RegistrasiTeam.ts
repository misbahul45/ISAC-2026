import * as z from 'zod'
import type { CompetitionType } from '../types/registrationTypes'

export const registrasiTeamFormSchema = z.object({
  name: z.string().trim().min(3, 'Nama tim minimal 3 karakter.'),
  phone: z.string().trim().min(10, 'Nomor telepon minimal 10 digit.').max(20),
  school_name: z.string().trim().min(3, 'Nama institusi minimal 3 karakter.'),
  school_province: z.string().trim().min(1, 'Provinsi wajib diisi.'),
  school_city: z.string().trim().min(1, 'Kota/Kabupaten wajib diisi.'),
  school_address: z.string().trim().min(3, 'Alamat lengkap wajib diisi.'),
})

export function validateInstitution(
  schoolName: string,
  competitionType: CompetitionType,
): string | null {
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
  const highSchoolKeywords = ['sma', 'smk', 'ma', 'madrasah aliyah']
  const isHigherEducation = higherEducationKeywords.some((keyword) =>
    school.includes(keyword),
  )
  const isHighSchool = highSchoolKeywords.some((keyword) =>
    school.includes(keyword),
  )

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
